import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Let static files pass through
  if (pathname.startsWith('/advi-preview') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/advi-preview.html', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
