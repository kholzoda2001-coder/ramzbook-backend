/**
 * RabbitMQ publish adapter for OTP payloads.
 *
 * LIVE DEPENDENCY: requires `amqplib`, reachable broker, and valid credentials in settings.
 * When credentials/host are missing, falls back to mock-safe logging (no password in logs).
 */

import type { Channel, ChannelModel } from 'amqplib';
import { buildRabbitMqOtpPayload, type RabbitMqOtpConfig } from '@/lib/providers/rabbitmq-types';
import type { OtpChannel } from '@/lib/otp/otp-core';
import { deliverOtpMock } from '@/lib/providers/mock-otp-delivery';

function canConnect(cfg: RabbitMqOtpConfig): boolean {
  return Boolean(cfg.host && cfg.username && cfg.password);
}

export async function publishOtpViaRabbitMq(params: {
  cfg: RabbitMqOtpConfig;
  channel: OtpChannel;
  identifier: string;
  otp: string;
}): Promise<void> {
  const payload = buildRabbitMqOtpPayload({
    originatorSystem: params.cfg.originatorSystem,
    channel: params.channel,
    identifier: params.identifier,
    otp: params.otp,
  });

  if (!canConnect(params.cfg)) {
    await deliverOtpMock({
      channel: params.channel,
      identifier: params.identifier,
      otp: params.otp,
    });
    return;
  }

  let connection: ChannelModel | undefined;
  let ch: Channel | undefined;
  try {
    const amqp = await import('amqplib');
    connection = await amqp.connect({
      protocol: params.cfg.useSsl ? 'amqps' : 'amqp',
      hostname: params.cfg.host,
      port: params.cfg.port,
      username: params.cfg.username,
      password: params.cfg.password,
      vhost: params.cfg.vhost || '/',
    });
    const channel = await connection.createChannel();
    ch = channel;
    const body = Buffer.from(JSON.stringify(payload));

    const routingKey =
      params.channel === 'phone'
        ? params.cfg.routingKeyPhone || params.cfg.routingKey
        : params.cfg.routingKey;

    await channel.assertExchange(params.cfg.exchange, 'topic', { durable: true });
    channel.publish(params.cfg.exchange, routingKey, body, {
      contentType: 'application/json',
      persistent: true,
      headers: {
        'x-originator-system': params.cfg.originatorSystem,
        'x-otp-channel': params.channel,
      },
    });

    if (params.cfg.queue) {
      await channel.assertQueue(params.cfg.queue, { durable: true });
      channel.sendToQueue(params.cfg.queue, body, { persistent: true });
    }
  } catch (e) {
    // Never log connection URL or password.
    console.error('[RabbitMQ OTP] publish failed; falling back to mock delivery');
    await deliverOtpMock({
      channel: params.channel,
      identifier: params.identifier,
      otp: params.otp,
    });
  } finally {
    try {
      await ch?.close();
    } catch {
      /* ignore */
    }
    try {
      await connection?.close();
    } catch {
      /* ignore */
    }
  }
}
