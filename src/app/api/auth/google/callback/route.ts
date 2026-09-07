import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/authService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // Handle user cancelling or Google returning an error
  if (errorParam) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', `Google Login ถูกยกเลิกหรือล้มเหลว: ${errorParam}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'ไม่พบ Authorization Code จาก Google');
    return NextResponse.redirect(loginUrl);
  }

  // Verify CSRF state
  const savedState = request.cookies.get('google_oauth_state')?.value;
  if (savedState && savedState !== state) {
    console.warn('Google OAuth state mismatch');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim() || `${request.nextUrl.origin}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'ไม่สามารถแลกรับ Access Token จาก Google ได้');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile from Google UserInfo API
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await userInfoRes.json();
    if (!userInfoRes.ok || !userInfo.id) {
      throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์จาก Google ได้');
    }

    const { id: googleId, name, email, picture } = userInfo;

    // 3. Register or sync with SQLite database via AuthService
    const user = AuthService.socialLogin({
      provider: 'google',
      socialId: googleId,
      name: name || 'ผู้ใช้ Google',
      avatarUrl: picture || '',
      email: email || `google_${googleId}@xdormitory.com`,
    });

    // 4. Return HTML that stores user into localStorage and redirects
    const targetUrl = user.role === 'admin' ? '/admin' : '/';
    const userJson = JSON.stringify(user).replace(/</g, '\\u003c');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Login Success - Xdormitory</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
            .card { background: white; padding: 2rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 360px; width: 90%; }
            .spinner { border: 3px solid #e2e8f0; border-top: 3px solid #4285F4; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { font-size: 1.125rem; color: #0f172a; margin: 0 0 0.5rem; }
            p { font-size: 0.875rem; color: #64748b; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2>เข้าสู่ระบบด้วย Google สำเร็จ!</h2>
            <p>ยินดีต้อนรับคุณ ${name || ''} กำลังนำท่านเข้าสู่ระบบ...</p>
          </div>
          <script>
            try {
              localStorage.setItem('xdorm_user', JSON.stringify(${userJson}));
            } catch (e) {
              console.error(e);
            }
            setTimeout(function() {
              window.location.href = '${targetUrl}';
            }, 600);
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    response.cookies.delete('google_oauth_state');
    return response;
  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', `เกิดข้อผิดพลาดในการเชื่อมต่อ Google: ${error.message}`);
    return NextResponse.redirect(loginUrl);
  }
}
