import { getDb } from '@/server/db';
import { Dormitory, Room } from '@/types';

export class DormitoryService {
  static getAllDormitories(search = '', minPrice = 0, maxPrice = 999999): Dormitory[] {
    const db = getDb();
    let query = 'SELECT * FROM dormitories WHERE 1=1';
    const params: any[] = [];

    if (search.trim()) {
      query += ' AND (name LIKE ? OR address LIKE ? OR description LIKE ?)';
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    query += ' ORDER BY createdAt DESC';
    const dorms = db.prepare(query).all(...params) as any[];

    const enriched = dorms.map((dorm) => {
      const roomStats = db.prepare(`
        SELECT 
          COUNT(CASE WHEN status = 'available' THEN 1 END) as availableRoomsCount,
          COUNT(*) as totalRoomsCount,
          MIN(price) as minPrice,
          MAX(price) as maxPrice
        FROM rooms
        WHERE dormitoryId = ?
      `).get(dorm.id) as any;

      let facilities: string[] = [];
      try {
        facilities = JSON.parse(dorm.facilities || '[]');
      } catch {
        facilities = [];
      }

      return {
        ...dorm,
        facilities,
        availableRoomsCount: roomStats?.availableRoomsCount || 0,
        totalRoomsCount: roomStats?.totalRoomsCount || 0,
        minPrice: roomStats?.minPrice || 0,
        maxPrice: roomStats?.maxPrice || 0,
      } as Dormitory;
    });

    return enriched.filter((dorm) => {
      if (dorm.minPrice === 0 && (dorm.totalRoomsCount || 0) === 0) return true;
      return (dorm.minPrice || 0) <= maxPrice && (dorm.maxPrice || 0) >= minPrice;
    });
  }

  static getDormitoryWithRooms(id: string): { dormitory: Dormitory; rooms: Room[] } | null {
    const db = getDb();
    const dorm = db.prepare('SELECT * FROM dormitories WHERE id = ?').get(id) as any;
    if (!dorm) return null;

    try {
      dorm.facilities = JSON.parse(dorm.facilities || '[]');
    } catch {
      dorm.facilities = [];
    }

    const rooms = db.prepare('SELECT * FROM rooms WHERE dormitoryId = ? ORDER BY floor ASC, roomNumber ASC').all(id) as any[];
    const enrichedRooms = rooms.map((r) => {
      try {
        r.amenities = JSON.parse(r.amenities || '[]');
      } catch {
        r.amenities = [];
      }
      return r as Room;
    });

    return { dormitory: dorm as Dormitory, rooms: enrichedRooms };
  }

  static createDormitory(data: {
    name: string;
    description: string;
    address: string;
    phone: string;
    lineId?: string;
    imageUrl?: string;
    facilities?: string[];
    ownerId?: string;
  }): Dormitory {
    const db = getDb();
    const {
      name,
      description,
      address,
      phone,
      lineId = '',
      imageUrl = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      facilities = [],
      ownerId = 'usr_admin1',
    } = data;

    const id = 'dorm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();
    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]);

    db.prepare(`
      INSERT INTO dormitories (id, name, description, address, phone, lineId, imageUrl, facilities, ownerId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, address, phone, lineId, imageUrl, facilitiesJson, ownerId, createdAt);

    const created = db.prepare('SELECT * FROM dormitories WHERE id = ?').get(id) as any;
    created.facilities = JSON.parse(created.facilities);
    return created as Dormitory;
  }

  static updateDormitory(id: string, data: Partial<Dormitory>): Dormitory {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM dormitories WHERE id = ?').get(id);
    if (!existing) throw new Error('ไม่พบข้อมูลหอพัก');

    const facilitiesJson = JSON.stringify(Array.isArray(data.facilities) ? data.facilities : []);

    db.prepare(`
      UPDATE dormitories
      SET name = ?, description = ?, address = ?, phone = ?, lineId = ?, imageUrl = ?, facilities = ?
      WHERE id = ?
    `).run(
      data.name,
      data.description,
      data.address,
      data.phone,
      data.lineId || '',
      data.imageUrl,
      facilitiesJson,
      id
    );

    const updated = db.prepare('SELECT * FROM dormitories WHERE id = ?').get(id) as any;
    updated.facilities = JSON.parse(updated.facilities);
    return updated as Dormitory;
  }

  static deleteDormitory(id: string): void {
    const db = getDb();
    db.prepare('DELETE FROM bookings WHERE dormitoryId = ?').run(id);
    db.prepare('DELETE FROM rooms WHERE dormitoryId = ?').run(id);
    const result = db.prepare('DELETE FROM dormitories WHERE id = ?').run(id);
    if (result.changes === 0) throw new Error('ไม่พบข้อมูลหอพักที่ต้องการลบ');
  }
}
