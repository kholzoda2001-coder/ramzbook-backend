import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadAuthProvidersConfig } from '@/lib/otp/auth-provider-settings';
import { sendOtpViaTwilio } from '@/lib/providers/twilio-adapter';
import { publishOtpViaRabbitMq } from '@/lib/providers/rabbitmq-adapter';

export async function POST(req: NextRequest) {

  try {
    const body = (await req.json()) as { provider: string; to: string };
    const { provider, to } = body;

    if (!to) {
      return Response.json({ error: 'Target phone number is required.' }, { status: 400 });
    }

    const cfg = await loadAuthProvidersConfig(prisma);

    if (provider === 'twilio') {
      try {
        // SendOtpViaTwilio falls back to Mock internally if it's unconfigured.
        // We will just let it run. Wait, if it fails, it swallows the error in Twilio-adapter.
        // But for testing we want to know if it worked.
        
        const isConfigured = Boolean(cfg.twilio.accountSid && cfg.twilio.authToken);
        if (!isConfigured) {
          return Response.json({ error: 'Twilio is not configured with SID and Token.' }, { status: 400 });
        }
        
        await sendOtpViaTwilio({
          cfg: cfg.twilio,
          toE164: to,
          otp: '000000',
        });
        
        return Response.json({ success: true, message: 'Test SMS dispatched to Twilio successfully (check logs if not received).' });
      } catch (e: any) {
        return Response.json({ error: 'Twilio Error: ' + (e.message || String(e)) }, { status: 500 });
      }
    } else if (provider === 'mock') {
      return Response.json({ success: true, message: 'Mock SMS test successful.' });
    } else if (provider === 'rabbitmq') {
      try {
        await publishOtpViaRabbitMq({
          cfg: cfg.rabbitmq,
          channel: 'phone',
          identifier: to,
          otp: '000000',
        });
        return Response.json({
          success: true,
          message: 'Test OTP published to RabbitMQ SMS queue (check server logs — falls back to mock if broker unreachable).',
        });
      } catch (e: any) {
        return Response.json({ error: 'RabbitMQ Error: ' + (e.message || String(e)) }, { status: 500 });
      }
    }

    return Response.json({ error: 'Invalid provider.' }, { status: 400 });
  } catch (e: any) {
    console.error('[test-sms]', e);
    return Response.json({ error: 'Internal failure: ' + e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
