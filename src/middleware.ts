import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token & role dari cookies
  const token = request.cookies.get('auth_token');
  const role = request.cookies.get('user_role')?.value || '';

  // Daftar rute yang TIDAK memerlukan autentikasi
  const publicPaths = ['/signin', '/signup', '/reset-password'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Rute khusus client (role forwarding / EMKL)
  const isClientPath = request.nextUrl.pathname === '/client' || request.nextUrl.pathname.startsWith('/client/');

  // Rute admin internal
  const isAdminPath = !isClientPath && !isPublicPath;

  // Jika mencoba akses rute private tanpa token, lempar ke signin
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Jika sudah login tapi mencoba akses signin, lempar ke dashboard sesuai role
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Client path: boleh diakses forwarding (dan admin), tapi admin tetap bisa akses.
  // Blokir client (forwarding) untuk mengakses rute admin internal.
  if (token && role === 'forwarding' && isAdminPath) {
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
    '/((?!api|_next/static|_next/image|images|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};