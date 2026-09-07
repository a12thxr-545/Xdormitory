import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/authService';

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get('role');
    const userId = request.nextUrl.searchParams.get('userId');

    let user = null;
    if (userId) {
      user = AuthService.getUserById(userId);
    } else if (roleParam === 'admin') {
      user = AuthService.getUserByRole('admin');
    } else {
      user = AuthService.getUserByRole('user');
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET /api/auth:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      const user = AuthService.register(body);
      return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', user }, { status: 201 });
    }

    if (action === 'login') {
      const identifier = body.identifier || body.email || body.username;
      const user = AuthService.login(identifier, body.password);
      return NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ', user });
    }

    if (action === 'social-login') {
      const { provider, email, name, avatarUrl, socialId } = body;
      const user = AuthService.socialLogin({ provider, email, name, avatarUrl, socialId });
      return NextResponse.json({ message: `เข้าสู่ระบบด้วย ${provider === 'google' ? 'Google' : 'LINE'} สำเร็จ`, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/auth:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
