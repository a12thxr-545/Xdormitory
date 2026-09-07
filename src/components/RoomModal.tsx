'use client';

import React from 'react';
import Link from 'next/link';
import { Room, Dormitory } from '@/types';
import { X, Bed, Maximize2, ShieldCheck, CheckCircle, Ban, Wrench, Calendar, Sparkles, LogIn } from 'lucide-react';

interface RoomModalProps {
  room: Room | null;
  dormitory: Dormitory | null;
  isOpen: boolean;
  onClose: () => void;
  onStartBooking: (room: Room) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export default function RoomModal({
  room,
  dormitory,
  isOpen,
  onClose,
  onStartBooking,
  isLoggedIn = false,
  onRequireLogin,
}: RoomModalProps) {
  if (!isOpen || !room) return null;

  const isAvailable = room.status === 'available';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Image Banner */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={room.imageUrl}
            alt={`ห้อง ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            {room.status === 'available' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-white backdrop-blur-md shadow-2xs border border-white/10">
                <CheckCircle className="w-3.5 h-3.5" />
                สถานะ: ว่างพร้อมเข้าอยู่ (Available)
              </span>
            )}
            {room.status === 'booked' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-200 backdrop-blur-md shadow-2xs border border-white/10">
                <Ban className="w-3.5 h-3.5" />
                สถานะ: จองแล้ว (Booked)
              </span>
            )}
            {room.status === 'maintenance' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-700/90 text-slate-200 backdrop-blur-md shadow-2xs border border-white/10">
                <Wrench className="w-3.5 h-3.5" />
                สถานะ: กำลังปิดปรับปรุง (Maintenance)
              </span>
            )}
          </div>

          {/* Room Title on Image */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="text-xs font-medium text-slate-300">
                {dormitory?.name || room.dormitoryName}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2">
                ห้อง {room.roomNumber}
                <span className="text-sm font-normal text-slate-300">ชั้น {room.floor}</span>
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">{room.roomType}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-300 block">ค่าเช่ารายเดือน</span>
              <span className="text-2xl font-bold text-white">
                ฿{room.price.toLocaleString()}
                <span className="text-xs font-normal text-slate-300">/ด.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs text-slate-500">ขนาดห้อง</span>
              <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Maximize2 className="w-4 h-4 text-slate-700" />
                {room.sizeSqM} ตร.ม.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs text-slate-500">เงินประกัน/มัดจำ</span>
              <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                ฿{room.deposit.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs text-slate-500">ตำแหน่งชั้น</span>
              <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                ชั้น {room.floor}
              </span>
            </div>
          </div>

          {/* Amenities List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              สิ่งอำนวยความสะดวกภายในห้องพัก
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {room.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Double Booking Prevention Guarantee Notice */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">
                ระบบป้องกันการจองซ้ำซ้อน (Prevent Double Booking Protected)
              </span>
              ห้องพักนี้เชื่อมต่อกับระบบ Atomic Database Lock เมื่อกดยืนยันการจอง ระบบจะล็อคห้องและออก Booking ID ทันที ปลอดภัยและมั่นใจได้ 100%
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-slate-500 block">รวมชำระแรกเข้า (ค่าเช่า 1 ด. + มัดจำ)</span>
            <span className="text-lg font-bold text-slate-900">
              ฿{(room.price + room.deposit).toLocaleString()} บาท
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white transition-colors"
            >
              ปิด
            </button>

            {isAvailable ? (
              isLoggedIn ? (
                <button
                  onClick={() => {
                    onClose();
                    onStartBooking(room);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>จองห้องนี้ทันที</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onRequireLogin) onRequireLogin();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบเพื่อจองห้องนี้</span>
                </button>
              )
            ) : (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-sm font-medium cursor-not-allowed"
              >
                {room.status === 'booked' ? 'ห้องนี้ถูกจองแล้ว' : 'ปิดปรับปรุงชั่วคราว'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
