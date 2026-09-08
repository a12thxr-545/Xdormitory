import { NextRequest, NextResponse } from 'next/server';
import { AdminDbService } from '@/server/services/adminDbService';
import { notifyDataChange } from '@/server/events';

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action');

    if (action === 'backup') {
      const backupData = AdminDbService.exportFullDatabase();
      return NextResponse.json(backupData);
    }

    if (action === 'table') {
      const tableName = request.nextUrl.searchParams.get('table') as any;
      const rows = AdminDbService.getTableRows(tableName || 'users');
      return NextResponse.json({ table: tableName, rows });
    }

    // Default: Return stats
    const stats = AdminDbService.getDatabaseStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error in GET /api/admin/db:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      const result = AdminDbService.resetDatabase();
      notifyDataChange('db_reset');
      return NextResponse.json(result);
    }

    if (action === 'changeRole') {
      const { userId, role } = body;
      if (!userId || !['user', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (userId, role: user/admin)' }, { status: 400 });
      }
      const result = AdminDbService.updateUserRole(userId, role);
      notifyDataChange('user_updated', { userId, role });
      return NextResponse.json(result);
    }

    if (action === 'updateRow') {
      const { table, id, fields } = body;
      if (!table || !id || !fields) {
        return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (table, id, fields)' }, { status: 400 });
      }
      const updatedRow = AdminDbService.updateTableRow(table, id, fields);
      notifyDataChange('db_updated', { table, id });
      return NextResponse.json({ message: 'บันทึกข้อมูลเรียบร้อยแล้ว', row: updatedRow });
    }


    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/db:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
