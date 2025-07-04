import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware() {
  // For now, allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 