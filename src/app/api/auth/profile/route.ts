import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/authService';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, idCard } = body;

    if (!id || !name || !phone) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, เบอร์โทรศัพท์)' }, { status: 400 });
    }

    const updatedUser = AuthService.updateProfile(id, name, phone, idCard);
    return NextResponse.json({ message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
