'use client';

import React from 'react';
import { Receipt, X } from 'lucide-react';
import { COMMON_BILLS_SUGGESTIONS } from '../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  newBillName: string;
  setNewBillName: (v: string) => void;
  newBillType: 'FIXED' | 'VARIABLE';
  setNewBillType: (v: 'FIXED' | 'VARIABLE') => void;
  newBillAmount: string;
  newBillCollected: string;
  setNewBillCollected: (v: string) => void;
  newBillSplitCount: number;
  memberCount: number;
  onAmountChange: (val: string) => void;
  onSplitCountChange: (count: number) => void;
}

export default function BillModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  newBillName,
  setNewBillName,
  newBillType,
  setNewBillType,
  newBillAmount,
  newBillCollected,
  setNewBillCollected,
  newBillSplitCount,
  memberCount,
  onAmountChange,
  onSplitCountChange,
}: BillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Add Utility Bill</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Quick Suggestions
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_BILLS_SUGGESTIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setNewBillName(item.name);
                  setNewBillType(item.type);
                  onAmountChange(item.defaultAmount);
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bill Name
            </label>
            <input
              type="text"
              placeholder="e.g. WiFi, Current, Maid..."
              value={newBillName}
              onChange={(e) => setNewBillName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bill Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewBillType('FIXED')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  newBillType === 'FIXED'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Fixed Monthly
              </button>
              <button
                type="button"
                onClick={() => setNewBillType('VARIABLE')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  newBillType === 'VARIABLE'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Variable / Usage
              </button>
            </div>
          </div>

          {/* Custom Split People Count (Includes Meal Guests) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Shared Between (Split Count)
                </label>
                <span className="text-[11px] text-slate-500">
                  {newBillSplitCount > memberCount ? (
                    <span className="text-amber-700 font-semibold">
                      {memberCount} roommates + {newBillSplitCount - memberCount} meal guest(s)
                    </span>
                  ) : newBillSplitCount === memberCount ? (
                    'All room residents'
                  ) : (
                    `${newBillSplitCount} of ${memberCount} roommates`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSplitCountChange(Math.max(1, newBillSplitCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono text-indigo-700">
                  {newBillSplitCount}
                </span>
                <button
                  type="button"
                  onClick={() => onSplitCountChange(newBillSplitCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Presets for Split */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => onSplitCountChange(memberCount)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border cursor-pointer ${
                  newBillSplitCount === memberCount
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {memberCount} Roommates
              </button>
              <button
                type="button"
                onClick={() => onSplitCountChange(memberCount + 1)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border cursor-pointer ${
                  newBillSplitCount === memberCount + 1
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                +1 Meal Guest ({memberCount + 1})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Actual Bill Amount (৳)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1000 or 1700"
              value={newBillAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-mono"
              required
            />
            {newBillAmount && newBillSplitCount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Exact Split ({newBillSplitCount} people):{' '}
                <strong className="text-slate-800">
                  ৳{(parseFloat(newBillAmount) / newBillSplitCount).toFixed(2)}
                </strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Collected Amount per Person (৳)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 165 or 285"
              value={newBillCollected}
              onChange={(e) => setNewBillCollected(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-mono text-indigo-700 font-bold"
              required
            />
            {newBillAmount && newBillCollected && newBillSplitCount > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                {(() => {
                  const splitPeople = newBillSplitCount;
                  const collPerPerson = parseFloat(newBillCollected) || 0;
                  const totalColl = collPerPerson * splitPeople;
                  const billTot = parseFloat(newBillAmount) || 0;
                  const diff = totalColl - billTot;
                  const hasGuests = splitPeople > memberCount;
                  const guestCount = splitPeople - memberCount;

                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">
                          Total to Collect ({splitPeople} people): <strong>৳{totalColl}</strong>
                        </span>
                        <span
                          className={`font-bold ${
                            diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {diff === 0
                            ? 'Exact (৳0)'
                            : diff > 0
                            ? `+৳${diff.toFixed(0)} Surplus`
                            : `-৳${Math.abs(diff).toFixed(0)} Deficit`}
                        </span>
                      </div>
                      {hasGuests && (
                        <div className="text-[11px] text-amber-800 font-semibold pt-1 border-t border-slate-200 flex items-center justify-between">
                          <span>{memberCount} Roommates: ৳{collPerPerson * memberCount}</span>
                          <span>{guestCount} Meal Guest{guestCount > 1 ? 's' : ''}: ৳{collPerPerson * guestCount}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Save Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
