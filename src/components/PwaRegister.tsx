'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function PwaRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatusBanner, setShowStatusBanner] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatusBanner(true);
      // Auto-hide online banner after 3 seconds
      setTimeout(() => setShowStatusBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatusBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatusBanner && isOnline) return null;

  return (
    <aside
      aria-label="Network Status"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-md animate-in slide-in-from-top-2 duration-200"
    >
      <div
        className={`pointer-events-auto flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl shadow-lg border text-xs font-bold ${
          isOnline
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
            : 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-900/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 shrink-0 text-white" />
              <span>ইন্টারনেট সংযুক্ত • ডেটা সিঙ্ক হয়েছে (Online)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
              <span>অফলাইন মোড • ডেটা ফোনে সংরক্ষিত হচ্ছে (Offline)</span>
            </>
          )}
        </div>

        {!isOnline && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            Auto-Sync
          </span>
        )}
      </div>
    </aside>
  );
}
