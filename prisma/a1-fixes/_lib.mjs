// ─────────────────────────────────────────────────────────────────────────────
// Заминаи умумии ҳамаи скриптҳои ислоҳи A1.
//
// ⚠️ ҲАМА СКРИПТҲО ПЕШФАРЗ **DRY-RUN** ҲАСТАНД.
//    Бе `--apply` ҳеҷ як `UPDATE` фиристода намешавад — танҳо диффи пурра
//    чоп мешавад. Ин қасдан аст: ҳар як ислоҳи мазмун бояд аз чашми одам
//    гузарад, чунки «ислоҳи» худкори матни тоҷикӣ аллакай як бор боиси
//    боги «душанбе → Душанбе (шаҳр)» шудааст.
//
// Драйвер: `@neondatabase/serverless` (HTTP/443). Prisma аз мошинҳои маҳаллӣ
// ба Neon намерасад — порти 5432 баста аст.
//
// Се доми драйвери HTTP, ки дар ин ҷо ҳал шудаанд:
//   1. `sql.query()` барои UPDATE массиви ХОЛӢ бармегардонад — `rowCount`
//      нест. Шумораи сатрҳо бояд ҷудогона санҷида шавад.
//   2. Сутуни `jsonb` (масалан `GrammarExercise.options`,
//      `ComprehensionQuestion.options`) массиви JS-ро мустақим қабул
//      намекунад — `JSON.stringify(...)::jsonb` лозим аст.
//   3. `updatedAt`-и `timestamp without time zone` ҳамчун UTC хонда мешавад.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(HERE, '../../.env');

/** Курси англисӣ A1 (en → tg). */
export const COURSE_EN_A1 = 'cmqkvhu8p0001o5r7nkbeo4jm';

export function connect() {
  const env = fs.readFileSync(ENV_PATH, 'utf8');
  const m = env.match(/^DATABASE_URL="([^"]+)"/m);
  if (!m) throw new Error('DATABASE_URL дар .env ёфт нашуд');
  return neon(m[1]);
}

/** `--apply` дар аргументҳо ҳаст? Бе он ҳеҷ чиз навишта намешавад. */
export const APPLY = process.argv.includes('--apply');

export const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;
export const RED = (s) => `\x1b[31m${s}\x1b[0m`;
export const GREEN = (s) => `\x1b[32m${s}\x1b[0m`;
export const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

/**
 * Ҳисобкунаки тағйирот + чопи диффи «пеш → баъд».
 * Ҳар скрипт ҳамин синфро истифода мебарад, то формати гузориш якхела бошад.
 */
export class Changes {
  constructor(title) {
    this.title = title;
    this.rows = [];
    this.skipped = [];
  }

  /** @param {{table:string,id:string,field:string,from:any,to:any,where:string}} c */
  add(c) {
    if (String(c.from) === String(c.to)) {
      this.skipped.push(c);
      return false;
    }
    this.rows.push(c);
    return true;
  }

  print() {
    console.log('\n' + BOLD('═'.repeat(78)));
    console.log(BOLD(this.title));
    console.log(BOLD('═'.repeat(78)));
    if (!this.rows.length) {
      console.log(DIM('  Чизе барои тағйир нест.'));
      return;
    }
    let lastWhere = '';
    for (const r of this.rows) {
      if (r.where !== lastWhere) {
        console.log(`\n  ${BOLD(r.where)}`);
        lastWhere = r.where;
      }
      console.log(`    ${DIM(r.table + '.' + r.field)}`);
      console.log(`      ${RED('- ' + String(r.from).replace(/\n/g, '\\n'))}`);
      console.log(`      ${GREEN('+ ' + String(r.to).replace(/\n/g, '\\n'))}`);
    }
    console.log(`\n  ${BOLD(`ҶАМЪ: ${this.rows.length} тағйир`)}` +
      (this.skipped.length ? DIM(`  (${this.skipped.length} аллакай дуруст)`) : ''));
  }

