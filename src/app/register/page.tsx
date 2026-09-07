'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, UserPlus, AlertCircle, Shield } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          username,
          email,
          password,
          phone,
          idCard,
          role: 'user', // Always user role from public register!
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');

      // Save user session and redirect to homepage
      localStorage.setItem('xdorm_user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <Image
            src="/logo.png"
            alt="Xdormitory Logo"
            width={180}
            height={115}
            className="h-20 w-auto object-contain group-hover:scale-105 transition-transform"
            priority
          />
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
          สมัครสมาชิกผู้เช่า (Tenant Register)
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          สร้างบัญชีผู้เช่าเพื่อค้นหาและจองห้องพักออนไลน์
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10">
          
          {/* Notice about Role */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 flex items-start gap-2">
            <Shield className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <span>
              การสมัครสมาชิกนี้เป็น<strong>บัญชีผู้เช่า (Tenant)</strong> เท่านั้น สำหรับสิทธิ์ <strong>เจ้าของหอพัก / Admin</strong> จะต้องได้รับการแต่งตั้งผ่านระบบหลังบ้าน (Database)
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2 text-xs text-slate-800">
              <AlertCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น กานต์ ยินดี"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้ (Username) <span className="text-slate-400 font-normal">(สำหรับเข้าสู่ระบบ)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="เช่น student01 (หากไม่ระบุจะใช้อีเมล)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                placeholder="1-xxxx-xxxxx-xx-x"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิกผู้เช่า</span>
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
            <Link href="/login" className="font-bold text-slate-900 hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
