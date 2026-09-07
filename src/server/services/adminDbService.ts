import { getDb, getDbPath, reseedDatabase } from '@/server/db';
import fs from 'fs';

export class AdminDbService {
  static getDatabaseStats() {
    const db = getDb();
    const dbPath = getDbPath();

    let fileSizeKb = 0;
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        fileSizeKb = Math.round(stats.size / 1024);
      }
    } catch (e) {
      // ignore
    }

    const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    const dormsCount = (db.prepare('SELECT COUNT(*) as count FROM dormitories').get() as any)?.count || 0;

    const roomStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance
      FROM rooms
    `).get() as any;

    const bookingStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM bookings
    `).get() as any;

    return {
      dbPath,
      fileSizeKb,
      tables: {
        users: usersCount,
        dormitories: dormsCount,
        rooms: {
          total: roomStats?.total || 0,
          available: roomStats?.available || 0,
          booked: roomStats?.booked || 0,
          maintenance: roomStats?.maintenance || 0,
        },
        bookings: {
          total: bookingStats?.total || 0,
          pending: bookingStats?.pending || 0,
          confirmed: bookingStats?.confirmed || 0,
          cancelled: bookingStats?.cancelled || 0,
        },
      },
    };
  }

  static getTableRows(tableName: 'users' | 'dormitories' | 'rooms' | 'bookings', limit = 50) {
    const db = getDb();
    const allowed = ['users', 'dormitories', 'rooms', 'bookings'];
    if (!allowed.includes(tableName)) {
      throw new Error('ตารางไม่ถูกต้อง');
    }

    if (tableName === 'users') {
      return db.prepare('SELECT id, name, email, phone, idCard, role, createdAt FROM users ORDER BY createdAt DESC LIMIT ?').all(limit);
    }

    return db.prepare(`SELECT * FROM ${tableName} ORDER BY createdAt DESC LIMIT ?`).all(limit);
  }

  static exportFullDatabase() {
    const db = getDb();
    const users = db.prepare('SELECT id, name, email, phone, idCard, role, createdAt FROM users').all();
    const dormitories = db.prepare('SELECT * FROM dormitories').all();
    const rooms = db.prepare('SELECT * FROM rooms').all();
    const bookings = db.prepare('SELECT * FROM bookings').all();

    return {
      exportedAt: new Date().toISOString(),
      databaseVersion: '1.0.0',
      system: 'Xdormitory Database Backup',
      data: {
        users,
        dormitories,
        rooms,
        bookings,
      },
    };
  }

  static resetDatabase() {
    const db = getDb();
    reseedDatabase(db);
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (e) {}
    return {
      message: 'รีเซ็ตฐานข้อมูลและสร้างข้อมูลตัวอย่างเริ่มต้น (Seed Data) สำเร็จแล้ว',
      stats: this.getDatabaseStats(),
    };
  }

  static updateUserRole(userId: string, newRole: 'admin' | 'user') {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId) as any;
    if (!user) throw new Error('ไม่พบบัญชีผู้ใช้งาน');

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
    try {
      db.pragma('wal_checkpoint(PASSIVE)');
    } catch (e) {}

    return {
      message: `เปลี่ยนสิทธิ์ผู้ใช้ "${user.name}" (${user.email}) เป็น "${newRole === 'admin' ? 'เจ้าของหอพัก / Admin' : 'ผู้เช่า (User)'}" เรียบร้อยแล้ว`,
      userId,
      newRole,
    };
  }

  static updateTableRow(tableName: 'users' | 'dormitories' | 'rooms' | 'bookings', id: string, fields: Record<string, any>) {
    const db = getDb();
    const allowed = ['users', 'dormitories', 'rooms', 'bookings'];
    if (!allowed.includes(tableName)) throw new Error('ตารางไม่ถูกต้อง');

    const keys = Object.keys(fields).filter((k) => k !== 'id');
    if (keys.length === 0) throw new Error('ไม่มีข้อมูลที่ต้องการอัปเดต');

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => {
      const val = fields[k];
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });

    db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`).run(...values);

    try {
      db.pragma('wal_checkpoint(PASSIVE)');
    } catch (e) {}

    return db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(id);
  }
}

