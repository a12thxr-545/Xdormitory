import { getDb } from '@/server/db';
import { Booking } from '@/types';

export class BookingService {
  static getBookings(userId?: string, dormitoryId?: string, query?: string): Booking[] {
    const db = getDb();
    let sql = `
      SELECT 
        b.*, 
        d.name as dormitoryName, 
        r.roomNumber, 
        r.roomType, 
        r.price,
        r.floor
      FROM bookings b
      JOIN dormitories d ON b.dormitoryId = d.id
      JOIN rooms r ON b.roomId = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      sql += ' AND b.userId = ?';
      params.push(userId);
    }

    if (dormitoryId && dormitoryId !== 'all') {
      sql += ' AND b.dormitoryId = ?';
      params.push(dormitoryId);
    }

    if (query && query.trim()) {
      sql += ' AND (b.id LIKE ? OR b.guestName LIKE ? OR b.guestPhone LIKE ?)';
      const pattern = `%${query.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY b.createdAt DESC';
    return db.prepare(sql).all(...params) as Booking[];
  }

  static getBookingById(id: string): Booking | null {
    const db = getDb();
    const booking = db.prepare(`
      SELECT 
        b.*, 
        d.name as dormitoryName, 
        d.address as dormitoryAddress,
        d.phone as dormitoryPhone,
        r.roomNumber, 
        r.roomType, 
        r.price,
        r.deposit
      FROM bookings b
      JOIN dormitories d ON b.dormitoryId = d.id
      JOIN rooms r ON b.roomId = r.id
      WHERE b.id = ?
    `).get(id);

    return (booking as Booking) || null;
  }

  /**
   * PREVENT DOUBLE BOOKING: Atomic Transaction with Status Check
   */
  static createBookingWithAtomicLock(data: {
    userId: string;
    dormitoryId: string;
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    guestIdCard?: string;
    checkInDate: string;
    stayDurationMonths?: number;
    specialRequests?: string;
  }): Booking {
    const db = getDb();
    const {
      userId,
      dormitoryId,
      roomId,
      guestName,
      guestPhone,
      guestEmail = '',
      guestIdCard = '',
      checkInDate,
      stayDurationMonths = 12,
      specialRequests = '',
    } = data;

    if (!dormitoryId || !roomId || !guestName || !guestPhone || !checkInDate) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    const tx = db.transaction(() => {
      // 1. Check room status
      const room = db.prepare('SELECT id, status FROM rooms WHERE id = ?').get(roomId) as any;
      if (!room) {
        throw new Error('ROOM_NOT_FOUND');
      }

      if (room.status !== 'available') {
        throw new Error('ROOM_ALREADY_BOOKED');
      }

      // 2. Extra check for active booking
      const activeBooking = db.prepare(`
        SELECT id FROM bookings 
        WHERE roomId = ? AND status IN ('pending', 'confirmed')
      `).get(roomId);

      if (activeBooking) {
        throw new Error('ROOM_ALREADY_BOOKED');
      }

      // 3. Generate Booking ID (BK-YYYYMMDD-XXXX)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingId = `BK-${datePart}-${randomSuffix}`;
      const now = new Date().toISOString();

      // 4. Insert booking
      db.prepare(`
        INSERT INTO bookings (
          id, userId, dormitoryId, roomId, guestName, guestPhone, guestEmail,
          guestIdCard, checkInDate, stayDurationMonths, specialRequests, status, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(
        bookingId,
        userId,
        dormitoryId,
        roomId,
        guestName,
        guestPhone,
        guestEmail,
        guestIdCard,
        checkInDate,
        Number(stayDurationMonths),
        specialRequests,
        now
      );

      // 5. Lock room to 'booked'
      db.prepare("UPDATE rooms SET status = 'booked' WHERE id = ?").run(roomId);

      return bookingId;
    });

    const bookingId = tx();
    return this.getBookingById(bookingId)!;
  }

  static updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'pending', cancelReason?: string): Booking {
    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as any;
    if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

    const tx = db.transaction(() => {
      const now = new Date().toISOString();

      if (status === 'confirmed') {
        db.prepare("UPDATE bookings SET status = 'confirmed', confirmedAt = ? WHERE id = ?").run(now, id);
        db.prepare("UPDATE rooms SET status = 'booked' WHERE id = ?").run(booking.roomId);
      } else if (status === 'cancelled') {
        db.prepare("UPDATE bookings SET status = 'cancelled', cancelledAt = ?, cancelReason = ? WHERE id = ?").run(
          now,
          cancelReason || 'ยกเลิกโดยเจ้าของหอพัก / ผู้ดูแล',
          id
        );
        // Automatically release room back to available!
        db.prepare("UPDATE rooms SET status = 'available' WHERE id = ?").run(booking.roomId);
      } else {
        db.prepare("UPDATE bookings SET status = 'pending' WHERE id = ?").run(id);
      }
    });

    tx();
    return this.getBookingById(id)!;
  }
}
