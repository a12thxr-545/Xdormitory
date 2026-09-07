import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/server/services/roomService';

export async function GET(request: NextRequest) {
  try {
    const dormitoryId = request.nextUrl.searchParams.get('dormitoryId') || undefined;
    const status = request.nextUrl.searchParams.get('status') || undefined;

    const rooms = RoomService.getRooms(dormitoryId, status);
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRoom = RoomService.createRoom(body);
    return NextResponse.json({ message: 'เพิ่มห้องพักสำเร็จ', room: newRoom }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/rooms:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
