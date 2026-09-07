import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim() || `${request.nextUrl.origin}/api/auth/google/callback`;

  // If Client ID is not configured yet, redirect back to login with error
  if (!clientId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'กรุณาระบุ GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ในไฟล์ .env ก่อนใช้งาน Google Login');
    return NextResponse.redirect(loginUrl);
  }

  // Generate random CSRF state
  const state = crypto.randomBytes(16).toString('hex');

  // Google OAuth 2.0 Authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleAuthUrl);

  // Set CSRF state cookie (valid for 10 minutes)
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
