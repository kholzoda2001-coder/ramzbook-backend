/**
 * lib/push.ts — FCM push (серверӣ).
 *
 * firebase-admin бо калиди Service Account (env `FIREBASE_SERVICE_ACCOUNT`,
 * JSON-и як сатрӣ) init мешавад. Агар калид набошад, функсияҳо хомӯшона
 * коре намекунанд — то deploy бе калид ҳам вайрон нашавад.
 */
import * as admin from 'firebase-admin';
import { prisma } from './prisma';

let cachedApp: admin.app.App | null = null;

function getApp(): admin.app.App | null {
  if (cachedApp) return cachedApp;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.warn('[push] FIREBASE_SERVICE_ACCOUNT нест — push хомӯш');
    return null;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    cachedApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return cachedApp;
  } catch (e) {
    console.error('[push] firebase-admin init нашуд', e);
    return null;
  }
}

export type PushResult = { sent: number; failed?: number; skipped?: string };

/** Ба ҳамаи дастгоҳҳои як корбар push мефиристад. */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<PushResult> {
  const app = getApp();
  if (!app) return { sent: 0, skipped: 'no-credentials' };

  const rows = await prisma.deviceToken.findMany({ where: { userId } });
  const tokens = rows.map((r) => r.token);
  if (tokens.length === 0) return { sent: 0, skipped: 'no-tokens' };

  return sendToTokens(app, tokens, title, body, data);
}

async function sendToTokens(
  app: admin.app.App,
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<PushResult> {
  const res = await app.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: data ?? {},
    android: { priority: 'high', notification: { channelId: 'push_messages' } },
  });

  // Token-ҳои беэътибор (uninstall/expired)-ро тоза мекунем.
  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code ?? '';
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-argument') ||
        code.includes('invalid-registration-token')
      ) {
        invalid.push(tokens[i]);
      }
    }
  });
  if (invalid.length > 0) {
    await prisma.deviceToken.deleteMany({ where: { token: { in: invalid } } });
  }

  return { sent: res.successCount, failed: res.failureCount };
}

/** Оё push фаъол аст (калид гузошта шудааст)? */
export function isPushConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT;
}
