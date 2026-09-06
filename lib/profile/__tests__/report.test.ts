import { describe, expect, it } from 'vitest';
import {
  MAX_NOTE,
  REPORTS_TO_FLAG,
  REPORT_REASONS,
  isFlagged,
  isReportReason,
  validateReport,
} from '../report';

const base = { reporterId: 'a', reportedId: 'b' };

describe('isReportReason', () => {
  it('танҳо сабабҳои рӯйхат', () => {
    for (const r of REPORT_REASONS) expect(isReportReason(r)).toBe(true);
  });

  it('ҳар чизи дигарро рад мекунад', () => {
    // Рӯйхати баста: сабаби озод худаш метавонад таҳқир бошад.
    expect(isReportReason('spam')).toBe(false);
    expect(isReportReason('')).toBe(false);
    expect(isReportReason(null)).toBe(false);
    expect(isReportReason(7)).toBe(false);
    expect(isReportReason(undefined)).toBe(false);
  });
});

describe('validateReport', () => {
  it('шикояти дуруст мегузарад', () => {
    const r = validateReport({ ...base, reason: 'name' });
    expect(r).toEqual({ ok: true, reason: 'name', note: null });
  });

  it('матн тоза карда мешавад', () => {
    const r = validateReport({ ...base, reason: 'avatar', note: '  бад  ' });
    expect(r).toEqual({ ok: true, reason: 'avatar', note: 'бад' });
  });

  it('матни аз фосила иборат ба `null` мешавад', () => {
    const r = validateReport({ ...base, reason: 'name', note: '   ' });
    expect(r.ok && r.note).toBe(null);
  });

  it('матни ғайрисатрӣ нодида гирифта мешавад', () => {
    const r = validateReport({ ...base, reason: 'name', note: 42 });
    expect(r).toEqual({ ok: true, reason: 'name', note: null });
  });

  it('сабаби ношинос рад мешавад', () => {
    expect(validateReport({ ...base, reason: 'hack' })).toEqual({
      ok: false,
      refusal: 'bad_reason',
    });
  });

  it('ХУДРО шикоят кардан мумкин нест', () => {
    expect(
      validateReport({ reporterId: 'a', reportedId: 'a', reason: 'name' }),
    ).toEqual({ ok: false, refusal: 'self' });
  });

  it('`other` бе матн рад мешавад', () => {
    // Админ бо «дигар» -и холӣ коре карда наметавонад.
    expect(validateReport({ ...base, reason: 'other' })).toEqual({
      ok: false,
      refusal: 'note_required',
    });
    expect(validateReport({ ...base, reason: 'other', note: '  ' })).toEqual({
      ok: false,
      refusal: 'note_required',
    });
  });

  it('`other` бо матн мегузарад', () => {
    const r = validateReport({ ...base, reason: 'other', note: 'таҳдид кард' });
    expect(r.ok && r.note).toBe('таҳдид кард');
  });

  it('матни аз ҳад дароз рад мешавад', () => {
    const long = 'я'.repeat(MAX_NOTE + 1);
    expect(validateReport({ ...base, reason: 'name', note: long })).toEqual({
      ok: false,
      refusal: 'note_too_long',
    });
  });

  it('маҳз дар ҳадди 500 ҳанӯз мегузарад', () => {
    const edge = 'я'.repeat(MAX_NOTE);
    expect(validateReport({ ...base, reason: 'name', note: edge }).ok).toBe(true);
  });

  it('сабаби нодуруст аз санҷиши «худ» ПЕШТАР меафтад', () => {
    // Тартиб муҳим аст: ҷавоби 400 бояд аз аввалин хатои ҳақиқӣ гӯяд.
    expect(
      validateReport({ reporterId: 'a', reportedId: 'a', reason: 'hack' }),
    ).toEqual({ ok: false, refusal: 'bad_reason' });
  });
});

describe('isFlagged', () => {
  it('аз рӯи шикоятгарони ГУНОГУН ҳисоб мешавад', () => {
    expect(isFlagged(REPORTS_TO_FLAG)).toBe(true);
    expect(isFlagged(REPORTS_TO_FLAG - 1)).toBe(false);
    expect(isFlagged(0)).toBe(false);
  });

  it('ҳадди ҷорӣ 3 аст', () => {
    // Агар ин рақам иваз шавад, панели админ ҳам бояд донад.
    expect(REPORTS_TO_FLAG).toBe(3);
  });
});
