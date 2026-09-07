import { getDb } from '@/server/db';
import { Room } from '@/types';

export class RoomService {
  static getRooms(dormitoryId?: string, status?: string): Room[] {
    const db = getDb();
    let query = `
      SELECT r.*, d.name as dormitoryName
      FROM rooms r
      JOIN dormitories d ON r.dormitoryId = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (dormitoryId && dormitoryId !== 'all') {
      query += ' AND r.dormitoryId = ?';
      params.push(dormitoryId);
    }

    if (status && status !== 'all') {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.floor ASC, r.roomNumber ASC';
    const rooms = db.prepare(query).all(...params) as any[];

    return rooms.map((r) => {
      try {
        r.amenities = JSON.parse(r.amenities || '[]');
      } catch {
        r.amenities = [];
      }
      return r as Room;
    });
  }

  static getRoomById(id: string): Room | null {
    const db = getDb();
    const room = db.prepare(`
      SELECT r.*, d.name as dormitoryName, d.address as dormitoryAddress, d.phone as dormitoryPhone
      FROM rooms r
      JOIN dormitories d ON r.dormitoryId = d.id
      WHERE r.id = ?
    `).get(id) as any;

    if (!room) return null;

    try {
      room.amenities = JSON.parse(room.amenities || '[]');
    } catch {
      room.amenities = [];
    }

    return room as Room;
  }

  static createRoom(data: {
    dormitoryId: string;
    roomNumber: string;
    floor: number;
    roomType: string;
    price: number;
    deposit?: number;
    sizeSqM?: number;
    status?: 'available' | 'booked' | 'maintenance';
    amenities?: string[];
    imageUrl?: string;
  }): Room {
    const db = getDb();
    const {
      dormitoryId,
      roomNumber,
      floor,
      roomType,
      price,
      deposit = price * 2,
      sizeSqM = 25,
      status = 'available',
      amenities = [],
      imageUrl = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    } = data;

    const existing = db.prepare('SELECT id FROM rooms WHERE dormitoryId = ? AND roomNumber = ?').get(dormitoryId, roomNumber);
    if (existing) {
      throw new Error(`ห้องหมายเลข ${roomNumber} มีอยู่ในหอพักนี้แล้ว`);
    }

    const id = 'rm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();
    const amenitiesJson = JSON.stringify(Array.isArray(amenities) ? amenities : []);

    db.prepare(`
      INSERT INTO rooms (id, dormitoryId, roomNumber, floor, roomType, price, deposit, sizeSqM, status, amenities, imageUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, dormitoryId, roomNumber, Number(floor), roomType, Number(price), Number(deposit), Number(sizeSqM), status, amenitiesJson, imageUrl, createdAt);

    return this.getRoomById(id)!;
  }

  static updateRoom(id: string, data: Partial<Room>): Room {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    if (!existing) throw new Error('ไม่พบข้อมูลห้องพัก');

    const amenitiesJson = JSON.stringify(Array.isArray(data.amenities) ? data.amenities : []);

    db.prepare(`
      UPDATE rooms
      SET roomNumber = ?, floor = ?, roomType = ?, price = ?, deposit = ?, sizeSqM = ?, status = ?, amenities = ?, imageUrl = ?
      WHERE id = ?
    `).run(
      data.roomNumber,
      Number(data.floor),
      data.roomType,
      Number(data.price),
      Number(data.deposit),
      Number(data.sizeSqM),
      data.status,
      amenitiesJson,
      data.imageUrl,
      id
    );

    return this.getRoomById(id)!;
  }

  static updateRoomStatus(id: string, status: 'available' | 'booked' | 'maintenance'): void {
    const db = getDb();
    const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(id);
    if (!room) throw new Error('ไม่พบห้องพัก');

    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run(status, id);
  }

  static deleteRoom(id: string): void {
    const db = getDb();
    const activeBooking = db.prepare("SELECT id FROM bookings WHERE roomId = ? AND status IN ('pending', 'confirmed')").get(id);
    if (activeBooking) {
      throw new Error('ไม่สามารถลบห้องพักนี้ได้ เนื่องจากมีรายการจองที่กำลังดำเนินการอยู่');
    }

    const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
    if (result.changes === 0) throw new Error('ไม่พบห้องพักที่ต้องการลบ');
  }
}
