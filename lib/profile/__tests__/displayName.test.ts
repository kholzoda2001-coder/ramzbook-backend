import { describe, expect, it } from 'vitest';
import { checkDisplayName, MIN_NAME_LENGTH } from '../displayName';

describe('checkDisplayName', () => {
  it('номи оддиро мегузаронад ва фосиларо мебурад', () => {
    expect(checkDisplayName('  Izatullo Kholzoda ')).toEqual({
      ok: true,
      name: 'Izatullo Kholzoda',
    });
  });

  it('почтаро РАД мекунад — маҳз ҳамин боги 41 ҳисоби роботӣ буд', () => {
    const r = checkDisplayName('kholzoda102001@gmail.com');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problem).toBe('email');
  });

  it('номи кӯтоҳро рад мекунад', () => {
    const r = checkDisplayName('A');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problem).toBe('short');
    expect('A'.length).toBeLessThan(MIN_NAME_LENGTH);
  });

  it('номи РАҚАМДОРИ хонандагони воқеиро мегузаронад', () => {
    // Ҳар се дар продакшн ҳисоби ҳақиқианд — «1234» 5820 XP дорад. Агар
    // қоида рақамро рад мекард, онҳо дар экрани профил гир мемонданд.
    for (const n of ['Izatullo 71', 'malaev.m7', '1234', 'Shar1pov..?']) {
      expect(checkDisplayName(n).ok, n).toBe(true);
    }
  });

  it('холӣ/null-ро рад мекунад, вале намепартояд', () => {
    expect(checkDisplayName(null).ok).toBe(false);
    expect(checkDisplayName(undefined).ok).toBe(false);
    expect(checkDisplayName('   ').ok).toBe(false);
  });
});
