'use client';

import React from 'react';
import { Calendar, X, Check, Plus } from 'lucide-react';
import { BillingCycle, BillingCycleSummary } from './types';

interface MobileCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCycle: BillingCycle;
  initialCycles: BillingCycleSummary[];
  onSelectCycle: (year: number, month: number) => void;
  onOpenNewMonthModal: () => void;
}

export default function MobileCycleModal({
  isOpen,
  onClose,
  currentCycle,
  initialCycles,
  onSelectCycle,
  onOpenNewMonthModal,
}: MobileCycleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Select Billing Cycle</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-1.5 overflow-y-auto max-h-[50vh]">
          {initialCycles.map((c) => {
            const isSelected = c.year === currentCycle.year && c.month === currentCycle.month;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectCycle(c.year, c.month);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  />
                  <span>{c.name}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewMonthModal();
            }}
            className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:bg-indigo-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Month Cycle
          </button>
        </div>
      </div>
    </div>
  );
}
