'use client';

import React from 'react';
import { Dormitory } from '@/types';
import { MapPin, Phone, MessageSquare, BedDouble, CheckCircle2, ChevronRight, Shield } from 'lucide-react';

interface DormitoryCardProps {
  dormitory: Dormitory;
  onSelect: (dormitory: Dormitory) => void;
}

export default function DormitoryCard({ dormitory, onSelect }: DormitoryCardProps) {
  const hasAvailableRooms = (dormitory.availableRoomsCount || 0) > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image & Badges */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
        <img
          src={dormitory.imageUrl}
          alt={dormitory.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {hasAvailableRooms ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-white backdrop-blur-md shadow-2xs border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              มีห้องว่าง {dormitory.availableRoomsCount} ห้อง
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-200 backdrop-blur-md shadow-2xs border border-white/10">
              ห้องพักเต็ม
            </span>
          )}
        </div>

        {/* Price Tag Badge */}
        <div className="absolute bottom-4 right-4 text-right">
          <span className="text-xs text-slate-300 font-medium block">เริ่มต้น</span>
          <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
            ฿{dormitory.minPrice ? dormitory.minPrice.toLocaleString() : '—'}
            <span className="text-xs font-normal text-slate-300"> /เดือน</span>
          </span>
        </div>

        {/* Address snippet overlay */}
        <div className="absolute bottom-4 left-4 max-w-[65%]">
          <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md line-clamp-1">
            {dormitory.name}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 drop-shadow-xs line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {dormitory.address}
          </p>
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {dormitory.description}
          </p>

          {/* Contact Details */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {dormitory.phone}
            </span>
            {dormitory.lineId && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Line: {dormitory.lineId}
              </span>
            )}
          </div>

          {/* Facility Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {dormitory.facilities.slice(0, 4).map((facility, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                {facility}
              </span>
            ))}
            {dormitory.facilities.length > 4 && (
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                +{dormitory.facilities.length - 4} อื่นๆ
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-slate-400" />
            <span>ทั้งหมด {dormitory.totalRoomsCount || 0} ห้อง</span>
          </div>

          <button
            onClick={() => onSelect(dormitory)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-2xs group-hover:gap-2 transition-all cursor-pointer"
          >
            <span>ดูห้องพักที่ว่าง</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
