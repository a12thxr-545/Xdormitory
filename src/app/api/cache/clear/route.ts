import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    
    // Optimize SQLite memory and sync WAL
    try {
      db.pragma('shrink_memory');
      db.pragma('optimize');
      db.pragma('wal_checkpoint(PASSIVE)');
    } catch (dbErr) {
      console.warn('SQLite cache optimize warning:', dbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'ล้างแคชระบบและรีเฟรชหน่วยความจำสำเร็จแล้ว (Cache Cleared Successfully)',
      clearedAt: new Date().toISOString(),
    });

    // Ensure no client/proxy caching for subsequent calls
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Error in clear cache endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการล้างแคช' },
      { status: 500 }
    );
  }
}
