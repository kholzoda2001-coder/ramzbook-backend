import { describe, expect, it } from 'vitest';
import { isAzureAccountDead, parseAzureMode } from '../speech-engine';

describe('speech_engine', () => {
  it('режим: пешфарз auto, ҳар қимати ношинос — auto', () => {
    expect(parseAzureMode(null)).toBe('auto');
    expect(parseAzureMode('')).toBe('auto');
    expect(parseAzureMode('{"azure":"off"}')).toBe('off');
    expect(parseAzureMode('{"azure":"on"}')).toBe('on');
    expect(parseAzureMode('{"azure":"maybe"}')).toBe('auto');
    expect(parseAzureMode('not json')).toBe('auto');
  });

  it('401/403 = ҳисоби Azure мурда (503); 5xx ва 429 — муваққатӣ (502)', () => {
    expect(isAzureAccountDead(401)).toBe(true);
    expect(isAzureAccountDead(403)).toBe(true);
    expect(isAzureAccountDead(429)).toBe(false);
    expect(isAzureAccountDead(500)).toBe(false);
    expect(isAzureAccountDead(503)).toBe(false);
  });
});
