'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { X, Check, UserCircle, Phone, Mail, CreditCard, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateSuccess: (updatedUser: User) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setIdCard(currentUser.idCard || '');
      setError(null);
      setSuccessMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name,
          phone,
          idCard,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      setSuccessMsg('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
      onUpdateSuccess(data.user);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                แก้ไขข้อมูลส่วนตัว
              </h2>
              <p className="text-xs text-slate-500">Edit Personal Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2.5 text-xs text-slate-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-700 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-start gap-2.5 text-xs text-slate-800">
            <Check className="w-4 h-4 shrink-0 text-slate-800 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              อีเมลบัญชี (ไม่สามารถเปลี่ยนได้)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 rounded-xl text-slate-600 text-sm border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{currentUser.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ชื่อ - นามสกุล <span className="text-slate-900">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ-นามสกุลจริง"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ <span className="text-slate-900">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              เลขบัตรประจำตัวประชาชน (สำหรับทำสัญญาจอง)
            </label>
            <div className="relative">
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                placeholder="1-xxxx-xxxxx-xx-x"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
