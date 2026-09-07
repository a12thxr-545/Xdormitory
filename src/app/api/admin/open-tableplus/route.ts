import { NextRequest, NextResponse } from 'next/server';
import { getDb, getDbPath } from '@/server/db';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    
    // Checkpoint all WAL data into the main dormitory.db file so external tools see it immediately
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (e) {
      console.warn('Checkpoint warning:', e);
    }

    const absoluteDbPath = path.resolve(getDbPath());

    // Execute macOS open command for TablePlus
    await new Promise((resolve, reject) => {
      exec(`open -a TablePlus "${absoluteDbPath}"`, (error, stdout, stderr) => {
        if (error) {
          // If TablePlus app name fails, fallback to default open
          exec(`open "${absoluteDbPath}"`, (fallbackErr) => {
            if (fallbackErr) resolve(false);
            else resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    });

    return NextResponse.json({
      success: true,
      path: absoluteDbPath,
      message: 'เปิดฐานข้อมูลใน TablePlus เรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error opening TablePlus:', error);
    return NextResponse.json(
      { error: error.message || 'ไม่สามารถเปิด TablePlus ได้' },
      { status: 500 }
    );
  }
}
