import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID?.trim();
  const callbackUrl = process.env.LINE_CALLBACK_URL?.trim() || `${request.nextUrl.origin}/api/auth/line/callback`;

  if (!channelId) {
    // Channel ID not configured yet in .env
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'กรุณาระบุ LINE_CHANNEL_ID ในไฟล์ .env ก่อนใช้งาน LINE Login');
    return NextResponse.redirect(loginUrl);
  }

  // Generate random CSRF state
  const state = crypto.randomBytes(16).toString('hex');

  // LINE Authorization URL
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', channelId);
  lineAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  lineAuthUrl.searchParams.set('state', state);
  lineAuthUrl.searchParams.set('scope', 'profile openid email');
  lineAuthUrl.searchParams.set('prompt', 'consent');

  const response = NextResponse.redirect(lineAuthUrl);

  // Set CSRF state cookie (valid for 10 minutes)
  response.cookies.set('line_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
