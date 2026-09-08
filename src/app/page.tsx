'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Dormitory, Room, Booking } from '@/types';
import DormitoryCard from '@/components/DormitoryCard';
import RoomModal from '@/components/RoomModal';
import BookingModal from '@/components/BookingModal';
import BookingHistory from '@/components/BookingHistory';
import EditProfileModal from '@/components/EditProfileModal';
import {
  Building2,
  Home,
  CalendarCheck,
  User as UserIcon,
  LogIn,
  UserPlus,
  LogOut,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  X,
  Phone,
  MessageSquare,
  MapPin,
  Sparkles,
  BedDouble,
  Shield,
  ShieldCheck,
  Edit3,
  RotateCcw,
  Check,
  Info,
  Lock,
  Menu,
} from 'lucide-react';
import { clearAppCache } from '@/lib/cacheUtils';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'history'>('explore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // Search & Filters
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loadingDorms, setLoadingDorms] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under5000' | '5000to7000' | 'over7000'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Selected Dormitory
  const [selectedDormitory, setSelectedDormitory] = useState<Dormitory | null>(null);
  const [dormRooms, setDormRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomFilterStatus, setRoomFilterStatus] = useState<'all' | 'available'>('all');

  // Modals
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check auth - DO NOT auto-login, only read from localStorage if present
  useEffect(() => {
    const stored = localStorage.getItem('xdorm_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setAuthChecked(true);
  }, []);

  const fetchDormitories = async () => {
    setLoadingDorms(true);
    try {
      let minPrice = 0;
      let maxPrice = 999999;
      if (priceFilter === 'under5000') maxPrice = 4999;
      if (priceFilter === '5000to7000') {
        minPrice = 5000;
        maxPrice = 7000;
      }
      if (priceFilter === 'over7000') minPrice = 7001;

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (minPrice > 0) params.set('minPrice', minPrice.toString());
      if (maxPrice < 999999) params.set('maxPrice', maxPrice.toString());

      const res = await fetch(`/api/dormitories?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDormitories(data.dormitories || []);
      }
    } catch (err) {
      console.error('Error fetching dormitories', err);
    } finally {
      setLoadingDorms(false);
    }
  };

  const fetchDormitoryRooms = async (dormId: string) => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`/api/rooms?dormitoryId=${dormId}`);
      const data = await res.json();
      if (res.ok) {
        setDormRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchDormitories();
  }, [searchQuery, priceFilter]);

  useEffect(() => {
    if (selectedDormitory) {
      fetchDormitoryRooms(selectedDormitory.id);
    }
  }, [selectedDormitory]);

  // Real-time synchronization for users
  useRealtimeSync((event) => {
    if (event.type !== 'poll') {
      fetchDormitories();
      if (selectedDormitory) {
        fetchDormitoryRooms(selectedDormitory.id);
      }
    }
  });


  const handleLogout = () => {
    localStorage.removeItem('xdorm_user');
    setCurrentUser(null);
    setActiveTab('explore');
  };

  const handleStartBooking = (room: Room) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setSelectedRoomForBooking(room);
  };

  const filteredDormitories = dormitories.filter((dorm) => {
    if (onlyAvailable && (dorm.availableRoomsCount || 0) <= 0) return false;
    return true;
  });

  const filteredRooms = dormRooms.filter((room) => {
    if (roomFilterStatus === 'available' && room.status !== 'available') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden w-full max-w-full">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedDormitory(null);
                  setActiveTab('explore');
                }}
                className="flex items-center gap-2.5 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo-icon.png"
                    alt="Xdormitory Logo"
                    width={36}
                    height={36}
                    className="w-8 h-8 object-contain"
                    priority
                  />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Xdormitory
                  </span>
                  <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    ระบบจองหอพักออนไลน์
                  </span>
                </div>
              </button>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
              <button
                onClick={() => {
                  setSelectedDormitory(null);
                  setActiveTab('explore');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>ค้นหาหอพัก</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>ประวัติการจองของฉัน</span>
                </button>
              )}
            </nav>

            {/* Right Action: Desktop User Buttons & Mobile Hamburger Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Clear Cache Button */}
              <button
                onClick={async () => {
                  const res = await clearAppCache();
                  alert(res.message);
                  window.location.reload();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
                title="ล้างแคชระบบ (Clear Cache)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>ล้างแคช</span>
              </button>

              {authChecked && currentUser ? (
                // LOGGED IN USER STATE (Desktop)
                <div className="hidden md:flex items-center gap-2">
                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    title="แก้ไขข้อมูลส่วนตัว"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.role === 'admin' ? 'A' : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // GUEST (NOT LOGGED IN) STATE (Desktop)
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบ</span>
                  </Link>

                  <Link
                    href="/register"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </div>
              )}

              {/* Hamburger Burger Menu Button (Mobile < md) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle Burger Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Hamburger Burger Menu Drawer (< md) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200/90 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            
            {/* Menu Items */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedDormitory(null);
                  setActiveTab('explore');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'explore'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>ค้นหาหอพัก</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => {
                    setActiveTab('history');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'history'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>ประวัติการจองของฉัน</span>
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Admin Portal (ระบบผู้ดูแล)</span>
                </Link>
              )}
            </div>

            {/* Account & Action Controls in Burger Menu */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {authChecked && currentUser ? (
                <>
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {currentUser.role === 'admin' ? 'A' : 'U'}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-500">{currentUser.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-100 font-medium"
                    >
                      แก้ไขโปรไฟล์
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบ</span>
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </div>
              )}

              <button
                onClick={async () => {
                  const res = await clearAppCache();
                  alert(res.message);
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>ล้างแคชระบบ (Clear Cache)</span>
              </button>
            </div>

          </div>
        )}

      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Guest Informational Banner (If not logged in) */}
        {authChecked && !currentUser && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 block sm:inline mr-1">
                  โหมดผู้เยี่ยมชม:
                </span>
                <span>
                  คุณสามารถเลือกดูรายละเอียดหอพักและห้องพักได้อิสระ หากต้องการจองห้องพัก กรุณาเข้าสู่ระบบก่อน
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                เข้าสู่ระบบเพื่อจอง
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors border border-slate-200"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        )}

        {/* EXPLORE VIEW: DORMITORY LIST */}
        {activeTab === 'explore' && !selectedDormitory && (
          <div className="space-y-6">
            
            {/* Search Hero */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  ระบบจองหอพักออนไลน์ • ดูห้องว่างแบบเรียลไทม์
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ค้นหาและดูห้องพักหอพัก
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  เลือกหอพักที่ถูกใจ ตรวจสอบห้องว่าง และรูปห้องพักได้ทันที
                </p>
              </div>

              {/* Search Bar */}
              <div className="mt-5 bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหอพัก หรือทำเล เช่น รังสิต, งามวงศ์วาน, ศาลายา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden bg-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 mr-2 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchDormitories}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-500 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> ช่วงราคา:
                </span>
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    priceFilter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ทุกราคา
                </button>
                <button
                  onClick={() => setPriceFilter('under5000')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    priceFilter === 'under5000' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ต่ำกว่า ฿5,000
                </button>
                <button
                  onClick={() => setPriceFilter('5000to7000')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    priceFilter === '5000to7000' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ฿5,000 - ฿7,000
                </button>
                <button
                  onClick={() => setPriceFilter('over7000')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    priceFilter === 'over7000' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  มากกว่า ฿7,000
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <span>แสดงเฉพาะที่มีห้องว่าง</span>
              </label>
            </div>

            {/* Dormitory List */}
            {loadingDorms ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                กำลังค้นหาหอพัก...
              </div>
            ) : filteredDormitories.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                ไม่พบหอพักตามเงื่อนไขที่ค้นหา
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDormitories.map((dorm) => (
                  <DormitoryCard
                    key={dorm.id}
                    dormitory={dorm}
                    onSelect={(d) => setSelectedDormitory(d)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* SELECTED DORMITORY ROOMS VIEW */}
        {activeTab === 'explore' && selectedDormitory && (
          <div className="space-y-6">
            
            {/* Dormitory Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="relative h-64 w-full bg-slate-900">
                <img
                  src={selectedDormitory.imageUrl}
                  alt={selectedDormitory.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                
                <button
                  onClick={() => setSelectedDormitory(null)}
                  className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs font-medium backdrop-blur-md transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับหน้ารายการหอพัก</span>
                </button>

                <div className="absolute bottom-5 left-6 right-6 text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold">{selectedDormitory.name}</h1>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>{selectedDormitory.address}</span>
                  </p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{selectedDormitory.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selectedDormitory.facilities.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      <Check className="w-3 h-3 text-slate-700" />
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Filter Switcher */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs text-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                ห้องพักทั้งหมด ({dormRooms.length} ห้อง)
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setRoomFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    roomFilterStatus === 'all' ? 'bg-slate-900 text-white font-semibold shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ทั้งหมด ({dormRooms.length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('available')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    roomFilterStatus === 'available' ? 'bg-slate-900 text-white font-semibold shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  เฉพาะห้องว่าง ({dormRooms.filter((r) => r.status === 'available').length})
                </button>
              </div>
            </div>

            {/* Rooms Grid */}
            {loadingRooms ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                กำลังโหลดข้อมูลห้องพัก...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                ไม่พบห้องพักที่ตรงตามเงื่อนไข
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room) => {
                  const isAvailable = room.status === 'available';

                  return (
                    <div key={room.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
                      <div className="relative h-44 w-full bg-slate-100">
                        <img src={room.imageUrl} alt={room.roomNumber} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
                          ห้อง {room.roomNumber}
                        </div>
                        <div className="absolute top-3 right-3">
                          {isAvailable ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                              ว่าง
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700 border border-slate-300">
                              จองแล้ว
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                          ฿{room.price.toLocaleString()} /ด.
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{room.roomType}</h3>
                          <p className="text-xs text-slate-500">ชั้น {room.floor} • ขนาด {room.sizeSqM} ตร.ม.</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedRoomForDetail(room)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            ดูรายละเอียด
                          </button>

                          {isAvailable ? (
                            currentUser ? (
                              <button
                                onClick={() => handleStartBooking(room)}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer"
                              >
                                จองห้องนี้
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push('/login')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer"
                                title="เข้าสู่ระบบเพื่อจองห้องนี้"
                              >
                                <Lock className="w-3 h-3" />
                                <span>เข้าสู่ระบบเพื่อจอง</span>
                              </button>
                            )
                          ) : (
                            <button disabled className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs cursor-not-allowed">
                              ไม่ว่าง
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* BOOKING HISTORY VIEW (Only accessible when logged in) */}
        {activeTab === 'history' && (
          <BookingHistory
            currentUser={currentUser}
            onExploreClick={() => {
              setSelectedDormitory(null);
              setActiveTab('explore');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Xdormitory - ระบบจองหอพักออนไลน์</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>ตรวจสอบห้องว่างเรียลไทม์</span>
            <span>•</span>
            <span>ระบบป้องกันการจองซ้ำ (ACID Lock)</span>
          </div>
        </div>
      </footer>

      {/* Room Details Modal (Accessible to anyone, guest or logged in) */}
      <RoomModal
        isOpen={!!selectedRoomForDetail}
        room={selectedRoomForDetail}
        dormitory={selectedDormitory}
        isLoggedIn={!!currentUser}
        onRequireLogin={() => router.push('/login')}
        onClose={() => setSelectedRoomForDetail(null)}
        onStartBooking={(room) => handleStartBooking(room)}
      />

      {/* Booking Modal (Only for logged in users) */}
      <BookingModal
        isOpen={!!selectedRoomForBooking}
        room={selectedRoomForBooking}
        dormitory={selectedDormitory}
        currentUser={currentUser}
        onClose={() => setSelectedRoomForBooking(null)}
        onBookingComplete={() => {
          fetchDormitories();
          if (selectedDormitory) fetchDormitoryRooms(selectedDormitory.id);
        }}
        onViewHistory={() => setActiveTab('history')}
      />

      {/* Edit Profile Modal (Only for logged in users) */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        currentUser={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdateSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('xdorm_user', JSON.stringify(user));
        }}
      />

    </div>
  );
}
