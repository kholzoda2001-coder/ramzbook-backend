const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile();

function tuneDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;
  const url = new URL(process.env.DATABASE_URL);
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1');
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '60');
  process.env.DATABASE_URL = url.toString();
}

tuneDatabaseUrl();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const targetCode = process.argv[2] || 'en';
const nativeCode = process.argv[3] || 'tg';

const requiredSkills = ['vocab', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'review'];
const requiredModuleTitles = [
  'Alphabet & Sounds',
  'Greetings & Introductions',
  'Numbers, Time & Dates',
  'Me & Family',
  'Colors, Objects & Classroom',
  'Food & Drink',
  'My Day',
  'Home & Rooms',
  'Clothes & Weather',
  'Transport & Travel',
  'Health & Help',
  'Work & School',
  'Places & Directions',
  'Ability & Now',
  'Writing & Listening',
  'Shopping & Review',
];
const checkpointModuleTitles = new Set([
  'Greetings & Introductions',
  'Me & Family',
  'Food & Drink',
  'Home & Rooms',
  'Clothes & Weather',
  'Transport & Travel',
  'Health & Help',
  'Work & School',
  'Places & Directions',
  'Shopping & Review',
]);
const minimumSkillCounts = {
  vocab: 28,
  grammar: 21,
  reading: 9,
  listening: 14,
  speaking: 17,
  writing: 11,
  review: 11,
};
const finalExamTitles = new Set([
  'A1 Listening Exam',
  'A1 Writing Exam',
  'A1 Speaking Exam',
  'A1 Final Mastery Test',
]);

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

async function main() {
  const target = await prisma.language.findUnique({ where: { code: targetCode } });
  const native = await prisma.language.findUnique({ where: { code: nativeCode } });

  if (!target || !native) {
    throw new Error(`Language pair not found: ${nativeCode} -> ${targetCode}`);
  }

  const course = await prisma.course.findUnique({
    where: {
      targetLanguageId_nativeLanguageId_level: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: 'A1',
      },
    },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              words: true,
              grammarTopic: true,
              phraseCollection: true,
              dialogue: true,
              comprehension: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new Error(`A1 course not found for ${nativeCode} -> ${targetCode}`);
  }

  const issues = [];
  const warnings = [];
  const skillCounts = Object.fromEntries(requiredSkills.map((skill) => [skill, 0]));
  let totalLessons = 0;
  let totalWords = 0;

  if (course.modules.length < requiredModuleTitles.length) {
    issues.push(`A1 has ${course.modules.length} modules; expected at least ${requiredModuleTitles.length} full A1 modules.`);
  }

  const moduleTitles = new Set(course.modules.map((module) => module.title));
  for (const title of requiredModuleTitles) {
    if (!moduleTitles.has(title)) {
      issues.push(`Missing required A1 module: ${title}.`);
    }
  }

  course.modules.forEach((module) => {
    if (!module.title || !module.titleTranslated) {
      issues.push(`Module ${module.order} is missing title or translated title.`);
    }
    if (module.lessons.length === 0) {
      issues.push(`Module ${module.order} "${module.title}" has no lessons.`);
    }

    const isCheckpoint = checkpointModuleTitles.has(module.title);
    const moduleHasReview = module.lessons.some((lesson) => ['review', 'test', 'quiz'].includes(lesson.skillType));
    if (isCheckpoint && !moduleHasReview) {
      issues.push(`Checkpoint module "${module.title}" has no review/test lesson.`);
    }

    module.lessons.forEach((lesson) => {
      totalLessons += 1;
      totalWords += lesson.words.length;

      const skill = lesson.skillType || lesson.type || 'vocab';
      if (skillCounts[skill] == null) skillCounts[skill] = 0;
      skillCounts[skill] += 1;

      if ((lesson.cefrLevel || course.level) !== 'A1') {
        issues.push(`Lesson "${lesson.title}" has CEFR "${lesson.cefrLevel || 'empty'}"; expected A1.`);
      }
      if (!lesson.title || !lesson.titleTranslated) {
        issues.push(`Lesson ${lesson.id} is missing title or translated title.`);
      }
      const hasLinkedComponent =
        lesson.grammarTopic ||
        lesson.phraseCollection ||
        lesson.dialogue ||
        lesson.comprehension;
      if (skill === 'vocab' && lesson.words.length === 0 && !hasLinkedComponent) {
        issues.push(`Vocabulary lesson "${lesson.title}" has no words or linked component.`);
      }

      const componentSkill = ['grammar', 'reading', 'listening'].includes(skill);
      if (componentSkill && !hasLinkedComponent && lesson.words.length === 0) {
        warnings.push(`Skill lesson "${lesson.title}" has neither words nor linked component.`);
      }
    });
  });

  if (totalLessons < 100) {
    issues.push(`A1 has ${totalLessons} lessons; target for full international A1 mastery is 100+ short steps.`);
  }

  if (totalWords < 500) {
    issues.push(`A1 has ${totalWords} word/phrase items; target for full international A1 is 500+.`);
  }

  for (const skill of requiredSkills) {
    if ((skillCounts[skill] || 0) === 0) {
      issues.push(`Missing A1 skill type: ${skill}`);
    }
  }

  for (const [skill, minimum] of Object.entries(minimumSkillCounts)) {
    if ((skillCounts[skill] || 0) < minimum) {
      issues.push(`A1 has only ${skillCounts[skill] || 0} ${skill} lessons; expected at least ${minimum}.`);
    }
  }

  const allLessonTitles = new Set(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  for (const title of finalExamTitles) {
    if (!allLessonTitles.has(title)) {
      issues.push(`Missing final exam lesson: ${title}.`);
    }
  }

  const skillTotal = Object.values(skillCounts).reduce((sum, count) => sum + count, 0) || 1;

  console.log(`A1 mastery audit: ${nativeCode} -> ${targetCode}`);
  console.log(`Course: ${course.title} (${course.id})`);
  console.log(`Modules: ${course.modules.length}`);
  console.log(`Lessons: ${totalLessons}`);
  console.log(`Words: ${totalWords}`);
  console.log('Skills:');
  for (const [skill, count] of Object.entries(skillCounts)) {
    if (count > 0 || requiredSkills.includes(skill)) {
      console.log(`  - ${skill}: ${count} (${pct(count / skillTotal)})`);
    }
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (issues.length) {
    console.log('\nIssues:');
    issues.forEach((issue) => console.log(`  - ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log('\nOK: A1 has no blocking mastery issues.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
