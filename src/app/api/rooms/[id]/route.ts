import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/server/services/roomService';
import { notifyDataChange } from '@/server/events';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = RoomService.getRoomById(id);
    if (!room) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลห้องพัก' }, { status: 404 });
    }
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = RoomService.updateRoom(id, body);
    notifyDataChange('room_updated', { roomId: id, room: updated });
    return NextResponse.json({ message: 'แก้ไขข้อมูลห้องพักสำเร็จ', room: updated });
  } catch (error: any) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    RoomService.deleteRoom(id);
    notifyDataChange('room_updated', { roomId: id });
    return NextResponse.json({ message: 'ลบห้องพักเรียบร้อยแล้ว' });
  } catch (error: any) {

    console.error('Error deleting room:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
