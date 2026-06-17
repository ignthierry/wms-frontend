import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token dari cookies
  const token = request.cookies.get('auth_token');

  // Daftar rute yang TIDAK memerlukan autentikasi
  const publicPaths = ['/signin', '/signup', '/reset-password'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Jika mencoba akses rute private tanpa token, lempar ke signin
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Jika sudah login tapi mencoba akses signin, lempar ke dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Hanya jalankan middleware untuk rute halaman utama, wms, dll, dan kecualikan rute statis/asset
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (public images directory)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
