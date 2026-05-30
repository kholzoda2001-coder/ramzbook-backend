// Helper for linking a Lesson to AT MOST ONE component.
// The admin UI sends a `linkType` + `linkId`; this maps them onto the four
// optional FKs on Lesson, nulling the rest so exactly one (or none) is ever set.

export type LessonLinkType = 'grammar' | 'phrases' | 'dialogue' | 'comprehension';

export function buildLinkData(linkType?: string, linkId?: string | null) {
  const cleared = {
    grammarTopicId: null as string | null,
    phraseCollectionId: null as string | null,
    dialogueId: null as string | null,
    comprehensionId: null as string | null,
  };
  const id = (linkId ?? '').trim();
  if (!id) return cleared;
  switch (linkType) {
    case 'grammar': return { ...cleared, grammarTopicId: id };
    case 'phrases': return { ...cleared, phraseCollectionId: id };
    case 'dialogue': return { ...cleared, dialogueId: id };
    case 'comprehension': return { ...cleared, comprehensionId: id };
    default: return cleared;
  }
}
