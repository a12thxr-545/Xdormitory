'use client';

import React, { useState, useEffect } from 'react';
import { Dormitory, Room, Booking } from '@/types';
import {
  ShieldCheck,
  Building,
  BedDouble,
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
  MapPin,
  Phone,
} from 'lucide-react';

interface AdminDashboardProps {
  onRefreshAll: () => void;
}

export default function AdminDashboard({ onRefreshAll }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'rooms' | 'dormitories'>('bookings');

  // Data states
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Modal states for CRUD
  const [isDormModalOpen, setIsDormModalOpen] = useState(false);
  const [editingDorm, setEditingDorm] = useState<Dormitory | null>(null);
  const [dormForm, setDormForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    lineId: '',
    imageUrl: '',
    facilities: 'Wi-Fi, ลิฟต์, ที่จอดรถ, กล้องวงจรปิด',
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    dormitoryId: '',
    roomNumber: '',
    floor: 1,
    roomType: 'สตูดิโอ เตียงเดี่ยว (Single Studio)',
    price: 4500,
    deposit: 9000,
    sizeSqM: 26,
    status: 'available' as 'available' | 'booked' | 'maintenance',
    amenities: 'เครื่องปรับอากาศ, เครื่องทำน้ำอุ่น, ตู้เสื้อผ้า, เตียง 5 ฟุต',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
  });

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dormitories
      const resDorms = await fetch('/api/dormitories');
      const dataDorms = await resDorms.json();
      if (resDorms.ok) {
        setDormitories(dataDorms.dormitories || []);
      }

      // 2. Rooms
      const resRooms = await fetch('/api/rooms');
      const dataRooms = await resRooms.json();
      if (resRooms.ok) {
        setRooms(dataRooms.rooms || []);
      }

      // 3. Bookings
      const resBookings = await fetch('/api/bookings');
      const dataBookings = await resBookings.json();
      if (resBookings.ok) {
        setBookings(dataBookings.bookings || []);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------------------------------------------
  // DORMITORY CRUD
  // -------------------------------------------------------------
  const handleOpenAddDorm = () => {
    setEditingDorm(null);
    setDormForm({
      name: '',
      description: '',
      address: '',
      phone: '',
      lineId: '',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      facilities: 'High-speed Wi-Fi, ลิฟต์, ที่จอดรถ, กล้องวงจรปิด, รปภ. 24 ชม.',
    });
    setIsDormModalOpen(true);
  };

  const handleOpenEditDorm = (dorm: Dormitory) => {
    setEditingDorm(dorm);
    setDormForm({
      name: dorm.name,
      description: dorm.description,
      address: dorm.address,
      phone: dorm.phone,
      lineId: dorm.lineId || '',
      imageUrl: dorm.imageUrl,
      facilities: dorm.facilities.join(', '),
    });
    setIsDormModalOpen(true);
  };

  const handleSaveDormitory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facilitiesArray = dormForm.facilities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: dormForm.name,
        description: dormForm.description,
        address: dormForm.address,
        phone: dormForm.phone,
        lineId: dormForm.lineId,
        imageUrl: dormForm.imageUrl,
        facilities: facilitiesArray,
      };

      const url = editingDorm ? `/api/dormitories/${editingDorm.id}` : '/api/dormitories';
      const method = editingDorm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลหอพักไม่สำเร็จ');

      showMsg('success', editingDorm ? 'แก้ไขข้อมูลหอพักสำเร็จ' : 'เพิ่มหอพักใหม่สำเร็จ');
      setIsDormModalOpen(false);
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  const handleDeleteDormitory = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบหอพัก "${name}" และห้องพักทั้งหมดในหอพักนี้ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/dormitories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบหอพักไม่สำเร็จ');

      showMsg('success', 'ลบข้อมูลหอพักเรียบร้อยแล้ว');
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // -------------------------------------------------------------
  // ROOM CRUD & STATUS CHANGE
  // -------------------------------------------------------------
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      dormitoryId: dormitories[0]?.id || '',
      roomNumber: '',
      floor: 1,
      roomType: 'สตูดิโอ เตียงเดี่ยว (Single Studio)',
      price: 4500,
      deposit: 9000,
      sizeSqM: 26,
      status: 'available',
      amenities: 'เครื่องปรับอากาศ, เครื่องทำน้ำอุ่น, ตู้เสื้อผ้า, เตียง 5 ฟุต, ระเบียง',
      imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      dormitoryId: room.dormitoryId,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomType: room.roomType,
      price: room.price,
      deposit: room.deposit,
      sizeSqM: room.sizeSqM,
      status: room.status,
      amenities: room.amenities.join(', '),
      imageUrl: room.imageUrl,
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesArray = roomForm.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...roomForm,
        amenities: amenitiesArray,
      };

      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลห้องพักไม่สำเร็จ');

      showMsg('success', editingRoom ? 'แก้ไขข้อมูลห้องพักสำเร็จ' : 'เพิ่มห้องพักใหม่สำเร็จ');
      setIsRoomModalOpen(false);
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  const handleDeleteRoom = async (id: string, roomNum: string) => {
    if (!confirm(`คุณต้องการลบห้อง ${roomNum} ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบห้องพักไม่สำเร็จ');

      showMsg('success', 'ลบห้องพักเรียบร้อยแล้ว');
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // Set Room Status (Available / Booked / Maintenance) - As specified in diagram
  const handleUpdateRoomStatus = async (roomId: string, newStatus: 'available' | 'booked' | 'maintenance') => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เปลี่ยนสถานะห้องพักไม่สำเร็จ');

      showMsg('success', data.message || 'เปลี่ยนสถานะห้องพักเรียบร้อย');
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // -------------------------------------------------------------
  // BOOKINGS: Confirm or Cancel Booking
  // -------------------------------------------------------------
  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    const actionLabel = status === 'confirmed' ? 'ยืนยันการจอง' : 'ยกเลิกการจอง';
    const cancelReason = status === 'cancelled' ? 'ยกเลิกโดยเจ้าของหอพัก / ผู้ดูแล (ห้องพักถูกปลดล็อคแล้ว)' : '';

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตสถานะการจองไม่สำเร็จ');

      showMsg('success', data.message || `${actionLabel}เรียบร้อยแล้ว`);
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // Filtered Bookings for the Booking List
  const filteredBookings = bookings.filter((b) => {
    // 1. Select Dormitory filter
    if (selectedDormitoryId !== 'all' && b.dormitoryId !== selectedDormitoryId) {
      return false;
    }

    // 2. Status filter
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) {
      return false;
    }

    // 3. Search Booking by Booking ID or Guest Name
    if (bookingSearchQuery) {
      const q = bookingSearchQuery.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchPhone = b.guestPhone.toLowerCase().includes(q);
      const matchRoom = b.roomNumber?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchRoom) return false;
    }

    return true;
  });

  // Filtered Rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedDormitoryId !== 'all' && r.dormitoryId !== selectedDormitoryId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>ระบบผู้ดูแลหอพัก (Admin Panel)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            จัดการหอพักและรายการจอง
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ควบคุมสถานะห้องพัก ตรวจสอบรายการจอง และค้นหาข้อมูลผู้เข้าพัก
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-500' : 'text-slate-400'}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Global Action Message */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in ${
            actionMsg.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-800'
              : 'bg-slate-100 text-slate-800 border border-slate-300'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-white shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Main Filter & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        
        {/* Navigation SubTabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>รายการจอง</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'rooms'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>จัดการห้องพัก</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('dormitories')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'dormitories'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>จัดการหอพัก</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {dormitories.length}
            </span>
          </button>
        </div>

        {/* "Select Dormitory" Dropdown Filter as in Diagram */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">
            เลือกหอพัก:
          </span>
          <select
            value={selectedDormitoryId}
            onChange={(e) => setSelectedDormitoryId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">หอพักทั้งหมด (All Dormitories)</option>
            {dormitories.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VIEW BOOKING LIST & SEARCH BOOKINGS */}
      {/* ========================================================================= */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          
          {/* Search Booking by Booking ID or Guest Name */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาด้วย Booking ID (เช่น BK-...) หรือชื่อผู้เข้าพัก..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
              <button
                onClick={() => setBookingStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  bookingStatusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({bookings.length})
              </button>
              <button
                onClick={() => setBookingStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  bookingStatusFilter === 'pending'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                รออนุมัติ ({bookings.filter((b) => b.status === 'pending').length})
              </button>
              <button
                onClick={() => setBookingStatusFilter('confirmed')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  bookingStatusFilter === 'confirmed'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ยืนยันแล้ว ({bookings.filter((b) => b.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setBookingStatusFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  bookingStatusFilter === 'cancelled'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ยกเลิก ({bookings.filter((b) => b.status === 'cancelled').length})
              </button>
            </div>
          </div>

          {/* Bookings Table / Cards */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700">ไม่พบข้อมูลการจองตามเงื่อนไข</h3>
              <p className="text-xs text-slate-500">
                ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะเป็น &quot;ทั้งหมด&quot;
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Booking ID</th>
                      <th className="px-5 py-3.5">หอพัก & เลขห้อง</th>
                      <th className="px-5 py-3.5">ข้อมูลผู้เข้าพัก</th>
                      <th className="px-5 py-3.5">วันที่เข้าพัก</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-right">ดำเนินการ (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Booking ID */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {b.id}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {new Date(b.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </td>

                        {/* Dorm & Room */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-900 block line-clamp-1">
                            {b.dormitoryName}
                          </span>
                          <span className="text-slate-600 font-medium">
                            ห้อง {b.roomNumber} (ชั้น {b.floor || '-'})
                          </span>
                        </td>

                        {/* Guest details */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800 block">
                            {b.guestName}
                          </span>
                          <span className="text-slate-500 block">
                            {b.guestPhone}
                          </span>
                          {b.guestEmail && (
                            <span className="text-slate-400 block text-[11px]">
                              {b.guestEmail}
                            </span>
                          )}
                        </td>

                        {/* Check-in */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800 block">
                            {b.checkInDate}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            สัญญา {b.stayDurationMonths} เดือน
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {b.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs bg-slate-900 text-white shadow-2xs">
                              <CheckCircle className="w-3 h-3 text-white" />
                              ยืนยันแล้ว
                            </span>
                          )}
                          {b.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs bg-slate-100 text-slate-800 border border-slate-300">
                              <Clock className="w-3 h-3 text-slate-600" />
                              รออนุมัติ
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs bg-slate-200 text-slate-600 border border-slate-300">
                              <XCircle className="w-3 h-3 text-slate-500" />
                              ยกเลิกแล้ว
                            </span>
                          )}
                        </td>

                        {/* Action buttons (Confirm or Cancel) */}
                        <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              title="อนุมัติและยืนยันการจอง"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1 text-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ยืนยัน</span>
                            </button>
                          )}

                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              title="ยกเลิกการจองและปล่อยห้องว่าง"
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>ยกเลิก</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROOMS MANAGEMENT (ADD / EDIT / DELETE & SET ROOM STATUS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              รายการห้องพัก ({filteredRooms.length} ห้อง)
            </h2>
            <button
              onClick={handleOpenAddRoom}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มห้องพัก (Add Room)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const dormName = dormitories.find((d) => d.id === room.dormitoryId)?.name || room.dormitoryName;

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={room.imageUrl}
                      alt={room.roomNumber}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        ห้อง {room.roomNumber}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {room.status === 'available' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-xs">
                          ว่าง (Available)
                        </span>
                      )}
                      {room.status === 'booked' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-600 text-white shadow-xs">
                          จองแล้ว (Booked)
                        </span>
                      )}
                      {room.status === 'maintenance' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-400 text-white shadow-xs">
                          ปิดปรับปรุง
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block line-clamp-1">
                        {dormName}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {room.roomType}
                      </h3>
                      <p className="text-xs text-slate-500">
                        ชั้น {room.floor} • ขนาด {room.sizeSqM} ตร.ม.
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-1">
                        ฿{room.price.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-slate-400">/เดือน</span>
                      </p>
                    </div>

                    {/* Set Room Status Toggle Buttons (from diagram) */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        ตั้งค่าสถานะห้องพัก (Set Room Status):
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[11px]">
                        <button
                          onClick={() => handleUpdateRoomStatus(room.id, 'available')}
                          className={`py-1.5 rounded-lg font-medium transition-all ${
                            room.status === 'available'
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          ว่าง
                        </button>
                        <button
                          onClick={() => handleUpdateRoomStatus(room.id, 'booked')}
                          className={`py-1.5 rounded-lg font-medium transition-all ${
                            room.status === 'booked'
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          จองแล้ว
                        </button>
                        <button
                          onClick={() => handleUpdateRoomStatus(room.id, 'maintenance')}
                          className={`py-1.5 rounded-lg font-medium transition-all ${
                            room.status === 'maintenance'
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          ปิดซ่อม
                        </button>
                      </div>
                    </div>

                    {/* Edit / Delete buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditRoom(room)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="แก้ไขห้องพัก"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="ลบห้องพัก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DORMITORIES MANAGEMENT (ADD / EDIT / DELETE DORMITORY INFO) */}
      {/* ========================================================================= */}
      {activeSubTab === 'dormitories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              รายการหอพักในระบบ ({dormitories.length} แห่ง)
            </h2>
            <button
              onClick={handleOpenAddDorm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มข้อมูลหอพัก (Add Dormitory)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dormitories.map((dorm) => (
              <div
                key={dorm.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-48 w-full bg-slate-100">
                  <img
                    src={dorm.imageUrl}
                    alt={dorm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xs">
                    {dorm.name}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {dorm.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dorm.address}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dorm.phone} {dorm.lineId && `• Line: ${dorm.lineId}`}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-semibold">
                      ห้องว่าง {dorm.availableRoomsCount || 0} ห้อง
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditDorm(dorm)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDormitory(dorm.id, dorm.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DORMITORY */}
      {/* ========================================================================= */}
      {isDormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDorm ? 'แก้ไขข้อมูลหอพัก' : 'เพิ่มข้อมูลหอพักใหม่'}
              </h3>
              <button
                onClick={() => setIsDormModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDormitory} className="p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อหอพัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dormForm.name}
                  onChange={(e) => setDormForm({ ...dormForm, name: e.target.value })}
                  placeholder="เช่น หอพักสุขสบาย แคมปัส"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดหอพัก <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={dormForm.description}
                  onChange={(e) => setDormForm({ ...dormForm, description: e.target.value })}
                  placeholder="คำอธิบายจุดเด่น บรรยากาศ ความสะดวกสบาย..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ที่อยู่ / ทำเลที่ตั้ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dormForm.address}
                  onChange={(e) => setDormForm({ ...dormForm, address: e.target.value })}
                  placeholder="เช่น ซอยมหาวิทยาลัย ถ.พหลโยธิน..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dormForm.phone}
                    onChange={(e) => setDormForm({ ...dormForm, phone: e.target.value })}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Line ID
                  </label>
                  <input
                    type="text"
                    value={dormForm.lineId}
                    onChange={(e) => setDormForm({ ...dormForm, lineId: e.target.value })}
                    placeholder="@dormitory"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL รูปภาพหอพัก
                </label>
                <input
                  type="url"
                  value={dormForm.imageUrl}
                  onChange={(e) => setDormForm({ ...dormForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สิ่งอำนวยความสะดวกส่วนกลาง (คั่นด้วยเครื่องหมายจุลภาค , )
                </label>
                <input
                  type="text"
                  value={dormForm.facilities}
                  onChange={(e) => setDormForm({ ...dormForm, facilities: e.target.value })}
                  placeholder="Wi-Fi, ฟิตเนส, สระว่ายน้ำ, รปภ. 24 ชม."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ROOM */}
      {/* ========================================================================= */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoom ? `แก้ไขห้อง ${editingRoom.roomNumber}` : 'เพิ่มห้องพักใหม่'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หอพักสังกัด <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={roomForm.dormitoryId}
                  onChange={(e) => setRoomForm({ ...roomForm, dormitoryId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  {dormitories.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หมายเลขห้อง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="เช่น 105"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชั้นที่ (Floor) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทห้อง (Room Type) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roomForm.roomType}
                  onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  placeholder="เช่น สตูดิโอ เตียงเดี่ยว, ดีลักซ์ เตียงคู่"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ค่าเช่า/เดือน (฿) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เงินมัดจำ (฿)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={roomForm.deposit}
                    onChange={(e) => setRoomForm({ ...roomForm, deposit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ขนาด (ตร.ม.)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={roomForm.sizeSqM}
                    onChange={(e) => setRoomForm({ ...roomForm, sizeSqM: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สถานะห้องพัก (Room Status)
                </label>
                <select
                  value={roomForm.status}
                  onChange={(e: any) => setRoomForm({ ...roomForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="available">ว่างพร้อมเข้าอยู่ (Available)</option>
                  <option value="booked">จองแล้ว (Booked)</option>
                  <option value="maintenance">ปิดปรับปรุง (Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สิ่งอำนวยความสะดวกในห้อง (คั่นด้วยจุลภาค , )
                </label>
                <input
                  type="text"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  placeholder="แอร์, เครื่องทำน้ำอุ่น, ตู้เย็น, เตียง 5 ฟุต"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL รูปภาพห้องพัก
                </label>
                <input
                  type="url"
                  value={roomForm.imageUrl}
                  onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs"
                >
                  บันทึกข้อมูลห้องพัก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
