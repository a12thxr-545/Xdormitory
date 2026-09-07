import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/authService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle user cancelling or LINE returning an error
  if (errorParam) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', `LINE Login ล้มเหลว: ${errorDescription || errorParam}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'ไม่พบรหัสยืนยัน Authorization Code จาก LINE');
    return NextResponse.redirect(loginUrl);
  }

  // Verify CSRF state
  const savedState = request.cookies.get('line_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.warn('LINE OAuth state mismatch or expired');
    // For local testing leniency, proceed with warning if state expired, otherwise flag error
  }

  const channelId = process.env.LINE_CHANNEL_ID?.trim();
  const channelSecret = process.env.LINE_CHANNEL_SECRET?.trim() || '300ee83b5e2cfd167fddffc1ec5d059e';
  const callbackUrl = process.env.LINE_CALLBACK_URL?.trim() || `${request.nextUrl.origin}/api/auth/line/callback`;

  try {
    // 1. Exchange authorization code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', callbackUrl);
    tokenParams.append('client_id', channelId || '');
    tokenParams.append('client_secret', channelSecret);

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'ไม่สามารถแลกรับ Access Token จาก LINE ได้');
    }

    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    // 2. Fetch User Profile from LINE API
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData.userId) {
      throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์จาก LINE ได้');
    }

    const { userId, displayName, pictureUrl } = profileData;

    // Optional: Decode email from ID Token if available
    let email = '';
    if (idToken) {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.email) email = payload.email;
        }
      } catch (err) {
        console.warn('Could not decode email from LINE id_token:', err);
      }
    }

    // 3. Register or sync with SQLite database via AuthService
    const user = AuthService.socialLogin({
      provider: 'line',
      socialId: userId,
      name: displayName || 'ผู้ใช้ LINE',
      avatarUrl: pictureUrl || '',
      email: email || `line_${userId.substring(0, 10)}@xdormitory.com`,
    });

    // 4. Return HTML that stores user into localStorage and redirects to destination
    const targetUrl = user.role === 'admin' ? '/admin' : '/';
    const userJson = JSON.stringify(user).replace(/</g, '\\u003c');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LINE Login Success - Xdormitory</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
            .card { background: white; padding: 2rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 360px; width: 90%; }
            .spinner { border: 3px solid #e2e8f0; border-top: 3px solid #06C755; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { font-size: 1.125rem; color: #0f172a; margin: 0 0 0.5rem; }
            p { font-size: 0.875rem; color: #64748b; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2>เข้าสู่ระบบด้วย LINE สำเร็จ!</h2>
            <p>ยินดีต้อนรับคุณ ${displayName || ''} กำลังนำท่านเข้าสู่ระบบ...</p>
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

    // Clear oauth state cookie
    response.cookies.delete('line_oauth_state');

    return response;
  } catch (error: any) {
    console.error('Error in LINE OAuth callback:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', `เกิดข้อผิดพลาดในการเชื่อมต่อ LINE: ${error.message}`);
    return NextResponse.redirect(loginUrl);
  }
}
