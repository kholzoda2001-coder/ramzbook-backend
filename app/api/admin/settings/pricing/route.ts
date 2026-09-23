import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: 'pricing' } });
    let config = null;
    if (row) {
      try {
        config = JSON.parse(row.valueJson);
      } catch (e) {
        console.error('Failed to parse pricing JSON', e);
      }
    }
    return NextResponse.json({ config });
  } catch (err) {
    console.error('[admin/settings/pricing GET]', err);
    return NextResponse.json({ error: 'Failed to load pricing' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.config) {
      return NextResponse.json({ error: 'config required' }, { status: 400 });
    }

    const row = await prisma.appSetting.upsert({
      where: { key: 'pricing' },
      update: { valueJson: JSON.stringify(body.config) },
      create: { key: 'pricing', valueJson: JSON.stringify(body.config) },
    });

    return NextResponse.json({ config: JSON.parse(row.valueJson) });
  } catch (err) {
    console.error('[admin/settings/pricing PUT]', err);
    return NextResponse.json({ error: 'Failed to save pricing' }, { status: 500 });
  }
}
