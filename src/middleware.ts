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
const protectedRoutes = ['/dashboard', '/settings', '/home'];

// Define public routes that should redirect to login if not authenticated
const publicRoutes = ['/'];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'];

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

  // Handle public routes - redirect to login if not authenticated
  if (publicRoutes.some(route => pathname === route)) {
    if (!isAuthenticated) {
      console.log('Redirecting unauthenticated user from landing to login');
      const url = new URL('/auth/login', request.url);
      return NextResponse.redirect(url);
    } else {
      // If authenticated, redirect to dashboard
      console.log('Redirecting authenticated user from landing to dashboard');
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      console.log('Redirecting unauthenticated user from protected route to login');
      const url = new URL('/auth/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes - redirect to dashboard if already logged in
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      console.log('Redirecting authenticated user from auth to dashboard');
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