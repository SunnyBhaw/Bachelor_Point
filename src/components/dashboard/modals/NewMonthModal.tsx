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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const selectedMonthName = monthNames[selectedMonth - 1];
  const exists = initialCycles.some(
    (c) => c.year === selectedYear && c.month === selectedMonth
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">New Billing Month</h3>
              <p className="text-xs text-slate-500">Pick month and year to track</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Year Stepper Bar */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Year
            </label>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y - 1)}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">{selectedYear}</span>
                {selectedYear === new Date().getFullYear() && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                    Current
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedYear((y) => y + 1)}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 12-Month Interactive Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Month
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { num: 1, short: 'Jan' },
                { num: 2, short: 'Feb' },
                { num: 3, short: 'Mar' },
                { num: 4, short: 'Apr' },
                { num: 5, short: 'May' },
                { num: 6, short: 'Jun' },
                { num: 7, short: 'Jul' },
                { num: 8, short: 'Aug' },
                { num: 9, short: 'Sep' },
                { num: 10, short: 'Oct' },
                { num: 11, short: 'Nov' },
                { num: 12, short: 'Dec' },
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
                    className={`relative py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-102'
                        : cycleExists
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                  >
                    <span className="text-sm">{m.short}</span>
                    <span
                      className={`text-[10px] font-medium leading-none mt-0.5 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {cycleExists ? 'Created' : 'New'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Status Note */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              exists
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  exists ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
              />
              <span>
                Selected: <strong>{selectedMonthName} {selectedYear}</strong>
              </span>
            </div>
            <span className="text-[11px] font-semibold">
              {exists ? 'Will switch to existing' : 'Ready to create'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCreateMonth}
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
