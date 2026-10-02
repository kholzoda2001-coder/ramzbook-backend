import { describe, it, expect } from 'vitest';
import { fillJobLiteral } from '@/lib/speaking/persona';

describe('fillJobLiteral — транскрипсияи «I am {job}.» (02.10.2026)', () => {
  it('касб аз ҳадаф, ҳамон касбе ки барнома ба матн мегузорад', () => {
    expect(fillJobLiteral('ай эм {job}', 'en', 'build')).toBe('ай эм э билдэр');
    expect(fillJobLiteral('ай эм {job}', 'en-US', 'study')).toBe('ай эм э стюдэнт');
    expect(fillJobLiteral('ай эм {job}', 'en', 'drive')).toBe('ай эм э драйвэр');
  });

  it('ҳадаф интихоб нашудааст (null) → «worker», мисли `_goalKey`-и барнома', () => {
    expect(fillJobLiteral('ай эм {job}', 'en', null)).toBe('ай эм э вёркэр');
  });

  it('ҳадаф номаълум (такрор, калимаҳо) → холӣ, ҳеҷ гоҳ «{job}»-и хом', () => {
    expect(fillJobLiteral('ай эм {job}', 'en', undefined)).toBe('');
    expect(fillJobLiteral('ай эм {job}', '', undefined)).toBe('');
  });

  it('забони бе ҷадвал ва {name} → холӣ', () => {
    expect(fillJobLiteral('йа {job}', 'ru', 'build')).toBe('');
    expect(fillJobLiteral('ҳеллоу {name}', 'en', 'build')).toBe('');
  });

  it('транскрипсияи оддӣ бетағйир', () => {
    expect(fillJobLiteral('ай нид э ҷоб', 'en', undefined)).toBe('ай нид э ҷоб');
    expect(fillJobLiteral('', 'en', 'build')).toBe('');
  });
});
