'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, ShieldCheck, LogIn, LogOut, Edit3, CalendarCheck, Home, RotateCcw } from 'lucide-react';
import { clearAppCache } from '@/lib/cacheUtils';
import { User } from '@/types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'explore' | 'history' | 'admin';
  setActiveTab: (tab: 'explore' | 'history' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onSwitchRole: (role: 'user' | 'admin') => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenProfile,
  onSwitchRole,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform p-1">
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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              ค้นหาหอพัก
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                ประวัติการจองของฉัน
              </button>
            )}

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              แดชบอร์ดเจ้าของหอพัก (Admin)
            </button>
          </nav>

          {/* Right Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Switcher Pill */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
              <span className="font-medium text-slate-700">โหมดทดสอบ:</span>
              <button
                onClick={() => onSwitchRole('user')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  currentUser?.role === 'user'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3 h-3" />
                <span>ผู้เช่า</span>
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  currentUser?.role === 'admin'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>เจ้าของหอ</span>
              </button>
            </div>

            {/* Clear Cache Button */}
            <button
              onClick={async () => {
                const res = await clearAppCache();
                alert(res.message);
                window.location.reload();
              }}
              title="ล้างแคชระบบ (Clear Cache)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">ล้างแคช</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  title="แก้ไขข้อมูลส่วนตัว"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    {currentUser.role === 'admin' ? 'A' : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.name}</span>
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            )}

          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg ${
              activeTab === 'explore' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> ค้นหาหอพัก
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg ${
              activeTab === 'history' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" /> ประวัติการจอง
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg ${
              activeTab === 'admin' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> แอดมิน
          </button>
        </div>

      </div>
    </header>
  );
}
