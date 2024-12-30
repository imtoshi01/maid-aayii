import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);

  const token = request.cookies.get('token')?.value;
  console.log('Token:', token ? 'Token found' : 'No token found');

  if (!token) {
    console.log('No token present. Redirecting to /login');
    return NextResponse.redirect(new URL('/register', request.url));
  }

  try {
    const decoded = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    console.log('Token is valid. Decoded payload:', decoded.payload);
    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return NextResponse.redirect(new URL('/register', request.url));
  }
}

export const config = {
  matcher: ['/previous-attendance', '/setup'],
};
