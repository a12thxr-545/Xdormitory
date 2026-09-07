'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  RotateCcw,
  Table,
  HardDrive,
  Users,
  Building,
  BedDouble,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Save,
  X,
  Sparkles,
  Shield,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { clearAppCache } from '@/lib/cacheUtils';

interface DatabaseStats {
  dbPath: string;
  fileSizeKb: number;
  tables: {
    users: number;
    dormitories: number;
    rooms: {
      total: number;
      available: number;
      booked: number;
      maintenance: number;
    };
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      cancelled: number;
    };
  };
}

interface DatabaseManagerProps {
  onDataReset?: () => void;
}

export default function DatabaseManager({ onDataReset }: DatabaseManagerProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<'users' | 'dormitories' | 'rooms' | 'bookings'>('users');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  // Status feedback
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [openingTablePlus, setOpeningTablePlus] = useState(false);

  // Easy Edit Modal states
  const [editingRow, setEditingRow] = useState<{ table: string; id: string; row: any } | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleCopyPath = (pathText: string) => {
    navigator.clipboard.writeText(pathText);
    setCopiedPath(true);
    showMsg('success', 'คัดลอก Path ของไฟล์ dormitory.db เรียบร้อยแล้ว');
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const handleOpenTablePlus = async () => {
    setOpeningTablePlus(true);
    try {
      const res = await fetch('/api/admin/open-tableplus', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showMsg('success', 'เปิดไฟล์ใน TablePlus สำเร็จแล้ว (กำลังเรียกโปรแกรม)');
      } else {
        throw new Error(data.error || 'เปิดไม่สำเร็จ');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'ไม่สามารถเปิด TablePlus อัตโนมัติได้');
    } finally {
      setOpeningTablePlus(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/db');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch (err: any) {
      showMsg('error', 'ไม่สามารถโหลดสถิติฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableRows = async (table: 'users' | 'dormitories' | 'rooms' | 'bookings') => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/admin/db?action=table&table=${table}`);
      const data = await res.json();
      if (res.ok) {
        setTableRows(data.rows || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTableRows(activeTable);
  }, []);

  const handleSwitchTable = (table: 'users' | 'dormitories' | 'rooms' | 'bookings') => {
    setActiveTable(table);
    fetchTableRows(table);
  };

  // Export Full JSON Backup
  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/admin/db?action=backup');
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xdormitory_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMsg('success', 'ส่งออกไฟล์สำรองข้อมูล (JSON Backup) สำเร็จแล้ว');
    } catch (err: any) {
      showMsg('error', 'เกิดข้อผิดพลาดในการสำรองข้อมูล');
    }
  };

  // 1-Click Reset to Seed
  const handleResetDatabase = async () => {
    if (!confirm('คำเตือน: คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Mock Seed Data) ใช่หรือไม่?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'รีเซ็ตไม่สำเร็จ');

      showMsg('success', 'รีเซ็ตฐานข้อมูลและสร้างข้อมูลเริ่มต้นเรียบร้อยแล้ว!');
      fetchStats();
      fetchTableRows(activeTable);
      if (onDataReset) onDataReset();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // Quick 1-Click Role Changer
  const handleChangeUserRole = async (userId: string, targetRole: 'admin' | 'user') => {
    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changeRole', userId, role: targetRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เปลี่ยนสิทธิ์ไม่สำเร็จ');

      showMsg('success', data.message || `เปลี่ยนสิทธิ์เป็น ${targetRole} สำเร็จแล้ว`);
      fetchTableRows('users');
      fetchStats();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // Quick 1-Click Cell Value Updater (Edit & Change Immediately)
  const handleQuickUpdateRow = async (table: string, id: string, fields: Record<string, any>) => {
    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateRow',
          table,
          id,
          fields,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตข้อมูลไม่สำเร็จ');

      showMsg('success', 'อัปเดตข้อมูลสำเร็จ! บันทึกลง SQLite เรียบร้อยแล้ว');
      fetchTableRows(activeTable);
      fetchStats();
    } catch (err: any) {
      showMsg('error', err.message);
    }
  };

  // Open Edit Modal for any row
  const handleOpenEditRow = (row: any) => {
    setEditingRow({ table: activeTable, id: row.id, row });
    // Copy fields into form state
    const formValues: Record<string, any> = {};
    Object.entries(row).forEach(([key, val]) => {
      if (key !== 'id' && key !== 'createdAt') {
        formValues[key] = val;
      }
    });
    setEditFormData(formValues);
  };

  // Save Edit Row
  const handleSaveEditRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateRow',
          table: editingRow.table,
          id: editingRow.id,
          fields: editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');

      showMsg('success', `แก้ไขข้อมูลในตาราง "${editingRow.table}" สำเร็จแล้ว ข้อมูลเปลี่ยนทันที!`);
      setEditingRow(null);
      fetchTableRows(activeTable);
      fetchStats();
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Notification Toast */}
      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs animate-in fade-in ${
            actionMsg.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-800'
              : 'bg-slate-100 text-slate-800 border border-slate-300'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-white shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-slate-700 shrink-0" />
          )}
          <span className="font-semibold">{actionMsg.text}</span>
        </div>
      )}

      {/* Database Overview Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  ระบบจัดการฐานข้อมูลหลังบ้าน (Database & Backoffice)
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  SQLite ACID Active
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {stats?.dbPath || './data/dormitory.db'}
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyPath(stats?.dbPath || './data/dormitory.db')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer border border-slate-200"
                  title="คัดลอก Path ไปวางใน TablePlus"
                >
                  {copiedPath ? <Check className="w-3 h-3 text-slate-900" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPath ? 'คัดลอกแล้ว' : 'คัดลอก Path'}</span>
                </button>
                <span className="text-[11px] text-slate-400">({stats?.fileSizeKb || 0} KB)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenTablePlus}
              disabled={openingTablePlus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="เปิดไฟล์ฐานข้อมูลในโปรแกรม TablePlus ทันที"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{openingTablePlus ? 'กำลังเปิด...' : 'เปิดใน TablePlus'}</span>
            </button>

            <button
              onClick={async () => {
                const res = await clearAppCache();
                showMsg('success', res.message);
                fetchStats();
                fetchTableRows(activeTable);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
              title="ล้างแคชระบบและรีเฟรชฐานข้อมูล"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>ล้างแคชระบบ</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>สำรองข้อมูล (JSON)</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">ผู้ใช้งานทั้งหมด</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {stats?.tables.users || 0}
              </span>
              <span className="text-xs text-slate-400">บัญชี</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">หอพักในระบบ</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {stats?.tables.dormitories || 0}
              </span>
              <span className="text-xs text-slate-400">แห่ง</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">ห้องพักทั้งหมด</span>
              <BedDouble className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {stats?.tables.rooms.total || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                (ว่าง {stats?.tables.rooms.available || 0})
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">รายการจอง</span>
              <CalendarCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {stats?.tables.bookings.total || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                (รออนุมัติ {stats?.tables.bookings.pending || 0})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data Table Inspector with Instant Edit */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-slate-600" />
              <span>ตารางข้อมูลและระบบแก้ไขทันที</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กดปุ่ม &quot;แก้ไข&quot; ที่แถวใดก็ได้เพื่อปรับข้อมูลลงฐานข้อมูลโดยตรง
            </p>
          </div>

          {/* Table Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
            {(['users', 'dormitories', 'rooms', 'bookings'] as const).map((tbl) => (
              <button
                key={tbl}
                onClick={() => handleSwitchTable(tbl)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase ${
                  activeTable === tbl
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loadingTable ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-700" />
            <p className="mt-2 text-xs">กำลังโหลดข้อมูลจาก SQLite Database...</p>
          </div>
        ) : tableRows.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            ไม่มีข้อมูลในตารางนี้
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                    จัดการ (Actions)
                  </th>
                  {Object.keys(tableRows[0] || {}).map((col) => (
                    <th key={col} className="px-4 py-2.5 whitespace-nowrap text-slate-600 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Action Column with Direct Edit Button */}
                    <td className="px-4 py-2 whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenEditRow(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-sans font-medium transition-colors cursor-pointer"
                        title="คลิกเพื่อแก้ไขข้อมูลแถวนี้"
                      >
                        <Edit className="w-3 h-3" />
                        <span>แก้ไข</span>
                      </button>

                      {/* Quick 1-Click Role Toggle for Users */}
                      {activeTable === 'users' && (
                        row.role === 'admin' ? (
                          <button
                            onClick={() => handleChangeUserRole(row.id, 'user')}
                            className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-sans font-medium transition-colors cursor-pointer"
                            title="ลดสิทธิ์เป็นผู้เช่า"
                          >
                            ลดสิทธิ์
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeUserRole(row.id, 'admin')}
                            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-sans font-medium transition-colors cursor-pointer"
                            title="แต่งตั้งเป็น Admin"
                          >
                            ตั้งเป็น Admin
                          </button>
                        )
                      )}
                    </td>

                    {/* Table Data Columns */}
                    {Object.entries(row).map(([k, val]: [string, any], vIdx) => (
                      <td key={vIdx} className="px-4 py-2 whitespace-nowrap max-w-xs truncate text-slate-700">
                        {k === 'role' ? (
                          <select
                            value={val}
                            onChange={(e) => handleQuickUpdateRow('users', row.id, { role: e.target.value })}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 bg-white text-slate-800 font-sans cursor-pointer hover:border-slate-300 transition-colors"
                            title="คลิกเพื่อเปลี่ยนสิทธิ์ทันที"
                          >
                            <option value="user">user (ผู้เช่า)</option>
                            <option value="admin">admin (ผู้ดูแล)</option>
                          </select>
                        ) : k === 'status' && activeTable === 'rooms' ? (
                          <select
                            value={val}
                            onChange={(e) => handleQuickUpdateRow('rooms', row.id, { status: e.target.value })}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 bg-white text-slate-800 font-sans cursor-pointer hover:border-slate-300 transition-colors"
                            title="คลิกเพื่อเปลี่ยนสถานะห้องพักทันที"
                          >
                            <option value="available">available (ว่าง)</option>
                            <option value="booked">booked (จองแล้ว)</option>
                            <option value="maintenance">maintenance (ปิดปรับปรุง)</option>
                          </select>
                        ) : k === 'status' && activeTable === 'bookings' ? (
                          <select
                            value={val}
                            onChange={(e) => handleQuickUpdateRow('bookings', row.id, { status: e.target.value })}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 bg-white text-slate-800 font-sans cursor-pointer hover:border-slate-300 transition-colors"
                            title="คลิกเพื่อเปลี่ยนสถานะการจองทันที"
                          >
                            <option value="pending">pending (รออนุมัติ)</option>
                            <option value="confirmed">confirmed (อนุมัติแล้ว)</option>
                            <option value="cancelled">cancelled (ยกเลิกแล้ว)</option>
                          </select>
                        ) : typeof val === 'object' ? (
                          JSON.stringify(val)
                        ) : (
                          String(val ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INSTANT EDIT MODAL (แก้ไขข้อมูลแถวนี้แล้วเปลี่ยนทันที) */}
      {/* ========================================================================= */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    แก้ไขข้อมูลในตาราง {editingRow.table}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {editingRow.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditRow} className="p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {Object.keys(editFormData).map((field) => {
                const val = editFormData[field];

                // Special dropdown for Role
                if (field === 'role') {
                  return (
                    <div key={field} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                        <Shield className="w-3.5 h-3.5 text-slate-700" />
                        <span>สิทธิ์ผู้ใช้งาน (Role)</span>
                      </label>
                      <select
                        value={val || 'user'}
                        onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="user">ผู้เช่า / นักศึกษา (User)</option>
                        <option value="admin">เจ้าของหอพัก / ผู้ดูแล (Admin)</option>
                      </select>
                    </div>
                  );
                }

                // Special dropdown for Status in Rooms
                if (field === 'status' && editingRow.table === 'rooms') {
                  return (
                    <div key={field}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สถานะห้องพัก (Status)
                      </label>
                      <select
                        value={val || 'available'}
                        onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="available">ว่างพร้อมเข้าอยู่ (Available)</option>
                        <option value="booked">จองแล้ว (Booked)</option>
                        <option value="maintenance">ปิดปรับปรุง (Maintenance)</option>
                      </select>
                    </div>
                  );
                }

                // Special dropdown for Status in Bookings
                if (field === 'status' && editingRow.table === 'bookings') {
                  return (
                    <div key={field}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สถานะการจอง (Booking Status)
                      </label>
                      <select
                        value={val || 'pending'}
                        onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="pending">รออนุมัติ (Pending)</option>
                        <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
                        <option value="cancelled">ยกเลิกแล้ว (Cancelled)</option>
                      </select>
                    </div>
                  );
                }

                // Numbers
                if (typeof val === 'number') {
                  return (
                    <div key={field}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {field}
                      </label>
                      <input
                        type="number"
                        value={val ?? 0}
                        onChange={(e) => setEditFormData({ ...editFormData, [field]: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  );
                }

                // Long text
                if (field === 'description' || field === 'address' || field === 'specialRequests') {
                  return (
                    <div key={field}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {field}
                      </label>
                      <textarea
                        rows={2}
                        value={val || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
                      />
                    </div>
                  );
                }

                // Default string input
                return (
                  <div key={field}>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {field}
                    </label>
                    <input
                      type="text"
                      value={typeof val === 'object' ? JSON.stringify(val) : (val || '')}
                      onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  {savingEdit ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>บันทึกและเปลี่ยนทันที</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
