/**
 * RabbitMQ-style OTP message envelope (documented contract for queue consumers).
 * The adapter builds this payload; a worker or external system delivers the email/SMS.
 */

export interface RabbitMqOtpConfig {
  /** Logical source system name (appears in message headers / body). */
  originatorSystem: string;
  host: string;
  port: number;
  username: string;
  /** LIVE: loaded from DB/env — never log. */
  password: string;
  vhost: string;
  exchange: string;
  /** Routing key for email OTP messages (topic exchange). */
  routingKey: string;
  /**
   * Routing key for SMS / phone OTP (e.g. smsgate.tj or national gateway consumers).
   * Falls back to [routingKey] when empty.
   */
  routingKeyPhone: string;
  /** Optional queue name when using direct queue publish pattern. */
  queue: string;
  useSsl: boolean;
}

/** Wire payload published to the exchange (JSON-serialisable). */
export interface RabbitMqOtpPayload {
  meta: {
    schemaVersion: 1;
    originatorSystem: string;
    channel: 'email' | 'phone';
    createdAtIso: string;
  };
  delivery: {
    identifier: string;
    /** 6-digit code — only included when running in mock / dev log path, not in production logs. */
    otp: string;
  };
}

export function buildRabbitMqOtpPayload(params: {
  originatorSystem: string;
  channel: 'email' | 'phone';
  identifier: string;
  otp: string;
}): RabbitMqOtpPayload {
  return {
    meta: {
      schemaVersion: 1,
      originatorSystem: params.originatorSystem,
      channel: params.channel,
      createdAtIso: new Date().toISOString(),
    },
    delivery: {
      identifier: params.identifier,
      otp: params.otp,
    },
  };
}
