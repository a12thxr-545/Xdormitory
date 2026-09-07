# XDormitory - ระบบจองหอพักออนไลน์ (Dormitory Booking System)

ระบบเว็บแอปพลิเคชันจองหอพักออนไลน์ตามมาตรฐาน Architecture Flowchart Diagram พัฒนาด้วย Next.js (App Router), TypeScript, Tailwind CSS, และ SQLite

---

## 🌟 ฟังก์ชันการทำงานหลัก

* **ฝั่งผู้เช่า (User Portal - `/user`)**:
  * ค้นหาหอพักตามชื่อ ทำเล และช่วงราคา
  * ตรวจสอบห้องว่างและดูรายละเอียดสิ่งอำนวยความสะดวก
  * ระบบจองห้องพักแบบเรียลไทม์ พร้อม **Prevent Double Booking Lock** ป้องกันการจองซ้ำ
  * ตรวจสอบประวัติการจองของตนเอง
  * แก้ไขข้อมูลส่วนตัว
* **ฝั่งเจ้าของหอพัก / ผู้ดูแล (Admin Portal - `/admin`)**:
  * เพิ่ม แก้ไข ลบ ข้อมูลหอพักและห้องพัก
  * ปรับเปลี่ยนสถานะห้องพัก (Available / Booked / Maintenance) ใน 1-คลิก
  * ตรวจสอบ อนุมัติ หรือยกเลิกการจอง (ห้องพักจะถูกปลดล็อคกลับเป็นห้องว่างอัตโนมัติ)
  * ค้นหารายการจองด้วย Booking ID หรือชื่อผู้เข้าพัก
  * **ระบบจัดการฐานข้อมูลหลังบ้าน (Database Manager)**: ตรวจสอบสถิติ, ดูข้อมูลตาราง, สำรองข้อมูล (Export JSON Backup), แต่งตั้งสิทธิ์ Admin, และรีเซ็ตข้อมูลเริ่มต้น (Reset Seed Data)
* **ระบบความปลอดภัยและการแยก Role**:
  * หน้า Login (`/login`) และ Register (`/register`) มีไว้สำหรับผู้เช่าเท่านั้น
  * สิทธิ์ Admin ต้องได้รับการแต่งตั้งจากระบบหลังบ้านเท่านั้น
  * มีระบบ Role Guard ป้องกันไม่ให้ผู้เช่าเข้าถึงหน้า Admin (`Access Denied`)

---

## 🚀 วิธีการติดตั้งและเปิดใช้งาน

### วิธีที่ 1: รันโดยตรงในเครื่อง (แนะนำสำหรับพัฒนา - ไม่ต้องใช้ Docker)

**ความต้องการของระบบ**: Node.js v18 ขึ้นไป

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นระบบเซิร์ฟเวอร์
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

---

### วิธีที่ 2: รันผ่าน Docker (สำหรับ Deploy หรือรันแบบ Container)

**ความต้องการของระบบ**: ติดตั้ง Docker Desktop

```bash
# 1. สั่งสร้าง Image และเปิดใช้งาน Container ในเบื้องหลัง
docker compose up --build -d

# 2. ดู Log การทำงานของระบบ
docker compose logs -f

# 3. หยุดการทำงานของ Container
docker compose down
```

> **หมายเหตุเรื่องฐานข้อมูลใน Docker**: โฟลเดอร์ `./data` ของเครื่องคุณจะถูกเชื่อมต่อเข้ากับ `/app/data` ใน Container โดยอัตโนมัติ ทำให้ข้อมูลการจองและหอพักทั้งหมดจะไม่สูญหายแม้จะ Restart หรือปิด Docker

---

## 🔑 บัญชีตัวอย่างสำหรับทดสอบระบบ (Default Seed Accounts)

* **บัญชีผู้เช่า / นักศึกษา (User)**:
  * อีเมล: `user@xdormitory.com`
  * รหัสผ่าน: `password123`
* **บัญชีเจ้าของหอพัก / ผู้ดูแล (Admin)**:
  * อีเมล: `admin@xdormitory.com`
  * รหัสผ่าน: `adminpassword`

---

## ⚙️ โครงสร้างไฟล์สภาพแวดล้อม (.env)

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/dormitory.db
JWT_SECRET=xdormitory_super_secret_jwt_key_2026
NEXT_PUBLIC_APP_NAME=XDormitory
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
