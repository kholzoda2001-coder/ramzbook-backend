import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Fallback price table used until an admin sets one in AppSetting `pricing`.
// Amounts are per-country; the website renders `currency + amount`.
const DEFAULT_PRICING: Record<string, any> = {
  TJ: { currency: 'TJS', symbol: 'сом.', monthly: 59, yearly: 399, yearlyOld: 708, lifetime: 799, lifetimeOld: 1200 },
  RU: { currency: 'RUB', symbol: '₽', monthly: 299, yearly: 1990, yearlyOld: 3588, lifetime: 3990, lifetimeOld: 5990 },
  default: { currency: 'USD', symbol: '$', monthly: 2.99, yearly: 10.99, yearlyOld: 16.99, lifetime: 54.99, lifetimeOld: 99.99 },
};

/**
 * GET /api/mobile/pricing[?country=TJ]
 *
 * Returns the subscription price table for the caller's country so the website
 * (and app) can show local prices/currency. The country is taken from Vercel's
 * geo header `x-vercel-ip-country` (added automatically at the edge), or from an
 * explicit `?country=` query param for testing. The price tables live in the
 * admin-editable AppSetting row `pricing` (JSON keyed by ISO country code, with
 * a `default` fallback); if that row is absent we serve DEFAULT_PRICING.
 */
export async function GET(req: NextRequest) {
  try {
    const override = req.nextUrl.searchParams.get('country');
    const geo = req.headers.get('x-vercel-ip-country');
    const country = (override || geo || 'default').toUpperCase();

    let table = DEFAULT_PRICING;
    const row = await prisma.appSetting.findUnique({ where: { key: 'pricing' } });
    if (row) {
      try {
        const parsed = JSON.parse(row.valueJson);
        if (parsed && typeof parsed === 'object') table = parsed;
      } catch {/* keep default table on bad JSON */}
    }

    const plans = table[country] || table['default'] || DEFAULT_PRICING.default;

    return NextResponse.json(
      { country, plans },
      { headers: CORS },
    );
  } catch (err: any) {
    console.error('[mobile/pricing]', err);
    // Never break the pricing UI — fall back to USD defaults on any error.
    return NextResponse.json(
      { country: 'default', plans: DEFAULT_PRICING.default },
      { headers: CORS },
    );
  }
}
