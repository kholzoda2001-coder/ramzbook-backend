/**
 * OTP / SMS / queue provider configuration stored in AppSetting (`auth_providers`).
 * Secrets are masked on read for admin API responses — never returned in full.
 */

import type { PrismaClient } from '@prisma/client';
import type { RabbitMqOtpConfig } from '@/lib/providers/rabbitmq-types';
import type { TwilioSmsConfig } from '@/lib/providers/twilio-types';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}

const SETTING_KEY = 'auth_providers';

export type EmailOtpProviderId = 'mock' | 'smtp' | 'rabbitmq';
/** `rabbitmq` = queue/SMS gate (e.g. smsgate.tj worker) using RabbitMqOtpConfig + routingKeyPhone. */
export type PhoneOtpProviderId = 'mock' | 'twilio' | 'rabbitmq';

export interface AuthProvidersConfig {
  activeEmailProvider: EmailOtpProviderId;
  activePhoneProvider: PhoneOtpProviderId;
  smtp: SmtpConfig;
  rabbitmq: RabbitMqOtpConfig;
  twilio: TwilioSmsConfig;
}

export const defaultAuthProvidersConfig: AuthProvidersConfig = {
  activeEmailProvider: 'mock',
  activePhoneProvider: 'mock',
  smtp: {
    host: '',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    fromName: 'RamzBook',
  },
  rabbitmq: {
    originatorSystem: 'ramzbook-api',
    host: '',
    port: 5672,
    username: 'guest',
    password: '',
    vhost: '/',
    exchange: 'ramz.otp',
    routingKey: 'otp.email',
    routingKeyPhone: 'otp.sms',
    queue: '',
    useSsl: false,
  },
  twilio: {
    accountSid: '',
    authToken: '',
    messagingServiceSid: '',
    fromNumber: '',
    verifyServiceSid: '',
    useVerifyApi: false,
  },
};

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function loadAuthProvidersConfig(
  prisma: PrismaClient,
): Promise<AuthProvidersConfig> {
  const row = await prisma.appSetting.findUnique({
    where: { key: SETTING_KEY },
  });
  if (!row?.valueJson) return deepClone(defaultAuthProvidersConfig);
  try {
    const parsed = JSON.parse(row.valueJson) as Partial<AuthProvidersConfig>;
    const rabbitmq = {
      ...defaultAuthProvidersConfig.rabbitmq,
      ...(parsed.rabbitmq ?? {}),
    };
    if (!rabbitmq.routingKeyPhone?.trim()) {
      rabbitmq.routingKeyPhone = defaultAuthProvidersConfig.rabbitmq.routingKeyPhone;
    }
    return {
      ...deepClone(defaultAuthProvidersConfig),
      ...parsed,
      smtp: {
        ...defaultAuthProvidersConfig.smtp,
        ...(parsed.smtp ?? {}),
      },
      rabbitmq,
      twilio: {
        ...defaultAuthProvidersConfig.twilio,
        ...(parsed.twilio ?? {}),
      },
    };
  } catch {
    return deepClone(defaultAuthProvidersConfig);
  }
}

export async function saveAuthProvidersConfig(
  prisma: PrismaClient,
  cfg: AuthProvidersConfig,
): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}

/** Replace secret fields for safe JSON responses (admin UI / GET). */
export function maskAuthProvidersForResponse(cfg: AuthProvidersConfig): AuthProvidersConfig {
  return {
    ...cfg,
    smtp: {
      ...cfg.smtp,
      pass: cfg.smtp.pass ? '***MASKED***' : '',
    },
    rabbitmq: {
      ...cfg.rabbitmq,
      password: cfg.rabbitmq.password ? '***MASKED***' : '',
    },
    twilio: {
      ...cfg.twilio,
      authToken: cfg.twilio.authToken ? '***MASKED***' : '',
    },
  };
}

/** Merge a partial update from admin UI, preserving secrets when value is mask token. */
export function mergeAuthProvidersUpdate(
  current: AuthProvidersConfig,
  partial: Partial<AuthProvidersConfig>,
): AuthProvidersConfig {
  const next = deepClone(current);
  if (partial.activeEmailProvider !== undefined) {
    next.activeEmailProvider = partial.activeEmailProvider;
  }
  if (partial.activePhoneProvider !== undefined) {
    next.activePhoneProvider = partial.activePhoneProvider;
  }

  if (partial.smtp) {
    next.smtp = { ...next.smtp, ...partial.smtp };
    if (partial.smtp.pass === '***MASKED***') {
      next.smtp.pass = current.smtp.pass;
    }
  }
  if (partial.rabbitmq) {
    next.rabbitmq = { ...next.rabbitmq, ...partial.rabbitmq };
    if (partial.rabbitmq.password === '***MASKED***') {
      next.rabbitmq.password = current.rabbitmq.password;
    }
  }
  if (partial.twilio) {
    next.twilio = { ...next.twilio, ...partial.twilio };
    if (partial.twilio.authToken === '***MASKED***') {
      next.twilio.authToken = current.twilio.authToken;
    }
  }
  return next;
}

export { SETTING_KEY as AUTH_PROVIDERS_SETTING_KEY };
