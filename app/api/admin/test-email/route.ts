import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadAuthProvidersConfig } from '@/lib/otp/auth-provider-settings';
import { sendOtpEmail } from '@/lib/mailer';
import { publishOtpViaRabbitMq } from '@/lib/providers/rabbitmq-adapter';

export async function POST(req: NextRequest) {

  try {
    const body = (await req.json()) as { provider: string; to: string };
    const { provider, to } = body;

    if (!to) {
      return Response.json({ error: 'Target email is required.' }, { status: 400 });
    }

    const cfg = await loadAuthProvidersConfig(prisma);

    if (provider === 'smtp') {
      try {
        await sendOtpEmail(to, '000000', cfg.smtp);
        return Response.json({ success: true, message: 'Test email sent via SMTP successfully.' });
      } catch (e: any) {
        return Response.json({ error: 'SMTP Error: ' + (e.message || String(e)) }, { status: 500 });
      }
    } else if (provider === 'mock') {
      return Response.json({ success: true, message: 'Mock email test successful.' });
    } else if (provider === 'rabbitmq') {
      try {
        await publishOtpViaRabbitMq({
          cfg: cfg.rabbitmq,
          channel: 'email',
          identifier: to,
          otp: '000000',
        });
        return Response.json({
          success: true,
          message: 'Test OTP published to RabbitMQ email queue (check server logs — falls back to mock if broker unreachable).',
        });
      } catch (e: any) {
        return Response.json({ error: 'RabbitMQ Error: ' + (e.message || String(e)) }, { status: 500 });
      }
    }

    return Response.json({ error: 'Invalid provider.' }, { status: 400 });
  } catch (e: any) {
    console.error('[test-email]', e);
    return Response.json({ error: 'Internal failure: ' + e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
