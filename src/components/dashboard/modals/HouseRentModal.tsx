'use client';

import React from 'react';
import { Home, Check } from 'lucide-react';

interface HouseRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleName: string;
  totalRoomRent: number;
  houseRentNoteInput: string;
  setHouseRentNoteInput: (v: string) => void;
  onSaveHouseRentPayment: (e: React.FormEvent) => void;
  isPending: boolean;
}

export default function HouseRentModal({
  isOpen,
  onClose,
  cycleName,
  totalRoomRent,
  houseRentNoteInput,
  setHouseRentNoteInput,
  onSaveHouseRentPayment,
  isPending,
}: HouseRentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mark House Rent Paid</h3>
              <p className="text-xs text-slate-500">Open to all roommates • No PIN required</p>
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

        <form onSubmit={onSaveHouseRentPayment} className="space-y-4 pt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center text-slate-600 mb-1">
              <span>Cycle:</span>
              <span className="font-bold text-slate-900">{cycleName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Rent to Landlord:</span>
              <span className="text-base font-extrabold text-indigo-600">
                ৳{Math.round(totalRoomRent)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Note / Method (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. bKash to Landlord, Cash, Bank..."
              value={houseRentNoteInput}
              onChange={(e) => setHouseRentNoteInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Confirm Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
