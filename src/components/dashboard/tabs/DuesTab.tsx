'use client';

import React from 'react';
import {
  Users,
  CheckCircle2,
  Phone,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  BillingCycle,
  MemberBilling,
  getAvatarColor,
  getInitials,
} from '../types';

interface DuesTabProps {
  currentCycle: BillingCycle;
  totalUtilitySharePerMember: number;
  isAdmin: boolean;
  onUpdateBilling: (billingId: string, field: 'roomRent' | 'paidAmount', value: number) => void;
  onQuickFullPay: (mb: MemberBilling, totalDue: number) => void;
  onQuickResetPay: (mb: MemberBilling) => void;
  onNavigateToMembers: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DuesTab({
  currentCycle,
  totalUtilitySharePerMember,
  isAdmin,
  onUpdateBilling,
  onQuickFullPay,
  onQuickResetPay,
  onNavigateToMembers,
  onShowToast,
}: DuesTabProps) {
  const memberBillings = currentCycle.memberBillings || [];

  const handleCopyWhatsAppSummary = () => {
    if (memberBillings.length === 0) return;

    let text = `🏠 *ব্যাচেলর পয়েন্ট - ${currentCycle.name} ভাড়ার হিসাব*\n`;
    text += `⚡ মাথাপিছু ইউটিলিটি শেয়ার: ৳${Math.round(totalUtilitySharePerMember)}\n\n`;

    memberBillings.forEach((mb) => {
      const totalDue = mb.roomRent + totalUtilitySharePerMember;
      const balance = totalDue - mb.paidAmount;
      const statusText = balance <= 0 ? '✅ পরিশোধিত' : `⚠️ বাকি: ৳${Math.round(balance)}`;
      text += `• *${mb.member.name}*: মোট ৳${Math.round(totalDue)} (ভাড়া: ৳${mb.roomRent} + ইউটিলিটি: ৳${Math.round(totalUtilitySharePerMember)}) | জমা: ৳${mb.paidAmount} [${statusText}]\n`;
    });

    const totalCollected = memberBillings.reduce((acc, mb) => acc + mb.paidAmount, 0);
    const totalExpected = memberBillings.reduce((acc, mb) => acc + mb.roomRent + totalUtilitySharePerMember, 0);
    const totalRemaining = Math.max(0, totalExpected - totalCollected);

    text += `\n💰 *মোট জমা*: ৳${Math.round(totalCollected)} / ৳${Math.round(totalExpected)}`;
    text += `\n⏳ *পরিশোধ বাকি*: ৳${Math.round(totalRemaining)}`;

    navigator.clipboard.writeText(text);
    onShowToast('হোয়াটসঅ্যাপ সামারি কপি করা হয়েছে! 📋', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h2 className="text-lg font-extrabold text-[#2C241E]">Member Dues & Payments (ভাড়া ও বিল)</h2>
          <p className="text-xs text-[#8C7A6B]">
            রুম ভাড়া + ইউটিলিটি শেয়ার (৳{Math.round(totalUtilitySharePerMember)}) = মোট প্রদেয়
          </p>
        </div>

        {memberBillings.length > 0 && (
          <button
            type="button"
            onClick={handleCopyWhatsAppSummary}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#C25E3E] bg-[#FDF2EC] hover:bg-[#F8EBE3] active:bg-[#F3E0D5] border border-[#F7D5C9] shadow-2xs transition-colors cursor-pointer touch-manipulation"
          >
            <Copy className="w-3.5 h-3.5 text-[#C25E3E]" />
            <span>Copy WhatsApp Summary</span>
          </button>
        )}
      </div>

      {memberBillings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#DDD3C2] p-10 text-center">
          <Users className="w-12 h-12 text-[#8C7A6B] mx-auto mb-3" />
          <h3 className="font-bold text-[#2C241E] text-base">কোন মেম্বার এখনো যুক্ত করা হয়নি</h3>
          <p className="text-sm text-[#8C7A6B] mt-1 mb-4">
            ভাড়া ও বিল হিসাব পরিচালনা করতে প্রথমে সদস্য যুক্ত করুন।
          </p>
          <button
            type="button"
            onClick={onNavigateToMembers}
            className="px-4 py-2 bg-[#C25E3E] text-white rounded-xl text-sm font-bold hover:bg-[#B05133] cursor-pointer"
          >
            সদস্য তালিকায় যান
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
          <div className="divide-y divide-[#F2ECE1]">
            {memberBillings.map((mb, idx) => {
              const totalDue = mb.roomRent + totalUtilitySharePerMember;
              const balance = totalDue - mb.paidAmount;
              const isPaid = balance <= 0 && totalDue > 0;
              const isPartial = balance > 0 && mb.paidAmount > 0;
              const avatar = getAvatarColor(idx);
              const initials = getInitials(mb.member.name);

              return (
                <div
                  key={mb.id}
                  className="p-4 sm:p-5 hover:bg-[#FDFBF7] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Member Info with Friendly Colored Avatar */}
                  <div className="min-w-[190px] flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border shadow-2xs ${avatar.bg} ${avatar.text} ${avatar.border}`}
                    >
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[#2C241E] text-base leading-tight">
                          {mb.member.name}
                        </h3>
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#E2EBDD] text-[#2D5A27] border border-[#CFDEC8] rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" /> পরিশোধিত
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#FDF0D5] text-[#9C6500] border border-[#F2D79E] rounded-full font-bold">
                            আংশিক জমা
                          </span>
                        )}
                        {!isPaid && !isPartial && totalDue > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#FDF2EC] text-[#B33A3A] border border-[#F7D5C9] rounded-full font-bold">
                            বাকি
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B] mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#8C7A6B]" />
                        <a
                          href={`tel:${mb.member.phone}`}
                          className="hover:text-[#C25E3E] hover:underline font-mono"
                        >
                          {mb.member.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakup & Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-1 items-center">
                    {/* Room Rent */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        রুম ভাড়া (৳)
                      </label>
                      {isAdmin ? (
                        <input
                          type="number"
                          value={mb.roomRent === 0 ? '' : mb.roomRent}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateBilling(
                              mb.id,
                              'roomRent',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm font-bold rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-[#FAF7F2] font-mono"
                        />
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-bold rounded-xl bg-[#FAF7F2] text-[#2C241E] border border-[#E8DFC8] font-mono">
                          ৳{mb.roomRent || 0}
                        </div>
                      )}
                    </div>

                    {/* Utility Share */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        ইউটিলিটি শেয়ার (৳)
                      </label>
                      <div className="px-3 py-1.5 text-sm font-bold rounded-xl bg-[#F3ECE1] text-[#7A6A5C] border border-[#E8DFC8] font-mono">
                        ৳{Math.round(totalUtilitySharePerMember)}
                      </div>
                    </div>

                    {/* Total Due */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        মোট প্রদেয় (৳)
                      </label>
                      <div className="px-3 py-1.5 text-sm font-extrabold text-[#2C241E] bg-[#EFE9DF] rounded-xl border border-[#DDD3C2] font-mono">
                        ৳{Math.round(totalDue)}
                      </div>
                    </div>

                    {/* Paid Amount */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        জমা দিয়েছেন (৳)
                      </label>
                      {isAdmin ? (
                        <input
                          type="number"
                          value={mb.paidAmount === 0 ? '' : mb.paidAmount}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateBilling(
                              mb.id,
                              'paidAmount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm font-bold rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white text-[#2D5A27] font-mono"
                        />
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-bold rounded-xl bg-[#FAF7F2] text-[#2D5A27] border border-[#E8DFC8] font-mono">
                          ৳{mb.paidAmount || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Balance Due & 1-Tap Quick Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#F2ECE1]">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        বাকি টাকা (Due)
                      </span>
                      <span
                        className={`text-base font-black font-mono ${
                          balance > 0
                            ? 'text-[#B33A3A]'
                            : balance < 0
                            ? 'text-[#2A6185]'
                            : 'text-[#2D5A27]'
                        }`}
                      >
                        {balance > 0 ? `৳${Math.round(balance)}` : balance < 0 ? `-৳${Math.abs(Math.round(balance))} (অগ্রিম)` : '৳০'}
                      </span>
                    </div>

                    {/* Quick 1-Tap Action Buttons for Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        {balance > 0 && (
                          <button
                            type="button"
                            onClick={() => onQuickFullPay(mb, totalDue)}
                            title="সম্পূর্ণ পরিশোধ হিসেবে চিহ্নিত করুন"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl shadow-2xs transition-all cursor-pointer touch-manipulation whitespace-nowrap active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>পরিশোধ মার্ক</span>
                          </button>
                        )}
                        {mb.paidAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => onQuickResetPay(mb)}
                            title="জমা শূন্য (Reset) করুন"
                            className="p-1.5 text-[#8C7A6B] hover:text-[#B33A3A] hover:bg-[#FDF2EC] rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
