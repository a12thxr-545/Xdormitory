'use client';

import React, { useState, useEffect } from 'react';
import { Room, Dormitory, User, Booking } from '@/types';
import {
  X,
  Check,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Copy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface BookingModalProps {
  room: Room | null;
  dormitory: Dormitory | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
  onViewHistory: () => void;
}

export default function BookingModal({
  room,
  dormitory,
  currentUser,
  isOpen,
  onClose,
  onBookingComplete,
  onViewHistory,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [checkInDate, setCheckInDate] = useState('');
  const [stayDurationMonths, setStayDurationMonths] = useState(12);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIdCard, setGuestIdCard] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Default next week check-in
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      const defaultDateStr = today.toISOString().split('T')[0];
      setCheckInDate(defaultDateStr);

      if (currentUser) {
        setGuestName(currentUser.name || '');
        setGuestPhone(currentUser.phone || '');
        setGuestEmail(currentUser.email || '');
        setGuestIdCard(currentUser.idCard || '');
      }

      setStep(1);
      setError(null);
      setCreatedBooking(null);
      setCopied(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !room || !dormitory) return null;

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!checkInDate) {
        setError('กรุณาเลือกวันที่ต้องการเข้าพัก');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!guestName || !guestPhone) {
        setError('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อ');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        userId: currentUser?.id || 'usr_student1',
        dormitoryId: dormitory.id,
        roomId: room.id,
        guestName,
        guestPhone,
        guestEmail,
        guestIdCard,
        checkInDate,
        stayDurationMonths,
        specialRequests,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'DOUBLE_BOOKING_PREVENTED' || res.status === 409) {
          throw new Error(data.error || 'ห้องพักนี้ถูกจองไปแล้ว (Prevent Double Booking)');
        }
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกการจอง');
      }

      setCreatedBooking(data.booking);
      setStep(4);
      onBookingComplete(data.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBookingId = () => {
    if (createdBooking?.id) {
      navigator.clipboard.writeText(createdBooking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              Room Booking System
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {step === 4 ? 'ยืนยันการจองเรียบร้อย' : 'ขั้นตอนการจองห้องพัก'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  1
                </span>
                <span>เลือกวันเข้าพัก</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  2
                </span>
                <span>ข้อมูลผู้จอง</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  3
                </span>
                <span>ตรวจสอบ & ยืนยัน</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">{error}</span>
              {error.includes('Double Booking') && (
                <span className="text-[11px] text-slate-600 mt-1 block">
                  ระบบป้องกันการจองซ้ำทำงานถูกต้อง เนื่องจากมีผู้จองห้องนี้แล้ว โปรดยกเลิกและเลือกห้องอื่นครับ
                </span>
              )}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* STEP 1: Select Check-in Date & Duration */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Selected Room Recap */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={room.imageUrl}
                    alt={room.roomNumber}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {dormitory.name}
                    </h3>
                    <p className="text-xs text-slate-800 font-semibold">
                      ห้อง {room.roomNumber} (ชั้น {room.floor}) • {room.roomType}
                    </p>
                    <p className="text-xs text-slate-500">
                      ค่าเช่า ฿{room.price.toLocaleString()} /เดือน
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เลือกวันที่ต้องการเข้าพัก (Select Check-in Date) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * แนะนำเลือกวันก่อนเริ่มรอบบิลอย่างน้อย 3-7 วัน
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ระยะเวลาสัญญาเช่า
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setStayDurationMonths(months)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        stayDurationMonths === months
                          ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {months} เดือน {months === 12 && '(สัญญารายปี)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prevent Double Booking Note */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0" />
                <span>ห้องพักนี้จะถูกตรวจสอบความว่างแบบ Atomic Lock ในขั้นตอนยืนยัน</span>
              </div>
            </div>
          )}

          {/* STEP 2: Enter Guest Information */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ - นามสกุล ผู้เข้าพัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    อีเมลติดต่อ
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เลขบัตรประจำตัวประชาชน
                </label>
                <input
                  type="text"
                  value={guestIdCard}
                  onChange={(e) => setGuestIdCard(e.target.value)}
                  placeholder="1-xxxx-xxxxx-xx-x"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ความต้องการพิเศษ / หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="เช่น ขอเตียงแยก, นำรถยนต์ส่วนตัวมา 1 คัน..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Confirm Booking Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  สรุปรายละเอียดการจองห้องพัก
                </h3>

                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-slate-500">หอพัก:</span>
                  <span className="font-semibold text-slate-900 text-right">{dormitory.name}</span>

                  <span className="text-slate-500">ห้องพัก:</span>
                  <span className="font-semibold text-slate-900 text-right">ห้อง {room.roomNumber} (ชั้น {room.floor})</span>

                  <span className="text-slate-500">วันที่เข้าพัก:</span>
                  <span className="font-semibold text-slate-900 text-right">{checkInDate}</span>

                  <span className="text-slate-500">ระยะสัญญา:</span>
                  <span className="font-semibold text-slate-900 text-right">{stayDurationMonths} เดือน</span>

                  <span className="text-slate-500">ผู้จอง:</span>
                  <span className="font-semibold text-slate-900 text-right">{guestName} ({guestPhone})</span>

                  <span className="text-slate-500">ค่าเช่ารายเดือน:</span>
                  <span className="font-bold text-slate-900 text-right">฿{room.price.toLocaleString()} /ด.</span>

                  <span className="text-slate-500">เงินประกันสัญญา:</span>
                  <span className="font-bold text-slate-900 text-right">฿{room.deposit.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">ยอดชำระแรกเข้าโดยประมาณ:</span>
                  <span className="text-base font-bold text-slate-900">
                    ฿{(room.price + room.deposit).toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* Prevent Double Booking Assurance */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                <span>
                  เมื่อกดยืนยัน ระบบจะทำ <strong>Prevent Double Booking Lock</strong> ทันที หากห้องยังว่าง ระบบจะออก <strong>Booking ID</strong> ให้คุณอย่างสมบูรณ์
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Success with Generated Booking ID */}
          {step === 4 && createdBooking && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-9 h-9 text-slate-900" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  จองห้องพักสำเร็จแล้ว
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ระบบได้สร้างรหัสการจองและแจ้งเตือนไปยังเจ้าของหอพักเรียบร้อยแล้ว
                </p>
              </div>

              {/* Generated Booking ID Display Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white max-w-sm mx-auto shadow-sm">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                  System Generated Booking ID
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
                    {createdBooking.id}
                  </span>
                  <button
                    onClick={copyBookingId}
                    title="คัดลอกรหัสการจอง"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && <p className="text-[10px] text-slate-300 mt-1">คัดลอกรหัสแล้ว</p>}
              </div>

              {/* Details Summary */}
              <div className="text-xs text-slate-600 max-w-sm mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
                <p><strong>หอพัก:</strong> {dormitory.name}</p>
                <p><strong>ห้อง:</strong> {room.roomNumber} • <strong>วันเข้าพัก:</strong> {createdBooking.checkInDate}</p>
                <p className="mt-1 text-slate-800 font-medium">
                  สถานะ: รอการยืนยันจากเจ้าของหอพัก (Pending)
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
              >
                <span>ถัดไป: ข้อมูลผู้จอง</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
              >
                <span>ถัดไป: ตรวจสอบข้อมูล</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>แก้ไขข้อมูล</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBooking}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังตรวจสอบความว่าง...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ยืนยันการจอง</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 4 && (
            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
              >
                ปิดหน้านี้
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewHistory();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
              >
                ดูประวัติการจองของฉัน
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
