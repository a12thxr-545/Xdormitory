import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/server/services/bookingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = BookingService.getBookingById(id);

    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการจอง' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, cancelReason } = body;

    if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'สถานะการจองไม่ถูกต้อง' }, { status: 400 });
    }

    const updatedBooking = BookingService.updateBookingStatus(id, status, cancelReason);

    return NextResponse.json({
      message: `อัปเดตสถานะการจองเป็น "${status === 'confirmed' ? 'ยืนยันแล้ว' : status === 'cancelled' ? 'ยกเลิกแล้ว' : 'รอการยืนยัน'}" สำเร็จ`,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
