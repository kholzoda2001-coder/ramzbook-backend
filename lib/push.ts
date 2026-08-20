/**
 * lib/push.ts — FCM push (серверӣ).
 *
 * firebase-admin бо калиди Service Account (env `FIREBASE_SERVICE_ACCOUNT`,
 * JSON-и як сатрӣ) init мешавад. Агар калид набошад, функсияҳо хомӯшона
 * коре намекунанд — то deploy бе калид ҳам вайрон нашавад.
 *
 * Се қоидаи ҳатмӣ, ки ҲАМАИ фиристодан аз онҳо мегузарад:
 *  1. `user.pushEnabled` — тугмаи «Огоҳномаҳо» дар профил (акнун серверӣ);
 *  2. лимити рӯзона — на бештар аз 3 push дар як шабонарӯз;
 *  3. матн ҳамеша ШАХСӢ аст — ниг. `lib/pushMessages.ts`.
 *
 * Ҳозир танҳо Android дастгирӣ мешавад (iOS: APNs ҳанӯз танзим нашудааст).
 */
import * as admin from 'firebase-admin';
import { prisma } from './prisma';
import { buildMessage, loadLearnerContext, type BuiltinCampaign } from './pushMessages';

let cachedApp: admin.app.App | null = null;

/**
 * Ҳадди аксари push дар ЯК рӯз ба ЯК корбар.
 *
 * Чаро на «фосилаи 20 соат»: занҷири воқеӣ метавонад дар як рӯз ду қадам дошта
 * бошад — огоҳии НАРМ соати 19:00 ва огоҳии ҚАВӢ бо ҳисоби вақт соати 21:30.
 * Фосилаи 20-соата қадами дуюмро мекушт. Акнун лимит рӯзона аст.
 */
const MAX_PUSH_PER_DAY = 3;

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

export type PushResult = {
  sent: number;
  failed?: number;
  skipped?: string;
  /** Матни воқеие, ки фиристода шуд — барои панели админ ва лог. */
  title?: string;
  body?: string;
};

export type SendOptions = {
  /** Тугмаи профилро сарфи назар кунад (танҳо барои санҷиши админ). */
  ignorePreference?: boolean;
  /** Лимити рӯзонаро сарфи назар кунад (санҷиш). */
  ignoreFrequencyCap?: boolean;
  /** Барои таърих: кадом кампания ин паёмро фиристод. */
  campaignId?: string | null;
  campaignKey?: string | null;
  /** Таърихро нанависад (мас. пешнамоиш). */
  skipLog?: boolean;
};

/** Як сатри таърих (`PushSend`) менависад — хатои лог набояд push-ро вайрон кунад. */
async function log(
  userId: string,
  status: string,
  title: string,
  body: string,
  opts: SendOptions,
  reason?: string,
) {
  if (opts.skipLog) return;
  try {
    await prisma.pushSend.create({
      data: {
        userId,
        campaignId: opts.campaignId ?? null,
        campaignKey: opts.campaignKey ?? null,
        title,
        body,
        status,
        reason: reason ?? null,
      },
    });
  } catch (_) {/* таърих аз худи push муҳимтар нест */}
}

/**
 * Ба ҳамаи дастгоҳҳои як корбар push мефиристад.
 * Матни ТАЙЁРро мегирад; барои матни шахсӣ `sendCampaignToUser` истифода баред.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  opts: SendOptions = {},
): Promise<PushResult> {
  const app = getApp();
  if (!app) return { sent: 0, skipped: 'no-credentials' };

  // 1. Хоҳиши корбар + лимити рӯзона.
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushEnabled: true, lastPushAt: true },
  });
  if (!u) return { sent: 0, skipped: 'no-user' };
  if (!u.pushEnabled && !opts.ignorePreference) {
    await log(userId, 'skipped', title, body, opts, 'push-disabled');
    return { sent: 0, skipped: 'push-disabled' };
  }
  if (!opts.ignoreFrequencyCap) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayCount = await prisma.pushSend.count({
      where: { userId, status: 'sent', createdAt: { gte: since } },
    });
    if (todayCount >= MAX_PUSH_PER_DAY) {
      await log(userId, 'skipped', title, body, opts, 'daily-cap');
      return { sent: 0, skipped: 'daily-cap' };
    }
  }

  // 2. Token-ҳои дастгоҳ.
  const rows = await prisma.deviceToken.findMany({ where: { userId } });
  const tokens = rows.map((r) => r.token);
  if (tokens.length === 0) {
    await log(userId, 'skipped', title, body, opts, 'no-tokens');
    return { sent: 0, skipped: 'no-tokens' };
  }

  const res = await sendToTokens(app, tokens, title, body, data);

  // 3. Вақти охирин + таърих.
  if (res.sent > 0) {
    await prisma.user
      .update({ where: { id: userId }, data: { lastPushAt: new Date() } })
      .catch(() => {/* лог муҳимтар нест аз худи push */});
  }
  await log(userId, res.sent > 0 ? 'sent' : 'failed', title, body, opts);

  return { ...res, title, body };
}

/**
 * Push-и ШАХСӢ: матн аз рӯи ҳолати воқеии хонанда (ном, силсила, дарси
 * навбатӣ, дилҳо) ва бо забони интерфейси ӯ сохта мешавад.
 */
export async function sendCampaignToUser(
  userId: string,
  campaign: BuiltinCampaign,
  opts: SendOptions = {},
): Promise<PushResult> {
  const ctx = await loadLearnerContext(userId);
  if (!ctx) return { sent: 0, skipped: 'no-user' };
  const msg = buildMessage(campaign, ctx);
  return sendPushToUser(userId, msg.title, msg.body, msg.data, opts);
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
    android: {
      priority: 'high',
      // Огоҳии кӯҳна маъно надорад — агар телефон ду рӯз хомӯш буд, нафиристад.
      ttl: 24 * 60 * 60 * 1000,
      // Ҳамон канале, ки барнома дар оғоз месозад (NotificationService.init).
      // `collapseKey` — то ду огоҳии як кампания дар трей ҷамъ нашаванд.
      collapseKey: data?.campaign ?? 'ramz',
      notification: {
        channelId: 'push_messages',
        icon: 'ic_notification',
        color: '#15A993',
        // Тап → фаъолияти асосии Flutter (коркард дар push_service.dart).
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
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