  /** SQL-и такроршаванда — барои санҷиши дастӣ ё иҷро дар як ҷои дигар. */
  toSql() {
    return this.rows
      .map((r) => `UPDATE "${r.table}" SET "${r.field}" = ${quote(r.to)} WHERE id = '${r.id}';`)
      .join('\n');
  }

  writeSql(file) {
    const header =
      `-- ${this.title}\n` +
      `-- Сохта шуд: ${new Date().toISOString()}\n` +
      `-- Сатрҳо: ${this.rows.length}\n` +
      `-- ⚠️ Пеш аз иҷро аз базаи продакшн нусхаи эҳтиётӣ гиред.\n\n` +
      'BEGIN;\n';
    fs.writeFileSync(file, header + this.toSql() + '\n\nCOMMIT;\n', 'utf8');
    console.log(DIM(`  SQL навишта шуд: ${file}`));
  }

  async apply(sql) {
    if (!APPLY) {
      console.log(
        `\n  ${BOLD('DRY-RUN')} — ҳеҷ чиз навишта нашуд. ` +
        `Барои иҷро: ${BOLD('node <скрипт> --apply')}`
      );
      return 0;
    }
    let n = 0;
    for (const r of this.rows) {
      await sql.query(
        `UPDATE "${r.table}" SET "${r.field}" = $1 WHERE id = $2`,
        [r.to, r.id]
      );
      n++;
    }
    console.log(`\n  ${GREEN(`✓ ${n} сатр навсозӣ шуд`)}`);
    return n;
  }
}

function quote(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

/** Тамоми курсро бо ҳамаи ҷузъҳояш мехонад (танҳо SELECT). */
export async function loadCourse(sql, courseId = COURSE_EN_A1) {
  const modules = await sql`SELECT * FROM "Module" WHERE "courseId"=${courseId} ORDER BY "order"`;
  for (const mod of modules) {
    mod.lessons = await sql`SELECT * FROM "Lesson" WHERE "moduleId"=${mod.id} ORDER BY "order"`;
    for (const L of mod.lessons) {
      L.words = await sql`SELECT * FROM "Word" WHERE "lessonId"=${L.id} ORDER BY "order", id`;
      if (L.grammarTopicId) {
        const [t] = await sql`SELECT * FROM "GrammarTopic" WHERE id=${L.grammarTopicId}`;
        if (t) {
          t.examples = await sql`SELECT * FROM "GrammarExample" WHERE "topicId"=${t.id} ORDER BY "order"`;
          t.rules = await sql`SELECT * FROM "GrammarRule" WHERE "topicId"=${t.id} ORDER BY "order"`;
          t.exercises = await sql`SELECT * FROM "GrammarExercise" WHERE "topicId"=${t.id} ORDER BY "order"`;
        }
        L.grammarTopic = t;
      }
      if (L.dialogueId) {
        const [d] = await sql`SELECT * FROM "Dialogue" WHERE id=${L.dialogueId}`;
        if (d) d.lines = await sql`SELECT * FROM "DialogueLine" WHERE "dialogueId"=${d.id} ORDER BY "order"`;
        L.dialogue = d;
      }
      if (L.comprehensionId) {
        const [c] = await sql`SELECT * FROM "ComprehensionExercise" WHERE id=${L.comprehensionId}`;
        if (c) c.questions = await sql`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order"`;
        L.comprehension = c;
      }
    }
  }
  return modules;
}

/** «M4·Д6» — ишораи ягонаи ҷойгоҳ дар ҳамаи гузоришҳо. */
export const loc = (mod, lesson) => `M${mod.order + 1}·Д${lesson.order + 1} «${lesson.titleTranslated}»`;

/**
 * Ҳудуди калима барои хати кириллӣ.
 * ⚠️ `\b`-и JS бо кириллӣ КОР НАМЕКУНАД (он танҳо [A-Za-z0-9_]-ро ҳарф
 * мешуморад), пас ҳар ҷустуҷӯи «калимаи пурра» бояд аз ин ҷо гузарад.
 */
export const wordRe = (alternatives, flags = 'giu') =>
  new RegExp(`(^|[^\\p{L}])(${alternatives})([^\\p{L}]|$)`, flags);
