import { describe, it, expect } from 'vitest';
import { isCourseReady, MIN_READY_LESSONS } from '../courseReadiness';

describe('тайёрии курс', () => {
  it('курси воқеӣ (197–252 дарс) дастрас аст', () => {
    for (const n of [197, 201, 202, 213, 223, 225, 252, 611]) {
      expect(isCourseReady(1, n)).toBe(true);
    }
  });
  it('курси нимсохта (хитоӣ, 25 дарс) дастрас НЕСТ', () => {
    expect(isCourseReady(1, 25)).toBe(false);
  });
  it('бе курс — ҳатто бо дарсҳои зиёд — не', () => {
    expect(isCourseReady(0, 500)).toBe(false);
  });
  it('маҳз дар ҳад — ҳа', () => {
    expect(isCourseReady(1, MIN_READY_LESSONS)).toBe(true);
    expect(isCourseReady(1, MIN_READY_LESSONS - 1)).toBe(false);
  });
});

import { isPairReady } from '../courseReadiness';

describe('isPairReady — early access', () => {
  it('en:uz кушода мешавад ҳатто бо 14 дарс', () => {
    expect(isPairReady('en', 'uz', 1, 14)).toBe(true);
  });
  it('en:uz бе дарс — не', () => {
    expect(isPairReady('en', 'uz', 1, 0)).toBe(false);
  });
  it('ҷуфти дигари нимкора (zh:tg, 25 дарс) — ҳамоно SOON', () => {
    expect(isPairReady('zh', 'tg', 1, 25)).toBe(false);
  });
  it('курси пурра ҳамеша тайёр', () => {
    expect(isPairReady('de', 'tg', 1, 223)).toBe(true);
  });
});
