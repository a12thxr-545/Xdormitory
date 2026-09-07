'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, ShieldCheck, Zap, Users } from 'lucide-react';

export default function DiagramInfoBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/30 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Full Diagram Implementation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                100% ตรงตาม Flowchart Diagram
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              ระบบจองหอพักออนไลน์ (Xdormitory Architecture)
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 backdrop-blur-xs transition-all w-fit cursor-pointer"
        >
          <span>{isExpanded ? 'ซ่อนรายละเอียด Diagram' : 'คลิกดูการแมปฟังก์ชันตาม Diagram'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in">
          
          {/* User Side */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ฝั่งผู้ใช้ทั่วไป (User)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Register / Login (เข้าสู่ระบบ/สมัครสมาชิก)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Edit personal information (แก้ไขข้อมูลส่วนตัว)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Search for dormitories (ค้นหาหอพัก & ฟิลเตอร์)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>View available rooms (ดูห้องพักที่ว่าง)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>View room details (ดูรายละเอียดห้องพัก)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>View booking history (ดูประวัติการจอง)</span>
              </li>
            </ul>
          </div>

          {/* Room Booking System Core */}
          <div className="bg-indigo-600/20 rounded-2xl p-4 border border-indigo-400/30 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-indigo-400" />
              Room Booking System (Core Flow)
            </div>
            <div className="space-y-1 text-slate-300 font-mono text-[11px]">
              <p>1. Select Dormitory</p>
              <p>2. Select Room</p>
              <p>3. Select Check-in Date</p>
              <p>4. Enter Guest Information</p>
              <p>5. Confirm Booking</p>
              <p className="text-amber-300 font-bold">↳ System Generates [Booking ID]</p>
            </div>
            <div className="mt-2 pt-2 border-t border-indigo-400/20 flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prevent Double Booking (Atomic Lock)</span>
            </div>
          </div>

          {/* Admin Side */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>เจ้าของหอพัก / Admin</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Add / Edit / Delete Dormitory Information</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Add / Edit / Delete Rooms</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Set Room Status (Available / Booked)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>View Booking List (ดูรายการจอง)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Select Dormitory (เลือกหอพักที่ดูแล)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Confirm or Cancel Booking (ยืนยัน/ยกเลิก)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Search by Booking ID or Guest Name</span>
              </li>
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
