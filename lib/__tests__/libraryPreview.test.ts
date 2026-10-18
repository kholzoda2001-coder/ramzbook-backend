import { describe, expect, it } from 'vitest';
import {
  FREE_AUDIO_PREVIEW_SECONDS,
  FREE_COURSE_PREVIEW_LESSONS,
  canPreviewAudio,
  canPreviewLessons,
  canPreviewPages,
  lessonIsFree,
} from '../libraryAccess';

// Қарори соҳиби маҳсулот: аудио 2 дақиқа, курс 2 дарс (қоидаи 2026-09-02 бекор).
describe('пешнамоиши ройгон — аудио ва курс', () => {
  it('аудио 2 дақиқа (120 сония) аст', () => {
    expect(FREE_AUDIO_PREVIEW_SECONDS).toBe(120);
  });

  it('курс 2 дарс аст', () => {
    expect(FREE_COURSE_PREVIEW_LESSONS).toBe(2);
  });

  it('пешнамоиш аз рӯи навъ: аудио, курс, китоб — ҳар кадом алоҳида', () => {
    expect(canPreviewAudio({ type: 'audio' })).toBe(true);
    expect(canPreviewAudio({ type: 'book' })).toBe(false);
    expect(canPreviewLessons({ type: 'course' })).toBe(true);
    expect(canPreviewLessons({ type: 'audio' })).toBe(false);
    // Китоби саҳифавӣ ҳамон тавр; аудио ва курс «саҳифавӣ» нестанд.
    expect(canPreviewPages({ type: 'book' })).toBe(true);
    expect(canPreviewPages({ type: 'audio' })).toBe(false);
    expect(canPreviewPages({ type: 'course' })).toBe(false);
  });

  it('ду дарси аввал ройгон, бақия баста', () => {
    expect(lessonIsFree(0, {})).toBe(true);
    expect(lessonIsFree(1, {})).toBe(true);
    expect(lessonIsFree(2, {})).toBe(false);
    expect(lessonIsFree(9, { isFreePreview: false })).toBe(false);
  });

  it('админ метавонад дарси иловагиро ройгон гузорад', () => {
    expect(lessonIsFree(5, { isFreePreview: true })).toBe(true);
  });
});
