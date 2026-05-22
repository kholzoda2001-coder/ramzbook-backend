import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Run prisma migrate deploy which applies pending migrations
    const cwd = process.cwd();
    const output = execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd,
      env: { ...process.env },
      timeout: 60000,
      encoding: 'utf8',
    });
    return NextResponse.json({ success: true, output });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error?.message,
      stderr: error?.stderr,
      stdout: error?.stdout
    }, { status: 500 });
  }
}
