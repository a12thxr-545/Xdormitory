'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { X, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload =
        mode === 'login'
          ? { action: 'login', email, password }
          : { action: 'register', name, email, password, phone, idCard, role };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการดำเนินการ');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'login' ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิกใหม่ (Register)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบจองหอพักออนไลน์ตามมาตรฐาน diagram
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2.5 text-xs text-slate-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-700 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมศักดิ์ รักเรียน"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อีเมล (Email) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (Password) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081-234-5678"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขบัตรประจำตัวประชาชน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  placeholder="1-xxxx-xxxxx-xx-x"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  บทบาทผู้ใช้งาน (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      role === 'user'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ผู้เช่า / นักศึกษา
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      role === 'admin'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    เจ้าของหอพัก / Admin
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                สมัครสมาชิก
              </>
            )}
          </button>
        </form>

        {/* Footer switch mode */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <>
              ยังไม่มีบัญชีผู้ใช้?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-slate-900 font-semibold hover:underline cursor-pointer"
              >
                สมัครสมาชิกที่นี่
              </button>
            </>
          ) : (
            <>
              มีบัญชีผู้ใช้อยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-slate-900 font-semibold hover:underline cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
