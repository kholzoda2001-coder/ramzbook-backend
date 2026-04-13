import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/admin-auth';

// Admin credentials — env vars take priority; hardcoded as safe fallback defaults
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'kholzoda2001@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '2001KholzodA').trim();

export async function POST(req: NextRequest) {
  try {
    let body: { email?: string; password?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email va parol talab qilinadi.' },
        { status: 400 }
      );
    }

    const emailMatch    = email.trim().toLowerCase() === ADMIN_USERNAME;
    const passwordMatch = password.trim() === ADMIN_PASSWORD;

    if (emailMatch && passwordMatch) {
      // Generate signed JWT
      const token = await signAdminToken(email.trim().toLowerCase());

      const res = NextResponse.json({ success: true });
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        // In non-production (local dev) allow non-HTTPS cookies
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return res;
    }

    // Slight delay to mitigate timing-based enumeration attacks
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json(
      { success: false, error: 'Email yoki parol noto\'g\'ri.' },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Admin Login] Unexpected error:', message);
    return NextResponse.json(
      { success: false, error: 'Server xatosi. Iltimos, qayta urinib ko\'ring.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout — clear the cookie
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
