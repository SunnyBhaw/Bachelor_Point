'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Check,
  Plus,
  ShieldCheck,
  KeyRound,
  Lock,
  Menu,
  CreditCard,
  Receipt,
  Users,
  BookOpen,
  ShoppingBag,
  ListTodo,
} from 'lucide-react';
import { BillingCycle, BillingCycleSummary, TabType } from './types';

interface HeaderProps {
  currentCycle: BillingCycle;
  initialCycles: BillingCycleSummary[];
  isAdmin: boolean;
  activeTab: TabType;
  totalDuesPending: number;
  netUtilityAdjustment: number;
  memberCount: number;
  importantNotesCount: number;
  pantryPendingCount?: number;
  onTabChange: (tab: TabType) => void;
  onSelectCycle: (year: number, month: number) => void;
  onOpenMobileDrawer: () => void;
  onOpenMobileCycleModal: () => void;
  onOpenNewMonthModal: () => void;
  onOpenPinModal: () => void;
  onOpenChangePinModal: () => void;
  onLock: () => void;
}

export default function Header({
  currentCycle,
  initialCycles,
  isAdmin,
  activeTab,
  totalDuesPending,
  netUtilityAdjustment,
  memberCount,
  importantNotesCount,
  pantryPendingCount = 0,
  onTabChange,
  onSelectCycle,
  onOpenMobileDrawer,
  onOpenMobileCycleModal,
  onOpenNewMonthModal,
  onOpenPinModal,
  onOpenChangePinModal,
  onLock,
}: HeaderProps) {
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-white shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Bachelor Point Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Bachelor Point
            </h1>
          </div>
        </div>

        {/* Controls: Month Selector + Admin Lock/Unlock + Mobile Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Month Dropdown Trigger */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMonthDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-300 active:bg-slate-50 rounded-xl shadow-2xs transition-all text-left group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {currentCycle.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  monthDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {/* Floating Menu Popover (Desktop) */}
            {monthDropdownOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Billing Cycles
                </div>

                <div className="max-h-56 overflow-y-auto px-1.5 space-y-1">
                  {initialCycles.map((c) => {
                    const isSelected =
                      c.year === currentCycle.year && c.month === currentCycle.month;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setMonthDropdownOpen(false);
                          onSelectCycle(c.year, c.month);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                          />
                          <span>{c.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMonthDropdownOpen(false);
                      onOpenNewMonthModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Month
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Month Trigger (Opens Full Bottom Sheet) */}
          <button
            type="button"
            onClick={onOpenMobileCycleModal}
            className="sm:hidden flex items-center gap-1 px-2 py-1.5 bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shrink-0 cursor-pointer"
            title="Select Month"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate max-w-[85px]">{currentCycle.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Admin Status Indicator & Lock / Unlock Toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 pl-2 pr-1 py-1 rounded-xl text-emerald-800 text-xs font-bold shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
              <button
                type="button"
                onClick={onOpenChangePinModal}
                title="Change Admin PIN"
                className="p-1 text-emerald-700 hover:text-indigo-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer touch-manipulation"
              >
                <KeyRound className="w-3 h-3 pointer-events-none" />
              </button>
              <button
                type="button"
                onClick={onLock}
                title="Lock Admin Mode"
                className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] bg-white border border-emerald-300 hover:border-rose-300 text-emerald-700 hover:text-rose-600 rounded-lg transition-colors font-bold cursor-pointer touch-manipulation"
              >
                Lock
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPinModal}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shrink-0 cursor-pointer touch-manipulation"
            >
              <Lock className="w-3 h-3 text-slate-500 shrink-0 pointer-events-none" />
              <span className="pointer-events-none hidden sm:inline">Admin Unlock</span>
              <span className="pointer-events-none sm:hidden">Unlock</span>
            </button>
          )}

          {/* Mobile Hamburger Menu (☰) Trigger */}
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            aria-label="Open mobile navigation menu"
            className="sm:hidden p-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0 cursor-pointer touch-manipulation"
          >
            <Menu className="w-4 h-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Mobile Top Sticky Segmented Tab Switcher (< sm) */}
      <div className="flex sm:hidden items-center justify-between border-t border-slate-200 bg-white/95 backdrop-blur-md p-1.5 select-none sticky top-[51px] z-20 shadow-xs">
        <nav aria-label="Mobile Navigation" className="w-full grid grid-cols-5 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => onTabChange('dues')}
            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-manipulation relative ${
              activeTab === 'dues'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none truncate">Dues</span>
            {totalDuesPending > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('utilities')}
            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none truncate">Bills</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('pantry')}
            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-manipulation relative ${
              activeTab === 'pantry'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none truncate">To-Do</span>
            {pantryPendingCount > 0 && (
              <span className="absolute top-1 right-1.5 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold leading-none">
                {pantryPendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('members')}
            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none truncate">Members</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-manipulation relative ${
              activeTab === 'notes'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none truncate">Notes</span>
            {importantNotesCount > 0 && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>
        </nav>
      </div>

      {/* Navigation Tabs (Desktop & Tablet) - Plan 1: Modern Segmented Pill Bar */}
      <div className="hidden sm:flex max-w-5xl mx-auto px-4 sm:px-6 py-2.5 border-t border-slate-100 items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Left: Segmented Tabs Pill */}
        <nav
          aria-label="Dashboard Tabs"
          className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1"
        >
          <button
            type="button"
            onClick={() => onTabChange('dues')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'dues'
                ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Dues</span>
            {totalDuesPending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold leading-none pointer-events-none">
                ৳{Math.round(totalDuesPending)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('utilities')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Bills</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('pantry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'pantry'
                ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ListTodo className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">To-Do List</span>
            {pantryPendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold leading-none pointer-events-none">
                {pantryPendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('members')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Members</span>
            <span className="text-[11px] opacity-70 font-semibold pointer-events-none">
              ({memberCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation ${
              activeTab === 'notes'
                ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Notes</span>
            {importantNotesCount > 0 && (
              <span className="text-[11px] opacity-70 font-semibold pointer-events-none">
                ({importantNotesCount})
              </span>
            )}
          </button>
        </nav>

        {/* Right: Clean Contextual Status on Desktop */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {totalDuesPending > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              ৳{Math.round(totalDuesPending)} Total Due
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All Dues Cleared
            </span>
          )}

          {netUtilityAdjustment !== 0 && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                netUtilityAdjustment > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
            >
              {netUtilityAdjustment > 0
                ? `+৳${netUtilityAdjustment.toFixed(0)} Surplus`
                : `-৳${Math.abs(netUtilityAdjustment).toFixed(0)} Deficit`}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
