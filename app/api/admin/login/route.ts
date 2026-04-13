import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, setAdminCookie, clearAdminCookie } from '@/lib/admin-auth';

// Secure fallbacks provided out-of-the-box as requested.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kholzoda2001@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2001KholzodA';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (
      email.trim().toLowerCase() === ADMIN_USERNAME.trim().toLowerCase() && 
      password.trim() === ADMIN_PASSWORD.trim()
    ) {
      // 1. Generate token
      const token = await signAdminToken(email);
      // 2. Set strict secure HTTP-only cookie
      await setAdminCookie(token);

      return NextResponse.json({ success: true });
    }

    // Delay response to mitigate timing attacks slightly
    await new Promise(resolve => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[Admin Login API]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Clear the cookie for logout
  clearAdminCookie();
  return NextResponse.json({ success: true });
}
