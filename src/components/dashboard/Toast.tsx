'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#FDFBF7] border-[#CFDEC8] text-[#2D5A27] shadow-[#2D5A27]/10'
              : toast.type === 'error'
              ? 'bg-[#FDFBF7] border-[#F7D5C9] text-[#B33A3A] shadow-[#B33A3A]/10'
              : 'bg-[#FDFBF7] border-[#E8C2B3] text-[#C25E3E] shadow-[#C25E3E]/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#B33A3A] shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#C25E3E] shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-[#8C7A6B] hover:text-[#2C241E] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
