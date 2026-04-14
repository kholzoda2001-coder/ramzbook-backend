/**
 * Social Login configurations stored in AppSetting (`login_settings`).
 * Secrets are masked on read for admin API responses — never returned in full.
 */

import type { PrismaClient } from '@prisma/client';

export const SETTING_KEY = 'login_settings';

export interface LoginSettingsConfig {
  googleClientId: string;
  telegramBotToken: string;
  allowMockSocial: boolean;
}

export const defaultLoginSettingsConfig: LoginSettingsConfig = {
  googleClientId: '',
  telegramBotToken: '',
  allowMockSocial: false,
};

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function loadLoginSettingsConfig(
  prisma: PrismaClient,
): Promise<LoginSettingsConfig> {
  const row = await prisma.appSetting.findUnique({
    where: { key: SETTING_KEY },
  });
  if (!row?.valueJson) return deepClone(defaultLoginSettingsConfig);
  try {
    const parsed = JSON.parse(row.valueJson) as Partial<LoginSettingsConfig>;
    return {
      ...deepClone(defaultLoginSettingsConfig),
      ...parsed,
    };
  } catch {
    return deepClone(defaultLoginSettingsConfig);
  }
}

export async function saveLoginSettingsConfig(
  prisma: PrismaClient,
  cfg: LoginSettingsConfig,
): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}

/** Replace secret fields for safe JSON responses (admin UI / GET). */
export function maskLoginSettingsForResponse(cfg: LoginSettingsConfig): LoginSettingsConfig {
  return {
    ...cfg,
    telegramBotToken: cfg.telegramBotToken ? '***MASKED***' : '',
  };
}

/** Merge a partial update from admin UI, preserving secrets when value is mask token. */
export function mergeLoginSettingsUpdate(
  current: LoginSettingsConfig,
  partial: Partial<LoginSettingsConfig>,
): LoginSettingsConfig {
  const next = deepClone(current);
  if (partial.googleClientId !== undefined) next.googleClientId = partial.googleClientId;
  if (partial.allowMockSocial !== undefined) next.allowMockSocial = partial.allowMockSocial;
  
  if (partial.telegramBotToken !== undefined) {
    if (partial.telegramBotToken === '***MASKED***') {
      next.telegramBotToken = current.telegramBotToken;
    } else {
      next.telegramBotToken = partial.telegramBotToken;
    }
  }
  
  return next;
}
