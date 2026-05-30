import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/**
 * Unified bulk-import endpoint (Phase 6, Step 29).
 *
 * Language-agnostic: nothing here is hard-coded per language. Each importable
 * content type attaches to a parent container (a phrase collection, a dialogue,
 * a comprehension exercise, a grammar topic) or — for placement — to a
 * (target, native) language PAIR. The admin pastes an array of items; we
 * validate, optionally `replace` the parent's existing children, then
 * `createMany` inside a single transaction so the import is atomic.
 *
 * Body:
 *   {
 *     type: 'phrases' | 'dialogue_lines' | 'comprehension_questions'
 *         | 'grammar_examples' | 'grammar_rules' | 'grammar_exercises'
 *         | 'placement',
 *     parentId?: string,                 // required for every type except 'placement'
 *     targetLanguageId?: string,         // required for 'placement'
 *     nativeLanguageId?: string,         // required for 'placement'
 *     items: any[],
 *     mode?: 'append' | 'replace'        // default 'append'
 *   }
 */

const MAX_ITEMS = 2000;

type Mode = 'append' | 'replace';

const s = (v: unknown): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());
const sOrNull = (v: unknown): string | null => {
  const t = s(v);
  return t.length ? t : null;
};

function asOptions(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((o) => s(o)).filter((o) => o.length > 0);
  // tolerate a newline- or pipe-separated string
  if (typeof v === 'string') return v.split(/\r?\n|\|/).map((o) => o.trim()).filter(Boolean);
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { type, parentId, targetLanguageId, nativeLanguageId } = body as Record<string, string>;
    const mode: Mode = body.mode === 'replace' ? 'replace' : 'append';
    const items: any[] = Array.isArray(body.items) ? body.items : [];

    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'items array is required and must not be empty' }, { status: 400 });
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json({ error: `Too many items. Split into batches of ≤ ${MAX_ITEMS}.` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ── helper to compute the starting order for an append ──
      async function nextOrder(model: any, where: Record<string, unknown>): Promise<number> {
        if (mode !== 'append') return 0;
        const last = await model.findFirst({ where, orderBy: { order: 'desc' }, select: { order: true } });
        return (last?.order ?? 0) + 1;
      }

      switch (type) {
        // ──────────────────────────────────────────── PHRASES ──
        case 'phrases': {
          if (!parentId) throw new Error('parentId (collectionId) is required');
          const parent = await tx.phraseCollection.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Phrase collection "${parentId}" not found`);
          if (mode === 'replace') await tx.phrase.deleteMany({ where: { collectionId: parentId } });
          const start = await nextOrder(tx.phrase, { collectionId: parentId });
          const data = items
            .map((it, i) => ({
              collectionId: parentId,
              text: s(it.text),
              translation: s(it.translation),
              literal: sOrNull(it.literal),
              note: sOrNull(it.note),
              audioUrl: sOrNull(it.audioUrl),
              order: start + i,
            }))
            .filter((d) => d.text && d.translation);
          if (data.length === 0) throw new Error('No valid rows (each phrase needs text + translation).');
          await tx.phrase.createMany({ data });
          const total = await tx.phrase.count({ where: { collectionId: parentId } });
          return { inserted: data.length, total };
        }

        // ─────────────────────────────────────── DIALOGUE LINES ──
        case 'dialogue_lines': {
          if (!parentId) throw new Error('parentId (dialogueId) is required');
          const parent = await tx.dialogue.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Dialogue "${parentId}" not found`);
          if (mode === 'replace') await tx.dialogueLine.deleteMany({ where: { dialogueId: parentId } });
          const start = await nextOrder(tx.dialogueLine, { dialogueId: parentId });
          const data = items
            .map((it, i) => ({
              dialogueId: parentId,
              speaker: s(it.speaker) || '—',
              text: s(it.text),
              translation: s(it.translation),
              audioUrl: sOrNull(it.audioUrl),
              isUser: it.isUser === true || it.isUser === 'true',
              order: start + i,
            }))
            .filter((d) => d.text && d.translation);
          if (data.length === 0) throw new Error('No valid rows (each line needs text + translation).');
          await tx.dialogueLine.createMany({ data });
          const total = await tx.dialogueLine.count({ where: { dialogueId: parentId } });
          return { inserted: data.length, total };
        }

        // ──────────────────────────────── COMPREHENSION QUESTIONS ──
        case 'comprehension_questions': {
          if (!parentId) throw new Error('parentId (exerciseId) is required');
          const parent = await tx.comprehensionExercise.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Comprehension exercise "${parentId}" not found`);
          if (mode === 'replace') await tx.comprehensionQuestion.deleteMany({ where: { exerciseId: parentId } });
          const start = await nextOrder(tx.comprehensionQuestion, { exerciseId: parentId });
          const data = items
            .map((it, i) => {
              const options = asOptions(it.options);
              let correctIndex = Number.isInteger(it.correctIndex) ? it.correctIndex : 0;
              if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
              return {
                exerciseId: parentId,
                question: s(it.question),
                questionTranslated: sOrNull(it.questionTranslated),
                options,
                correctIndex,
                explanation: sOrNull(it.explanation),
                order: start + i,
              };
            })
            .filter((d) => d.question && d.options.length >= 2);
          if (data.length === 0) throw new Error('No valid rows (each question needs a prompt + ≥2 options).');
          await tx.comprehensionQuestion.createMany({ data });
          const total = await tx.comprehensionQuestion.count({ where: { exerciseId: parentId } });
          return { inserted: data.length, total };
        }

        // ───────────────────────────────────── GRAMMAR EXAMPLES ──
        case 'grammar_examples': {
          if (!parentId) throw new Error('parentId (topicId) is required');
          const parent = await tx.grammarTopic.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Grammar topic "${parentId}" not found`);
          if (mode === 'replace') await tx.grammarExample.deleteMany({ where: { topicId: parentId } });
          const start = await nextOrder(tx.grammarExample, { topicId: parentId });
          const data = items
            .map((it, i) => ({
              topicId: parentId,
              sentence: s(it.sentence),
              translation: s(it.translation),
              highlight: sOrNull(it.highlight),
              audioUrl: sOrNull(it.audioUrl),
              order: start + i,
            }))
            .filter((d) => d.sentence && d.translation);
          if (data.length === 0) throw new Error('No valid rows (each example needs sentence + translation).');
          await tx.grammarExample.createMany({ data });
          const total = await tx.grammarExample.count({ where: { topicId: parentId } });
          return { inserted: data.length, total };
        }

        // ──────────────────────────────────────── GRAMMAR RULES ──
        case 'grammar_rules': {
          if (!parentId) throw new Error('parentId (topicId) is required');
          const parent = await tx.grammarTopic.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Grammar topic "${parentId}" not found`);
          if (mode === 'replace') await tx.grammarRule.deleteMany({ where: { topicId: parentId } });
          const start = await nextOrder(tx.grammarRule, { topicId: parentId });
          const data = items
            .map((it, i) => ({
              topicId: parentId,
              pattern: s(it.pattern),
              note: sOrNull(it.note),
              order: start + i,
            }))
            .filter((d) => d.pattern);
          if (data.length === 0) throw new Error('No valid rows (each rule needs a pattern).');
          await tx.grammarRule.createMany({ data });
          const total = await tx.grammarRule.count({ where: { topicId: parentId } });
          return { inserted: data.length, total };
        }

        // ───────────────────────────────────── GRAMMAR EXERCISES ──
        case 'grammar_exercises': {
          if (!parentId) throw new Error('parentId (topicId) is required');
          const parent = await tx.grammarTopic.findUnique({ where: { id: parentId }, select: { id: true } });
          if (!parent) throw new Error(`Grammar topic "${parentId}" not found`);
          if (mode === 'replace') await tx.grammarExercise.deleteMany({ where: { topicId: parentId } });
          const start = await nextOrder(tx.grammarExercise, { topicId: parentId });
          const data = items
            .map((it, i) => {
              const options = asOptions(it.options);
              return {
                topicId: parentId,
                type: s(it.type) || 'fill_blank',
                prompt: s(it.prompt),
                promptTranslated: sOrNull(it.promptTranslated),
                answer: s(it.answer),
                options: options.length ? options : undefined,
                explanation: sOrNull(it.explanation),
                order: start + i,
              };
            })
            .filter((d) => d.prompt && d.answer);
          if (data.length === 0) throw new Error('No valid rows (each exercise needs a prompt + answer).');
          await tx.grammarExercise.createMany({ data });
          const total = await tx.grammarExercise.count({ where: { topicId: parentId } });
          return { inserted: data.length, total };
        }

        // ──────────────────────────────────── PLACEMENT QUESTIONS ──
        case 'placement': {
          if (!targetLanguageId || !nativeLanguageId) {
            throw new Error('targetLanguageId and nativeLanguageId are required for placement');
          }
          const [tgt, nat] = await Promise.all([
            tx.language.findUnique({ where: { id: targetLanguageId }, select: { id: true } }),
            tx.language.findUnique({ where: { id: nativeLanguageId }, select: { id: true } }),
          ]);
          if (!tgt) throw new Error(`Target language "${targetLanguageId}" not found`);
          if (!nat) throw new Error(`Native language "${nativeLanguageId}" not found`);
          const where = { targetLanguageId, nativeLanguageId };
          if (mode === 'replace') await tx.placementQuestion.deleteMany({ where });
          const start = await nextOrder(tx.placementQuestion, where);
          const data = items
            .map((it, i) => {
              const options = asOptions(it.options);
              const answer = s(it.answer);
              const cefrLevel = normalizeCefrLevel(s(it.cefrLevel));
              return {
                targetLanguageId,
                nativeLanguageId,
                cefrLevel: cefrLevel ?? '',
                skill: s(it.skill) || 'overall',
                prompt: s(it.prompt),
                promptTranslated: sOrNull(it.promptTranslated),
                options,
                answer,
                explanation: sOrNull(it.explanation),
                audioUrl: sOrNull(it.audioUrl),
                order: start + i,
                isActive: true,
              };
            })
            // each placement item needs a level, prompt, ≥2 options, and an answer present in the options
            .filter((d) => d.cefrLevel && d.prompt && d.options.length >= 2 && d.answer && d.options.includes(d.answer));
          if (data.length === 0) {
            throw new Error('No valid rows (each item needs cefrLevel, prompt, ≥2 options, and an answer that matches one option).');
          }
          await tx.placementQuestion.createMany({ data });
          const total = await tx.placementQuestion.count({ where });
          return { inserted: data.length, total };
        }

        default:
          throw new Error(`Unknown import type "${type}"`);
      }
    });

    return NextResponse.json({ success: true, type, mode, ...result });
  } catch (err: any) {
    console.error('[bulk-import]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error during bulk import' }, { status: 500 });
  }
}
