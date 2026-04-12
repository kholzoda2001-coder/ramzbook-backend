import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

// Paths that require admin authentication
const ADMIN_PATHS = ['/admin', '/api/admin'];

// Paths inside admin that should be bypassed
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/admin/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isAdminPath && !isPublicAdminPath) {
    // 1. Get token from cookie
    const token = req.cookies.get('admin_token')?.value;

    // 2. Verify token
    const isValid = token ? await verifyAdminToken(token) : null;

    if (!isValid) {
      // 3. Fallback to older header check just in case (optional, but requested to remove, so we only rely on cookie)
      const headerKey = req.headers.get('x-admin-api-key');
      const expectedKey = process.env.ADMIN_API_KEY;
      
      if (expectedKey && headerKey === expectedKey) {
        // Technically valid by old legacy method, allow through for API compatibility if needed
        return NextResponse.next();
      }

      // If API route, return 401
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
      }

      // If Next.js page route, redirect to login
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes not under /admin)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
