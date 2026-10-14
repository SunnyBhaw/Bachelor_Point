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
      <div className="bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8DFC8] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E2EBDD] text-[#2D5A27] flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C241E]">বাড়ি ভাড়া পরিশোধ মার্ক</h3>
              <p className="text-xs text-[#8C7A6B]">সকল রুমমেটের জন্য উন্মুক্ত • পিন প্রয়োজন নেই</p>
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

        <form onSubmit={onSaveHouseRentPayment} className="space-y-4 pt-4">
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8] text-xs">
            <div className="flex justify-between items-center text-[#8C7A6B] mb-1">
              <span>মাসিক সাইকেল:</span>
              <span className="font-bold text-[#2C241E]">{cycleName}</span>
            </div>
            <div className="flex justify-between items-center text-[#8C7A6B]">
              <span>বাড়িওয়ালার মোট ভাড়া:</span>
              <span className="text-base font-black text-[#C25E3E] font-mono">
                ৳{Math.round(totalRoomRent)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              পরিশোধের মাধ্যম / নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: বাড়িওয়ালার বিকাশ, ক্যাশ, বা ব্যাংক ট্রান্সফার..."
              value={houseRentNoteInput}
              onChange={(e) => setHouseRentNoteInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8C7A6B] hover:bg-[#F3ECE1] rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-[#2D5A27] hover:bg-[#23491E] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              পরিশোধ নিশ্চিত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
