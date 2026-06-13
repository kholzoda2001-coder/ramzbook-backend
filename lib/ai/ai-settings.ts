/**
 * AI Tutor configuration stored in AppSetting (`ai_settings`).
 * The OpenAI API key is masked on read for admin API responses — never returned in full.
 * Mirrors the pattern in lib/auth/login-settings.ts.
 */

import type { PrismaClient } from '@prisma/client';

export const SETTING_KEY = 'ai_settings';

export interface AiSettingsConfig {
  enabled: boolean;
  freeLimit: number;     // messages/day for free users
  premiumLimit: number;  // messages/day for premium users
  apiKey: string;        // OpenAI API key (secret — masked on read)
  model: string;         // e.g. "gpt-4o-mini"
  systemPrompt: string;  // base persona; {target}/{native}/{level} are substituted at call time
}

export const DEFAULT_SYSTEM_PROMPT =
  'You are a friendly language tutor for a {native}-speaking learner studying {target} at CEFR level {level}. ' +
  'Chat mainly in {target}, keeping your language simple and appropriate for their level. ' +
  'Gently correct their mistakes and briefly explain in {native} only when needed. ' +
  'Keep replies short, encouraging and conversational.';

export const defaultAiSettingsConfig: AiSettingsConfig = {
  enabled: true,
  freeLimit: 3,
  premiumLimit: 20,
  apiKey: '',
  model: 'gpt-4o-mini',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

const MASK = '***MASKED***';

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function loadAiSettingsConfig(
  prisma: PrismaClient,
): Promise<AiSettingsConfig> {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row?.valueJson) return deepClone(defaultAiSettingsConfig);
  try {
    const parsed = JSON.parse(row.valueJson) as Partial<AiSettingsConfig>;
    return { ...deepClone(defaultAiSettingsConfig), ...parsed };
  } catch {
    return deepClone(defaultAiSettingsConfig);
  }
}

export async function saveAiSettingsConfig(
  prisma: PrismaClient,
  cfg: AiSettingsConfig,
): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}

/** Replace the secret API key for safe JSON responses (admin UI / GET). */
export function maskAiSettingsForResponse(cfg: AiSettingsConfig): AiSettingsConfig {
  return { ...cfg, apiKey: cfg.apiKey ? MASK : '' };
}

/** Merge a partial admin update, preserving the API key when the value is the mask token. */
export function mergeAiSettingsUpdate(
  current: AiSettingsConfig,
  partial: Partial<AiSettingsConfig>,
): AiSettingsConfig {
  const next = deepClone(current);
  if (partial.enabled !== undefined) next.enabled = partial.enabled;
  if (partial.freeLimit !== undefined) next.freeLimit = Math.max(0, Math.floor(partial.freeLimit));
  if (partial.premiumLimit !== undefined) next.premiumLimit = Math.max(0, Math.floor(partial.premiumLimit));
  if (partial.model !== undefined && partial.model.trim()) next.model = partial.model.trim();
  if (partial.systemPrompt !== undefined && partial.systemPrompt.trim()) next.systemPrompt = partial.systemPrompt;

  if (partial.apiKey !== undefined) {
    next.apiKey = partial.apiKey === MASK ? current.apiKey : partial.apiKey.trim();
  }

  return next;
}

/** Resolve the effective API key: admin-stored key first, env fallback. */
export function resolveApiKey(cfg: AiSettingsConfig): string {
  return cfg.apiKey || process.env.OPENAI_API_KEY || '';
}
