'use client';

import React from 'react';
import {
  X,
  CreditCard,
  Receipt,
  Users,
  BookOpen,
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
      <div className="relative w-[85%] max-w-sm bg-[#FDFBF7] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E8DFC8] flex items-center justify-between bg-[#F3ECE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#E0D5C1] shadow-2xs flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2C241E] text-sm">Bachelor Point</h3>
              <p className="text-[11px] text-[#8C7A6B]">মেস নেভিগেশন মেন্যু</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8C7A6B] hover:text-[#2C241E] active:bg-[#EAE1D3] rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Cycle Bar in Drawer */}
        <div className="p-4 bg-[#F5E5DC] border-b border-[#E8C2B3] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#C25E3E] uppercase tracking-wider block">
              বর্তমান মাস • Active Month
            </span>
            <span className="text-sm font-black text-[#2C241E]">{currentCycle.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMobileCycleModal();
            }}
            className="px-2.5 py-1 text-xs font-bold bg-white text-[#C25E3E] rounded-xl border border-[#E8C2B3] shadow-2xs active:bg-[#FDF2EC] cursor-pointer"
          >
            মাস পরিবর্তন
          </button>
        </div>

        {/* Navigation Tab Links */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
            মেস সেকশনসমূহ
          </div>

          <button
            type="button"
            onClick={() => onTabChange('dues')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'dues'
                ? 'bg-[#C25E3E] text-white font-bold shadow-xs'
                : 'text-[#4A3E35] hover:bg-[#F3ECE1] active:bg-[#EAE1D3]'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className={`w-4 h-4 ${activeTab === 'dues' ? 'text-white' : 'text-[#8C7A6B]'}`} />
              <span>Member Dues (ভাড়া ও বিল)</span>
            </div>
            {totalDuesPending > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'dues' ? 'bg-[#9C452B] text-white' : 'bg-[#FDF2EC] text-[#B33A3A] border border-[#F7D5C9]'
                }`}
              >
                ৳{Math.round(totalDuesPending)} বাকি
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('utilities')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'bg-[#C25E3E] text-white font-bold shadow-xs'
                : 'text-[#4A3E35] hover:bg-[#F3ECE1] active:bg-[#EAE1D3]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Receipt className={`w-4 h-4 ${activeTab === 'utilities' ? 'text-white' : 'text-[#8C7A6B]'}`} />
              <span>Utility Bills (মেস খরচ)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'utilities'
                  ? 'bg-[#9C452B] text-white'
                  : netUtilityAdjustment >= 0
                  ? 'bg-[#E2EBDD] text-[#2D5A27]'
                  : 'bg-[#FDF0D5] text-[#9C6500]'
              }`}
            >
              {netUtilityAdjustment >= 0
                ? `+৳${netUtilityAdjustment.toFixed(0)}`
                : `-৳${Math.abs(netUtilityAdjustment).toFixed(0)}`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('members')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'bg-[#C25E3E] text-white font-bold shadow-xs'
                : 'text-[#4A3E35] hover:bg-[#F3ECE1] active:bg-[#EAE1D3]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${activeTab === 'members' ? 'text-white' : 'text-[#8C7A6B]'}`} />
              <span>Roommates (রুমমেট তালিকা)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'members' ? 'bg-[#9C452B] text-white' : 'bg-[#EAE1D3] text-[#4A3E35]'
              }`}
            >
              {memberCount} জন
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'notes'
                ? 'bg-[#C25E3E] text-white font-bold shadow-xs'
                : 'text-[#4A3E35] hover:bg-[#F3ECE1] active:bg-[#EAE1D3]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-4 h-4 ${activeTab === 'notes' ? 'text-white' : 'text-[#8C7A6B]'}`} />
              <span>Important Notes (জরুরী নোটিশ)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'notes' ? 'bg-[#9C452B] text-white' : 'bg-[#E2EBDD] text-[#2D5A27]'
              }`}
            >
              {importantNotesCount}টি নোটিশ
            </span>
          </button>

          {/* Admin Mode Box */}
          <div className="mt-4 pt-4 border-t border-[#E8DFC8]">
            <div className="px-3 pb-2 text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
              ম্যানেজার কন্ট্রোল (Admin Mode)
            </div>
            {isAdmin ? (
              <div className="p-3 bg-[#E2EBDD] rounded-2xl border border-[#CFDEC8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#2D5A27] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                    ম্যানেজার মোড চালু আছে
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLock();
                    }}
                    className="px-2 py-0.5 bg-white border border-[#B33A3A] text-[#B33A3A] rounded-lg text-xs font-bold cursor-pointer"
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
                  className="w-full text-center py-1.5 bg-white border border-[#CFDEC8] text-[#2D5A27] rounded-xl text-xs font-bold cursor-pointer"
                >
                  পিন পরিবর্তন করুন (Change PIN)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPinModal();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-[#F3ECE1] text-[#2C241E] rounded-2xl font-bold text-xs border border-[#DDD3C2] active:bg-[#EAE1D3] cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#8C7A6B]" />
                ম্যানেজার পিন আনলক
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E8DFC8] bg-[#F3ECE1] flex items-center justify-between text-xs text-[#8C7A6B]">
          <span>Bachelor Point Mess</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#C25E3E] active:underline cursor-pointer"
          >
            মেন্যু বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
