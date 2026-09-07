'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import AdminDashboard from '@/components/AdminDashboard';
import DatabaseManager from '@/components/admin/DatabaseManager';
import {
  ShieldCheck,
  Building2,
  CalendarCheck,
  BedDouble,
  Building,
  Database,
  LogOut,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { clearAppCache } from '@/lib/cacheUtils';

export default function AdminPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'operations' | 'database'>('operations');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('xdorm_user') || localStorage.getItem('dorm_user');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    } else {
      // Default to admin for convenient local testing
      fetch('/api/auth?role=admin')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('xdorm_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('xdorm_user');
    localStorage.removeItem('dorm_user');
    setCurrentUser(null);
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Access denied if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {currentUser
                ? `บัญชีของคุณ (${currentUser.email}) มีสิทธิ์เป็นผู้เช่าทั่วไป (User) ไม่สามารถเข้าถึงหน้านี้ได้`
                : 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อเข้าถึงส่วนนี้'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>เข้าสู่ระบบด้วยบัญชีแอดมิน</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/user"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>ไปยังหน้าผู้เช่า (User Portal)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* ADMIN TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo-icon.png"
                    alt="Xdormitory Logo"
                    width={28}
                    height={28}
                    className="w-6 h-6 object-contain"
                    priority
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900">
                    Xdormitory
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    Admin Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Main Tabs (Operations vs Database Backoffice) */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveMainTab('operations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMainTab === 'operations'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>จัดการหอพัก & การจอง</span>
              </button>

              <button
                onClick={() => setActiveMainTab('database')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeMainTab === 'database'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>จัดการฐานข้อมูลหลังบ้าน</span>
              </button>
            </nav>

            {/* Admin Profile, Clear Cache & Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const res = await clearAppCache();
                  alert(res.message);
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                title="ล้างแคชระบบ (Clear Cache)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">ล้างแคช</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span>{currentUser?.name || 'Admin'}</span>
              </div>

              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeMainTab === 'operations' ? (
          <AdminDashboard onRefreshAll={() => {}} />
        ) : (
          <DatabaseManager onDataReset={() => {}} />
        )}

      </main>

    </div>
  );
}
