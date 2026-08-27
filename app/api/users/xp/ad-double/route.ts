import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { grantAdXp, getAdXpStatus } from '@/lib/adXp';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/xp/ad-double
 *
 * Ҳолати имрӯза бе додани чизе — то экрани «Дарс тамом шуд» тугмаро
 * пеш аз пахш дуруст нишон диҳад ё умуман пинҳон кунад.
 */
export async function GET(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ success: true, ...(await getAdXpStatus(user.id)) });
  } catch (error: any) {
    console.error('[xp/ad-double GET]', error);
    return NextResponse.json({ error: 'Failed to load status' }, { status: 400 });
  }
}

/**
 * POST /api/users/xp/ad-double   { lessonId }
 *
 * Баъди тамошои пурраи видеои мукофотӣ даъват мешавад. XP-и ҳамон дарсро
 * бори дуюм медиҳад.
 *
 * ⚠️ Барнома МИҚДОРро намефиристад — танҳо `lessonId`. Ҳамаи рақамҳо аз
 * база гирифта мешаванд (`UserProgress.xpEarned`). Ин фарқи асосии ин роҳ
 * аз `/api/mobile/progress` аст, ки рақами клиентро бе ҳадди боло қабул
 * мекунад.
 *
 * Модели эътимод ҳамон аст, ки `/users/gems/ad-reward` дорад: даъвои
 * «видео тамом шуд»-и барнома бовар карда мешавад, вале се муҳофиз
 * (як бонус ба як дарс, панҷарраи 15 дақиқа, сақфи рӯзона) зарари
 * дурӯғи муваффақро аз он чи хонандаи ҳалол ройгон мегирад, зиёд
 * намегузоранд. Ҳалли комил — SSV: худи шабака ба callback-и имзошудаи
 * мо занг занад ва мо аз он супорем.
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const lessonId = typeof body?.lessonId === 'string' ? body.lessonId.trim() : '';
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    const result = await grantAdXp(user.id, lessonId);
    // Рад кардан ХАТО нест — барнома бояд ҷавоби сохторӣ гирад ва матни
    // дурустро нишон диҳад («имрӯз лимит тамом шуд» ≠ «чизе шикаст»).
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[xp/ad-double POST]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant XP' },
      { status: 400 },
    );
  }
}
