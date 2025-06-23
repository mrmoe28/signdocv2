import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT verification for Edge Runtime
function verifyTokenEdge(token: string): boolean {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload without verification for now
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    // Check if userId exists
    return !!payload.userId;
  } catch {
    return false;
  }
}

// Define protected routes that require authentication  
const protectedRoutes = ['/home', '/dashboard', '/settings'];

// Define public routes that should redirect to auth if not authenticated
const publicRoutes = ['/'];

// Define auth routes that should redirect to dashboard if already logged in
// const authRoutes = ['/auth', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  let isAuthenticated = false;
  
  if (token) {
    isAuthenticated = verifyTokenEdge(token);
  }
  
  // Debug logging
  console.log(`Middleware: ${pathname}, Token: ${token ? 'exists' : 'none'}, Authenticated: ${isAuthenticated}`);

  // Handle public routes - redirect to auth if not authenticated
  if (publicRoutes.some(route => pathname === route)) {
    if (!isAuthenticated) {
      console.log('Redirecting unauthenticated user from landing to auth');
      const url = new URL('/auth', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const url = new URL('/auth', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes - redirect to home if already logged in
  if (pathname.startsWith('/auth')) {
    if (isAuthenticated) {
      console.log('Redirecting authenticated user from auth to home');
      const url = new URL('/home', request.url);
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