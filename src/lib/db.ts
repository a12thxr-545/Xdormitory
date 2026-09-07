import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'dormitory.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initTables(dbInstance);
    seedData(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      idCard TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dormitories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      lineId TEXT,
      imageUrl TEXT NOT NULL,
      facilities TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      dormitoryId TEXT NOT NULL,
      roomNumber TEXT NOT NULL,
      floor INTEGER NOT NULL,
      roomType TEXT NOT NULL,
      price REAL NOT NULL,
      deposit REAL NOT NULL,
      sizeSqM REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      amenities TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (dormitoryId) REFERENCES dormitories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      dormitoryId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      guestName TEXT NOT NULL,
      guestPhone TEXT NOT NULL,
      guestEmail TEXT NOT NULL,
      guestIdCard TEXT,
      checkInDate TEXT NOT NULL,
      stayDurationMonths INTEGER DEFAULT 12,
      specialRequests TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      confirmedAt TEXT,
      cancelledAt TEXT,
      cancelReason TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (dormitoryId) REFERENCES dormitories(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    );
  `);
}

function seedData(db: Database.Database) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Data already exists
  }

  const now = new Date().toISOString();

  // 1. Seed Users (User and Admin)
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, phone, idCard, role, createdAt)
    VALUES (@id, @name, @email, @password, @phone, @idCard, @role, @createdAt)
  `);

  insertUser.run({
    id: 'usr_student1',
    name: 'คริสเตียโน โรนัลโด้ (นักศึกษา)',
    email: 'user@xdormitory.com',
    password: 'password123',
    phone: '081-234-5678',
    idCard: '1-1002-34567-89-0',
    role: 'user',
    createdAt: now
  });

  insertUser.run({
    id: 'usr_admin1',
    name: 'คุณสมชาย มั่งคั่ง (เจ้าของหอพัก / ผู้ดูแล)',
    email: 'admin@xdormitory.com',
    password: 'adminpassword',
    phone: '089-987-6543',
    idCard: '3-1005-98765-43-2',
    role: 'admin',
    createdAt: now
  });

  // 2. Seed Dormitories
  const insertDorm = db.prepare(`
    INSERT INTO dormitories (id, name, description, address, phone, lineId, imageUrl, facilities, ownerId, createdAt)
    VALUES (@id, @name, @description, @address, @phone, @lineId, @imageUrl, @facilities, @ownerId, @createdAt)
  `);

  insertDorm.run({
    id: 'dorm_campus_view',
    name: 'เดอะ แคมปัส เรสซิเดนซ์ (The Campus Residence)',
    description: 'หอพักสไตล์โมเดิร์น ติดมหาวิทยาลัย ใกล้ร้านสะดวกซื้อและป้ายรถประจำทาง พร้อมพื้นที่ Co-working space และฟิตเนส มีระบบความปลอดภัยคีย์การ์ดและรปภ. 24 ชั่วโมง',
    address: '99/1 ซอยรังสิตภิรมย์ ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี',
    phone: '02-555-1234',
    lineId: '@campusresidence',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    facilities: JSON.stringify(['High-speed Wi-Fi', 'ระบบคีย์การ์ด Face Scan', 'ฟิตเนส 24 ชม.', 'Co-working Space', 'เครื่องซักผ้าหยอดเหรียญ', 'รปภ. 24 ชั่วโมง', 'ที่จอดรถยนต์/มอเตอร์ไซค์']),
    ownerId: 'usr_admin1',
    createdAt: now
  });

  insertDorm.run({
    id: 'dorm_green_haven',
    name: 'กรีน เฮเว่น เพลส (Green Haven Place)',
    description: 'หอพักบรรยากาศร่มรื่น เงียบสงบ เหมาะสำหรับนักศึกษาและคนทำงานที่ต้องการสมาธิอ่านหนังสือ ห้องพักเพดานสูง โปร่งสบาย เฟอร์นิเจอร์บิวท์อินครบชุด',
    address: '128 หมู่ 4 ถ.พหลโยธิน ต.คลองหก อ.คลองหลวง จ.ปทุมธานี',
    phone: '086-777-8899',
    lineId: '@greenhaven',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    facilities: JSON.stringify(['สวนพักผ่อนส่วนกลาง', 'กล้องวงจรปิด CCTV', 'อินเทอร์เน็ตไฟเบอร์', 'ที่จอดรถในร่ม', 'ตู้กดน้ำดื่ม', 'ระบบประตูสแกนลายนิ้วมือ']),
    ownerId: 'usr_admin1',
    createdAt: now
  });

  insertDorm.run({
    id: 'dorm_skyline_luxury',
    name: 'สกายไลน์ พรีเมียร์ สวีท (Skyline Premier Suite)',
    description: 'หอพักหรูระดับพรีเมียม สไตล์คอนโดมิเนียม มีสระว่ายน้ำบนดาดฟ้า วิวพาโนรามา ใกล้สถานีรถไฟฟ้าเดินทางสะดวก เข้า-ออกด้วยระบบดิจิทัลดอร์ล็อค',
    address: '45/8 ถ.งามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ',
    phone: '092-444-5566',
    lineId: '@skylinesuite',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    facilities: JSON.stringify(['สระว่ายน้ำลอยฟ้า', 'ห้องสตรีม & ซาวน่า', 'EV Charger', 'Smart Locker', 'ลิฟต์ล็อคชั้น', 'ห้องประชุมส่วนตัว', 'แม่บ้านทำความสะอาด']),
    ownerId: 'usr_admin1',
    createdAt: now
  });

  // 3. Seed Rooms for Dormitory 1 (The Campus Residence)
  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, dormitoryId, roomNumber, floor, roomType, price, deposit, sizeSqM, status, amenities, imageUrl, createdAt)
    VALUES (@id, @dormitoryId, @roomNumber, @floor, @roomType, @price, @deposit, @sizeSqM, @status, @amenities, @imageUrl, @createdAt)
  `);

  insertRoom.run({
    id: 'rm_c101',
    dormitoryId: 'dorm_campus_view',
    roomNumber: '101',
    floor: 1,
    roomType: 'สตูดิโอ เตียงเดี่ยว (Single Studio)',
    price: 4500,
    deposit: 9000,
    sizeSqM: 26,
    status: 'available',
    amenities: JSON.stringify(['เครื่องปรับอากาศ Inverter', 'เครื่องทำน้ำอุ่น', 'ตู้เสื้อผ้าขนาดใหญ่', 'โต๊ะทำงานและเก้าอี้', 'เตียง 5 ฟุต พร้อมฟูกสุขภาพ', 'ระเบียงส่วนตัว']),
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  insertRoom.run({
    id: 'rm_c102',
    dormitoryId: 'dorm_campus_view',
    roomNumber: '102',
    floor: 1,
    roomType: 'สตูดิโอ เตียงเดี่ยว (Single Studio)',
    price: 4500,
    deposit: 9000,
    sizeSqM: 26,
    status: 'booked',
    amenities: JSON.stringify(['เครื่องปรับอากาศ Inverter', 'เครื่องทำน้ำอุ่น', 'ตู้เสื้อผ้าขนาดใหญ่', 'โต๊ะทำงาน', 'เตียง 5 ฟุต', 'ระเบียงส่วนตัว']),
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  insertRoom.run({
    id: 'rm_c201',
    dormitoryId: 'dorm_campus_view',
    roomNumber: '201',
    floor: 2,
    roomType: 'ดีลักซ์ เตียงคู่ (Twin Deluxe)',
    price: 5800,
    deposit: 11600,
    sizeSqM: 32,
    status: 'available',
    amenities: JSON.stringify(['เครื่องปรับอากาศ 2 ตัว', 'ตู้เย็น 2 ประตู', 'เครื่องทำน้ำอุ่น', 'เตียงคู่ 3.5 ฟุต 2 เตียง', 'โต๊ะทำงานแยก 2 ชุด', 'ตู้เสื้อผ้าแยก 2 หลัง', 'Smart TV 43 นิ้ว']),
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  insertRoom.run({
    id: 'rm_c202',
    dormitoryId: 'dorm_campus_view',
    roomNumber: '202',
    floor: 2,
    roomType: 'ดีลักซ์ เตียงเดี่ยว วิวสระ (Pool View Suite)',
    price: 6200,
    deposit: 12400,
    sizeSqM: 34,
    status: 'available',
    amenities: JSON.stringify(['แอร์ประหยัดไฟเบอร์ 5', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'ไมโครเวฟ', 'โซฟาเบด', 'เตียงคิงไซส์ 6 ฟุต', 'ระเบียงชมวิวพาโนรามา']),
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  insertRoom.run({
    id: 'rm_c301',
    dormitoryId: 'dorm_campus_view',
    roomNumber: '301',
    floor: 3,
    roomType: 'เพนท์เฮาส์ 1 ห้องนอน (1-Bedroom Penthouse)',
    price: 7500,
    deposit: 15000,
    sizeSqM: 42,
    status: 'available',
    amenities: JSON.stringify(['แยกห้องนอนและห้องนั่งเล่น', 'เคาน์เตอร์ครัวและซิงค์ล้างจาน', 'เครื่องดูดควัน', 'แอร์ 2 ตัว', 'ตู้เย็น', 'เตียง 6 ฟุต', 'Smart TV 55 นิ้ว']),
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  // Rooms for Dormitory 2 (Green Haven Place)
  insertRoom.run({
    id: 'rm_g101',
    dormitoryId: 'dorm_green_haven',
    roomNumber: '101',
    floor: 1,
    roomType: 'สแตนดาร์ด เตียงเดี่ยว (Standard Single)',
    price: 3800,
    deposit: 7600,
    sizeSqM: 24,
    status: 'available',
    amenities: JSON.stringify(['เครื่องปรับอากาศ', 'พัดลมเพดาน', 'เครื่องทำน้ำอุ่น', 'เตียง 5 ฟุต', 'โต๊ะเขียนหนังสือ', 'ตู้เสื้อผ้า']),
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  insertRoom.run({
    id: 'rm_g201',
    dormitoryId: 'dorm_green_haven',
    roomNumber: '201',
    floor: 2,
    roomType: 'การ์เด้นวิว สตูดิโอ (Garden View Studio)',
    price: 4200,
    deposit: 8400,
    sizeSqM: 28,
    status: 'available',
    amenities: JSON.stringify(['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'วิวสวนร่มรื่น', 'ระเบียงกว้าง', 'เตียง 5 ฟุต']),
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  // Rooms for Dormitory 3 (Skyline Premier Suite)
  insertRoom.run({
    id: 'rm_s501',
    dormitoryId: 'dorm_skyline_luxury',
    roomNumber: '501',
    floor: 5,
    roomType: 'สกายไลน์ ลักชูรี สวีท (Skyline Luxury Suite)',
    price: 8900,
    deposit: 17800,
    sizeSqM: 38,
    status: 'available',
    amenities: JSON.stringify(['วิวเมืองชั้นสูง', 'Digital Door Lock', 'แอร์ Daikin Inverter', 'อ่างอาบน้ำ', 'เครื่องซักผ้าในห้อง', 'ไมโครเวฟ & เตาไฟฟ้า']),
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    createdAt: now
  });

  // 4. Seed Initial Sample Booking (to show existing booking in history and admin list)
  const insertBooking = db.prepare(`
    INSERT INTO bookings (id, userId, dormitoryId, roomId, guestName, guestPhone, guestEmail, guestIdCard, checkInDate, stayDurationMonths, specialRequests, status, createdAt, confirmedAt)
    VALUES (@id, @userId, @dormitoryId, @roomId, @guestName, @guestPhone, @guestEmail, @guestIdCard, @checkInDate, @stayDurationMonths, @specialRequests, @status, @createdAt, @confirmedAt)
  `);

  insertBooking.run({
    id: 'BK-20260901-7A39',
    userId: 'usr_student1',
    dormitoryId: 'dorm_campus_view',
    roomId: 'rm_c102',
    guestName: 'คริสเตียโน โรนัลโด้ (นักศึกษา)',
    guestPhone: '081-234-5678',
    guestEmail: 'user@xdormitory.com',
    guestIdCard: '1-1002-34567-89-0',
    checkInDate: '2026-09-15',
    stayDurationMonths: 12,
    specialRequests: 'ขอห้องชั้นล่างและใกล้ที่จอดรถ',
    status: 'confirmed',
    createdAt: '2026-09-01T10:30:00Z',
    confirmedAt: '2026-09-01T14:20:00Z'
  });
}
