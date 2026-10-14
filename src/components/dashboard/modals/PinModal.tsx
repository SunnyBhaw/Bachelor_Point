'use client';

import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinInput: string;
  setPinInput: (v: string) => void;
  pinError: string;
  onUnlock: (e: React.FormEvent) => void;
  isPending: boolean;
}

export default function PinModal({
  isOpen,
  onClose,
  pinInput,
  setPinInput,
  pinError,
  onUnlock,
  isPending,
}: PinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8DFC8] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C241E]">ম্যানেজার পিন আনলক</h3>
              <p className="text-xs text-[#8C7A6B]">আপনার ৪-সংখ্যার পিন প্রবেশ করুন</p>
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

        <form onSubmit={onUnlock} className="space-y-4 pt-4">
          {pinError && (
            <div className="p-3 bg-[#FDF2EC] border border-[#F7D5C9] text-[#B33A3A] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {pinError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1.5">
              Admin PIN (ম্যানেজার পিন)
            </label>
            <input
              type="password"
              maxLength={8}
              placeholder="••••"
              value={pinInput}
              autoFocus
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-2xl tracking-widest font-mono font-bold py-2.5 px-3 rounded-2xl border border-[#DDD3C2] focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
              required
            />
            <p className="text-[11px] text-[#8C7A6B] text-center mt-2">
              ডিফল্ট পিন হচ্ছে <strong className="text-[#2C241E] font-mono">1234</strong>
            </p>
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
              className="px-5 py-2.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              আনলক করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
