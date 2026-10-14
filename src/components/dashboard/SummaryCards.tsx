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
  const collectionPercent =
    totalExpectedAmount > 0
      ? Math.min(100, Math.round((totalPaidAmount / totalExpectedAmount) * 100))
      : 100;

  return (
    <section aria-label="Monthly Financial Summary" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFC8] shadow-2xs">
        <span className="text-[10px] sm:text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
          Total Roommates • সদস্য
        </span>
        <div className="text-lg sm:text-2xl font-black text-[#2C241E] mt-0.5 sm:mt-1 flex items-baseline gap-1 font-mono">
          {memberCount}
          <span className="text-xs text-[#8C7A6B] font-semibold font-sans">জন</span>
        </div>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFC8] shadow-2xs">
        <span className="text-[10px] sm:text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
          Utility Share • ইউটিলিটি
        </span>
        <div className="text-lg sm:text-2xl font-black text-[#C25E3E] mt-0.5 sm:mt-1 font-mono">
          ৳{Math.round(totalUtilitySharePerMember)}
        </div>
        <span className="text-[10px] sm:text-[11px] text-[#8C7A6B]">
          {billsCount}টি বিল যুক্ত
        </span>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFC8] shadow-2xs">
        <span className="text-[10px] sm:text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
          Total Collected • মোট জমা
        </span>
        <div className="text-lg sm:text-2xl font-black text-[#2D5A27] mt-0.5 sm:mt-1 font-mono">
          ৳{Math.round(totalPaidAmount)}
        </div>
        <span className="text-[10px] sm:text-[11px] text-[#2D5A27] font-semibold">
          {collectionPercent}% সংগৃহীত
        </span>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFC8] shadow-2xs">
        <span className="text-[10px] sm:text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
          Remaining Due • বাকি
        </span>
        <div
          className={`text-lg sm:text-2xl font-black mt-0.5 sm:mt-1 font-mono ${
            totalDuesPending > 0 ? 'text-[#B33A3A]' : 'text-[#2D5A27]'
          }`}
        >
          ৳{Math.max(0, Math.round(totalDuesPending))}
        </div>
        <span className="text-[10px] sm:text-[11px] text-[#8C7A6B]">
          {totalDuesPending <= 0 ? '✓ সব পরিশোধিত' : 'পরিশোধের বাকি'}
        </span>
      </div>
    </section>
  );
}
