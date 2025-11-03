import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths - login sayfası
  const isPublicPath = pathname === '/login';

  // Dashboard paths - korumalı sayfalar
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Cookie'den token kontrol et
  const token = request.cookies.get('authToken')?.value;

  // Login sayfasındaysa ve token varsa, dashboard'a yönlendir
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Dashboard sayfalarında ve token yoksa, login'e yönlendir
  if (isDashboardPath && !token) {
    // Ancak localStorage kullanıyoruz, bu yüzden bu kontrolü client-side yapacağız
    // Bu middleware sadece cookie bazlı auth için çalışır
    // Şimdilik pass-through yapalım
    return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
