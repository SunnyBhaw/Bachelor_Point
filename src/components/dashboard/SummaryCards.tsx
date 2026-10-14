'use client';

import React from 'react';

interface SummaryCardsProps {
  memberCount: number;
  totalUtilitySharePerMember: number;
  billsCount: number;
  totalPaidAmount: number;
  totalExpectedAmount: number;
  totalDuesPending: number;
}

export default function SummaryCards({
  memberCount,
  totalUtilitySharePerMember,
  billsCount,
  totalPaidAmount,
  totalExpectedAmount,
  totalDuesPending,
}: SummaryCardsProps) {
  return (
    <section aria-label="Monthly Financial Summary" className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total Members
        </span>
        <div className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 flex items-baseline gap-1">
          {memberCount}
          <span className="text-xs text-slate-500 font-normal">Persons</span>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Utility Share / Person
        </span>
        <div className="text-lg sm:text-2xl font-bold text-indigo-600 mt-0.5 sm:mt-1">
          ৳{Math.round(totalUtilitySharePerMember)}
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-500">
          {billsCount} bills added
        </span>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total Collected
        </span>
        <div className="text-lg sm:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">
          ৳{Math.round(totalPaidAmount)}
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-500">
          of ৳{Math.round(totalExpectedAmount)} expected
        </span>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total Dues Remaining
        </span>
        <div
          className={`text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 ${
            totalDuesPending > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          ৳{Math.max(0, Math.round(totalDuesPending))}
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-500">
          {totalDuesPending <= 0 ? 'All dues cleared!' : 'To be collected'}
        </span>
      </div>
    </section>
  );
}
