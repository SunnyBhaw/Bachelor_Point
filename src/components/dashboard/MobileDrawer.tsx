'use client';

import React from 'react';
import {
  X,
  CreditCard,
  Receipt,
  Users,
  BookOpen,
  ShoppingBag,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { BillingCycle, TabType } from './types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentCycle: BillingCycle;
  totalDuesPending: number;
  netUtilityAdjustment: number;
  memberCount: number;
  importantNotesCount: number;
  pantryPendingCount?: number;
  isAdmin: boolean;
  onOpenMobileCycleModal: () => void;
  onOpenPinModal: () => void;
  onOpenChangePinModal: () => void;
  onLock: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  currentCycle,
  totalDuesPending,
  netUtilityAdjustment,
  memberCount,
  importantNotesCount,
  pantryPendingCount = 0,
  isAdmin,
  onOpenMobileCycleModal,
  onOpenPinModal,
  onOpenChangePinModal,
  onLock,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150 sm:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bachelor Point</h3>
              <p className="text-[11px] text-slate-500">Navigation Menu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 active:bg-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Cycle Bar in Drawer */}
        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
              Current Billing Cycle
            </span>
            <span className="text-sm font-bold text-slate-900">{currentCycle.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMobileCycleModal();
            }}
            className="px-2.5 py-1 text-xs font-bold bg-white text-indigo-600 rounded-lg border border-indigo-200 shadow-2xs active:bg-indigo-50 cursor-pointer"
          >
            Switch Month
          </button>
        </div>

        {/* Navigation Tab Links */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sections
          </div>

          <button
            type="button"
            onClick={() => onTabChange('dues')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'dues'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className={`w-4 h-4 ${activeTab === 'dues' ? 'text-white' : 'text-slate-500'}`} />
              <span>Member Dues & Payments</span>
            </div>
            {totalDuesPending > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'dues' ? 'bg-indigo-800 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                ৳{Math.round(totalDuesPending)} Due
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('utilities')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Receipt className={`w-4 h-4 ${activeTab === 'utilities' ? 'text-white' : 'text-slate-500'}`} />
              <span>Utility Bills & Split</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'utilities'
                  ? 'bg-indigo-800 text-white'
                  : netUtilityAdjustment >= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {netUtilityAdjustment >= 0
                ? `+৳${netUtilityAdjustment.toFixed(0)}`
                : `-৳${Math.abs(netUtilityAdjustment).toFixed(0)}`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('pantry')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'pantry'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className={`w-4 h-4 ${activeTab === 'pantry' ? 'text-white' : 'text-slate-500'}`} />
              <span>Pantry & Grocery List</span>
            </div>
            {pantryPendingCount > 0 ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'pantry' ? 'bg-indigo-800 text-white' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {pantryPendingCount} to buy
              </span>
            ) : (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'pantry' ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                Stocked
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('members')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${activeTab === 'members' ? 'text-white' : 'text-slate-500'}`} />
              <span>Members Directory</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'members' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {memberCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-4 h-4 ${activeTab === 'notes' ? 'text-white' : 'text-slate-500'}`} />
              <span>Important Notes & Contacts</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'notes' ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {importantNotesCount} Notes
            </span>
          </button>

          {/* Admin Mode Box */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Admin Access
            </div>
            {isAdmin ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Admin Mode Active
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLock();
                    }}
                    className="px-2 py-0.5 bg-white border border-rose-300 text-rose-600 rounded text-xs font-bold cursor-pointer"
                  >
                    Lock
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChangePinModal();
                  }}
                  className="w-full text-center py-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Change Admin PIN
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPinModal();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 active:bg-slate-200 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Unlock Admin Mode
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Bachelor Point Mess</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-indigo-600 active:underline cursor-pointer"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
}
