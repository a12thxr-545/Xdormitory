import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/server/services/bookingService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || undefined;
    const dormitoryId = request.nextUrl.searchParams.get('dormitoryId') || undefined;
    const q = request.nextUrl.searchParams.get('q') || undefined;

    const bookings = BookingService.getBookings(userId, dormitoryId, q);
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const createdBooking = BookingService.createBookingWithAtomicLock(body);

    return NextResponse.json(
      {
        message: 'จองห้องพักสำเร็จ! ระบบได้ออกรหัสการจองเรียบร้อยแล้ว',
        booking: createdBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);

    if (error.message === 'ROOM_ALREADY_BOOKED') {
      return NextResponse.json(
        {
          error: 'ขออภัย ห้องพักนี้มีผู้จองแล้วหรือไม่อยู่ในสถานะว่าง (Prevent Double Booking)',
          code: 'DOUBLE_BOOKING_PREVENTED',
        },
        { status: 409 }
      );
    }

    if (error.message === 'ROOM_NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบข้อมูลห้องพักที่เลือก' }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการบันทึกการจอง' }, { status: 400 });
  }
}
