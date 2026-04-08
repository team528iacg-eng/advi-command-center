import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't need auth (auth is handled client-side via Zustand+localStorage)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|advi-preview).*)'],
};
