'use client';

import React, { useState, useEffect } from 'react';
import { Booking, User } from '@/types';
import {
  CalendarCheck,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Search,
  BedDouble,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface BookingHistoryProps {
  currentUser: User | null;
  onExploreClick: () => void;
}

export default function BookingHistory({ currentUser, onExploreClick }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = currentUser ? `/api/bookings?userId=${currentUser.id}` : '/api/bookings';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.dormitoryName?.toLowerCase().includes(q) ||
      b.roomNumber?.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full w-fit mb-2 border border-slate-200">
            <CalendarCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>ประวัติการจองของผู้ใช้ (View Booking History)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            รายการจองห้องพักของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentUser ? `บัญชีผู้ใช้: ${currentUser.name}` : 'รายการจองทั้งหมดของคุณ'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-900' : ''}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer"
          >
            <BedDouble className="w-4 h-4" />
            <span>ค้นหาหอพักเพิ่ม</span>
          </button>
        </div>
      </div>

      {/* Search Bar for user bookings */}
      {bookings.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วย Booking ID, ชื่อหอพัก หรือเลขห้อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/90 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">กำลังโหลดรายการจองห้องพัก...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/90 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">ยังไม่พบประวัติการจองห้องพัก</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              คุณยังไม่มีรายการจองห้องพักในระบบ สามารถเลือกดูหอพักและทำการจองห้องที่ว่างได้ทันที
            </p>
          </div>
          <button
            onClick={onExploreClick}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-2xs transition-all cursor-pointer"
          >
            เริ่มค้นหาหอพักและจองห้อง
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isPending = booking.status === 'pending';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* Left: ID & Dorm info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                        <span>{booking.id}</span>
                        <button
                          onClick={() => copyId(booking.id)}
                          title="คัดลอกรหัส"
                          className="hover:text-white text-slate-400 transition-colors"
                        >
                          {copiedId === booking.id ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Status Badge */}
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white shadow-2xs">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          ยืนยันแล้ว (Confirmed)
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          รอการอนุมัติ (Pending)
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          ยกเลิกแล้ว (Cancelled)
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 pt-1">
                      {booking.dormitoryName}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium">
                      ห้องพักเลขที่ {booking.roomNumber} (ชั้น {booking.floor || '-'}) • {booking.roomType}
                    </p>
                  </div>

                  {/* Right: Price */}
                  <div className="lg:text-right">
                    <span className="text-xs text-slate-400 block">ค่าเช่ารายเดือน</span>
                    <span className="text-xl font-bold text-slate-900">
                      ฿{booking.price ? booking.price.toLocaleString() : '—'}{' '}
                      <span className="text-xs font-normal text-slate-500">/เดือน</span>
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block">วันที่เริ่มเข้าพัก</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {booking.checkInDate} ({booking.stayDurationMonths} เดือน)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block">ชื่อผู้เข้าพัก</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {booking.guestName} ({booking.guestPhone})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block">วันที่ทำการจอง</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {new Date(booking.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800">
                    <strong>คำขอพิเศษ:</strong> {booking.specialRequests}
                  </div>
                )}

                {isCancelled && booking.cancelReason && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800">
                    <strong>เหตุผลที่ยกเลิก:</strong> {booking.cancelReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
