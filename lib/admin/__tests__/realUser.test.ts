import { describe, expect, it } from 'vitest';
import { isTestAccount, realUserSql, realUserWhere } from '../realUser';

describe('isTestAccount', () => {
  it('ҳисобҳои seed-и `Test User N`', () => {
    expect(isTestAccount({ name: 'Test User 7', email: 't7@ramz.tj' })).toBe(true);
  });

  it('роботи pre-launch-и Google — ном почта аст', () => {
    expect(
      isTestAccount({ name: 'kholzoda102001@gmail.com', email: 'nicholasreese.33312@gmail.com' }),
    ).toBe(true);
  });

  it('домени Firebase Test Lab', () => {
    expect(
      isTestAccount({ name: 'Robo', email: '5em677y35evwlzbev7xnsq-lvl-00@cloudtestlabaccounts.com' }),
    ).toBe(true);
  });

  it('хонандаи ВОҚЕӢ ҳеҷ гоҳ ба дом намеафтад', () => {
    // Ҳамаи инҳо аз продакшн гирифта шудаанд.
    const real = [
      { name: 'Sharofiddin Rahmonov', email: 'rahmonovsharofiddin097@gmail.com' },
      { name: 'Izatullo 71', email: 'izatullo7117@gmail.com' },
      { name: 'malaev.m7', email: 'malaevserali7@gmail.com' },
      { name: '1234', email: 'mullobobo333@gmail.com' },
      { name: 'Ҳусайни Ҷанҷолзода', email: 'husaynijanjozoda@gmail.com' },
      { name: 'Testbek', email: 'testbek@gmail.com' }, // «Test» + ҳарф ≠ «Test User»
    ];
    for (const u of real) expect(isTestAccount(u), u.name).toBe(false);
  });

  it('майдонҳои холиро мебардорад', () => {
    expect(isTestAccount({})).toBe(false);
    expect(isTestAccount({ name: null, email: null })).toBe(false);
  });
});

describe('realUserWhere / realUserSql', () => {
  it('ҳар се қоида дар шарти Prisma ҳастанд', () => {
    const and = realUserWhere.AND as unknown[];
    expect(and).toHaveLength(3);
  });

  it('SQL алиасро эҳтиром мекунад ва ҳар се қоидаро дорад', () => {
    const s = realUserSql('u');
    expect(s).toContain('u."name"');
    expect(s).toContain("NOT LIKE 'Test User%'");
    expect(s).toContain("NOT LIKE '%@%'");
    expect(s).toContain('cloudtestlabaccounts.com');
  });
});
