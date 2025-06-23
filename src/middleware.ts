import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings'];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = token ? !!verifyToken(token) : false;

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const url = new URL('/auth', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes - redirect to dashboard if already logged in
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 