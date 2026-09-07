import { NextRequest, NextResponse } from 'next/server';
import { DormitoryService } from '@/server/services/dormitoryService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = DormitoryService.getDormitoryWithRooms(id);
    if (!result) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลหอพัก' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching dormitory:', error);
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
    const updated = DormitoryService.updateDormitory(id, body);
    return NextResponse.json({ message: 'แก้ไขข้อมูลหอพักสำเร็จ', dormitory: updated });
  } catch (error: any) {
    console.error('Error updating dormitory:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    DormitoryService.deleteDormitory(id);
    return NextResponse.json({ message: 'ลบหอพักและข้อมูลห้องพักเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Error deleting dormitory:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
