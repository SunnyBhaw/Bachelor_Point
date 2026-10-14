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
      <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200 border-t sm:border border-[#E8DFC8]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-[#2C241E] text-base">
              Select Billing Cycle (মাস নির্বাচন)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#2C241E] rounded-lg cursor-pointer"
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
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5E5DC] text-[#C25E3E] font-bold border border-[#E8C2B3]'
                    : 'text-[#4A3E35] hover:bg-[#F3ECE1] active:bg-[#EAE1D3] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? 'bg-[#C25E3E]' : 'bg-[#DDD3C2]'
                    }`}
                  />
                  <span>{c.name}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#C25E3E]" />}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#E8DFC8]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewMonthModal();
            }}
            className="w-full py-3 bg-[#FDF2EC] hover:bg-[#F8EBE3] text-[#C25E3E] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-[#F7D5C9] active:bg-[#F3E0D5] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন মাস যোগ করুন (New Cycle)
          </button>
        </div>
      </div>
    </div>
  );
}
