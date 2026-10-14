'use client';

import React from 'react';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPinInput: string;
  setCurrentPinInput: (v: string) => void;
  newPinInput: string;
  setNewPinInput: (v: string) => void;
  changePinError: string;
  changePinSuccess: boolean;
  onChangePin: (e: React.FormEvent) => void;
  isPending: boolean;
}

export default function ChangePinModal({
  isOpen,
  onClose,
  currentPinInput,
  setCurrentPinInput,
  newPinInput,
  setNewPinInput,
  changePinError,
  changePinSuccess,
  onChangePin,
  isPending,
}: ChangePinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8DFC8] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C241E]">পিন পরিবর্তন করুন</h3>
              <p className="text-xs text-[#8C7A6B]">নতুন নিরাপত্তা পিন সেট করুন</p>
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

        <form onSubmit={onChangePin} className="space-y-4 pt-4">
          {changePinError && (
            <div className="p-3 bg-[#FDF2EC] border border-[#F7D5C9] text-[#B33A3A] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {changePinError}
            </div>
          )}

          {changePinSuccess && (
            <div className="p-3 bg-[#E2EBDD] border border-[#CFDEC8] text-[#2D5A27] rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A27]" />
              পিন সফলভাবে আপডেট হয়েছে!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              বর্তমান পিন (Current PIN)
            </label>
            <input
              type="password"
              placeholder="যেমন: 1234"
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              className="w-full text-center text-lg tracking-widest font-mono font-bold py-2 px-3 rounded-2xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              নতুন পিন (কমপক্ষে ৪ সংখ্যা)
            </label>
            <input
              type="password"
              placeholder="যেমন: 5678"
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value)}
              className="w-full text-center text-lg tracking-widest font-mono font-bold py-2 px-3 rounded-2xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
              required
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
              className="px-5 py-2.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              পিন সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
