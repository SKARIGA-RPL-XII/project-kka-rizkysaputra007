import { NextResponse } from 'next/server';
import type { NextRequest, NextResponse } from 'next/server';

// Middleware ini akan berjalan SEBELUM halaman dirender ke Browser
export function middleware(request: NextRequest) {
  // 1. Cek apakah URL ditujukan ke /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // 2. Cek Cookie 'auth' yang di-set saat Login
    // Login API Anda (app/api/login/route.ts) sudah men-set cookie bernama 'auth'
    const authCookie = request.cookies.get('auth');

    // 3. Jika tidak ada cookie 'auth', tendang ke halaman login
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika bukan /admin, lanjutkan ke halaman yang diminta
  return NextResponse.next();
}