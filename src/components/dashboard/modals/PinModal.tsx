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
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unlock Admin</h3>
              <p className="text-xs text-slate-500">Enter your 4-digit PIN</p>
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

        <form onSubmit={onUnlock} className="space-y-4 pt-4">
          {pinError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {pinError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin PIN
            </label>
            <input
              type="password"
              maxLength={8}
              placeholder="••••"
              value={pinInput}
              autoFocus
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-2xl tracking-widest font-mono font-bold py-2.5 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-slate-50"
              required
            />
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Default PIN is <strong className="text-slate-700">1234</strong>
            </p>
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
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
