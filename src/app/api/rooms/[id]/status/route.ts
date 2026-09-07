import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/server/services/roomService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['available', 'booked', 'maintenance'].includes(status)) {
      return NextResponse.json({ error: 'สถานะห้องพักไม่ถูกต้อง (available, booked, maintenance)' }, { status: 400 });
    }

    RoomService.updateRoomStatus(id, status);

    return NextResponse.json({
      message: `เปลี่ยนสถานะห้องพักเป็น "${status === 'available' ? 'ว่าง (Available)' : status === 'booked' ? 'จองแล้ว (Booked)' : 'ปิดปรับปรุง (Maintenance)'}" เรียบร้อยแล้ว`,
      status,
    });
  } catch (error: any) {
    console.error('Error updating room status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
