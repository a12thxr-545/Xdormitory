'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, LogIn, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read any error passed back from OAuth callback
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) setError(decodeURIComponent(err));
    }
  }, []);

  // Normal Login (Username or Email)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');

      // Save user session to localStorage
      localStorage.setItem('xdorm_user', JSON.stringify(data.user));

      // Route according to the role defined in the database/backoffice!
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
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
          เข้าสู่ระบบ (Sign In)
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          รองรับ Username, อีเมล, Google และ LINE
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2 text-xs text-slate-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SOCIAL LOGIN BUTTONS (Google & LINE) */}
          <div className="space-y-2.5 mb-6">
            {/* Google OAuth Button */}
            <a
              href="/api/auth/google/login"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </a>

            {/* Real LINE OAuth Button */}
            <a
              href="/api/auth/line/login"
              className="w-full py-2.5 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.084.922.258 1.057.592.122.302.08.774.039 1.08l-.171 1.028c-.053.319-.244 1.249 1.096.681 1.341-.569 7.234-4.26 9.87-7.294 1.353-1.503 2.09-3.235 2.09-5.674z" />
              </svg>
              <span>เข้าสู่ระบบด้วย LINE (LINE Login)</span>
            </a>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                หรือเข้าสู่ระบบด้วยชื่อผู้ใช้ / รหัสผ่าน
              </span>
            </div>
          </div>

          {/* Form: Username or Email */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้ หรือ อีเมล (Username or Email)
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="เช่น user หรือ user@xdormitory.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all font-mono placeholder:font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Info */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-0.5">
              <Info className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>เข้าสู่ระบบ:</span>
            </span>
            สามารถใช้ชื่อผู้ใช้ <code className="text-slate-900 font-bold bg-slate-100 px-1 py-0.5 rounded">user</code> หรืออีเมล <code className="text-slate-900 font-bold bg-slate-100 px-1 py-0.5 rounded">user@xdormitory.com</code> ในการเข้าสู่ระบบ
          </div>

          {/* Link to Register */}
          <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            ยังไม่มีบัญชีผู้เช่า?{' '}
            <Link href="/register" className="font-bold text-slate-900 hover:underline">
              สมัครสมาชิกผู้เช่าที่นี่
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
