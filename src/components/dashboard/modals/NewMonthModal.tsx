'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BillingCycleSummary } from '../types';

interface NewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCycles: BillingCycleSummary[];
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  onCreateMonth: () => void;
  isPending: boolean;
}

export default function NewMonthModal({
  isOpen,
  onClose,
  initialCycles,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  onCreateMonth,
  isPending,
}: NewMonthModalProps) {
  if (!isOpen) return null;

  const monthNames = [
    'January (জানুয়ারি)', 'February (ফেব্রুয়ারি)', 'March (মার্চ)', 'April (এপ্রিল)',
    'May (মে)', 'June (জুন)', 'July (জুলাই)', 'August (আগস্ট)',
    'September (সেপ্টেম্বর)', 'October (অক্টোবর)', 'November (নভেম্বর)', 'December (ডিসেম্বর)',
  ];
  const selectedMonthName = monthNames[selectedMonth - 1];
  const exists = initialCycles.some(
    (c) => c.year === selectedYear && c.month === selectedMonth
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C241E]">New Billing Month (নতুন মাস)</h3>
              <p className="text-xs text-[#8C7A6B]">হিসাব পরিচালনার জন্য বছর ও মাস বেছে নিন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#8C7A6B] hover:text-[#2C241E] hover:bg-[#F3ECE1] flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Year Stepper Bar */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-2">
              বছর নির্বাচন (Select Year)
            </label>
            <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#E8DFC8] rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y - 1)}
                className="w-9 h-9 rounded-xl bg-white border border-[#DDD3C2] hover:bg-[#F3ECE1] flex items-center justify-center text-[#2C241E] font-bold transition-colors shadow-2xs cursor-pointer font-mono"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#2C241E] font-mono">{selectedYear}</span>
                {selectedYear === new Date().getFullYear() && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#F5E5DC] text-[#C25E3E] border border-[#E8C2B3]">
                    বর্তমান বছর
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y + 1)}
                className="w-9 h-9 rounded-xl bg-white border border-[#DDD3C2] hover:bg-[#F3ECE1] flex items-center justify-center text-[#2C241E] font-bold transition-colors shadow-2xs cursor-pointer font-mono"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 12-Month Interactive Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-2">
              মাস নির্বাচন (Select Month)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { num: 1, short: 'Jan', bn: 'জানু' },
                { num: 2, short: 'Feb', bn: 'ফেব্রু' },
                { num: 3, short: 'Mar', bn: 'মার্চ' },
                { num: 4, short: 'Apr', bn: 'এপ্রিল' },
                { num: 5, short: 'May', bn: 'মে' },
                { num: 6, short: 'Jun', bn: 'জুন' },
                { num: 7, short: 'Jul', bn: 'জুলাই' },
                { num: 8, short: 'Aug', bn: 'আগস্ট' },
                { num: 9, short: 'Sep', bn: 'সেপ্টে' },
                { num: 10, short: 'Oct', bn: 'অক্টো' },
                { num: 11, short: 'Nov', bn: 'নভে' },
                { num: 12, short: 'Dec', bn: 'ডিসে' },
              ].map((m) => {
                const isSelected = selectedMonth === m.num;
                const cycleExists = initialCycles.some(
                  (c) => c.year === selectedYear && c.month === m.num
                );

                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => setSelectedMonth(m.num)}
                    className={`relative py-2.5 px-2 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center border cursor-pointer ${
                      isSelected
                        ? 'bg-[#C25E3E] text-white border-[#C25E3E] shadow-md shadow-[#C25E3E]/20 scale-102'
                        : cycleExists
                        ? 'bg-[#FAF7F2] text-[#2C241E] border-[#E8DFC8] hover:border-[#DDD3C2]'
                        : 'bg-white text-[#4A3E35] border-[#DDD3C2] hover:border-[#E8C2B3] hover:bg-[#FDF2EC]/40'
                    }`}
                  >
                    <span className="text-sm font-black">{m.short}</span>
                    <span
                      className={`text-[10px] font-semibold leading-none mt-0.5 ${
                        isSelected ? 'text-white/90' : 'text-[#8C7A6B]'
                      }`}
                    >
                      {cycleExists ? 'যুক্ত আছে' : 'নতুন'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Status Note */}
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              exists
                ? 'bg-[#FDF0D5] border-[#F2D79E] text-[#9C6500]'
                : 'bg-[#FDF2EC] border-[#F7D5C9] text-[#7A4E2D]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  exists ? 'bg-[#D97706]' : 'bg-[#C25E3E]'
                }`}
              />
              <span>
                বাছাইকৃত: <strong>{selectedMonthName} {selectedYear}</strong>
              </span>
            </div>
            <span className="text-[11px] font-bold">
              {exists ? 'আগের হিসাবে যাবে' : 'তৈরি করতে প্রস্তুত'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8C7A6B] hover:bg-[#F3ECE1] rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={onCreateMonth}
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              পরবর্তী ধাপে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
