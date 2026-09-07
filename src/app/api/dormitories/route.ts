import { NextRequest, NextResponse } from 'next/server';
import { DormitoryService } from '@/server/services/dormitoryService';

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';
    const minPrice = Number(request.nextUrl.searchParams.get('minPrice')) || 0;
    const maxPrice = Number(request.nextUrl.searchParams.get('maxPrice')) || 999999;

    const dormitories = DormitoryService.getAllDormitories(search, minPrice, maxPrice);
    return NextResponse.json({ dormitories });
  } catch (error) {
    console.error('Error in GET /api/dormitories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newDorm = DormitoryService.createDormitory(body);
    return NextResponse.json({ message: 'เพิ่มข้อมูลหอพักสำเร็จ', dormitory: newDorm }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/dormitories:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
