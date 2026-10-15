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
import { BillingCycle, MemberBilling } from '../types';
import {
  WhatsAppIcon,
  formatWhatsAppNumber,
  buildWhatsAppReminderMessage,
  buildWhatsAppReceiptMessage,
} from '@/lib/whatsapp';

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

  const handleSendWhatsAppReminder = (mb: MemberBilling, totalDue: number, balance: number) => {
    const phone = formatWhatsAppNumber(mb.member.phone);
    const msg = buildWhatsAppReminderMessage({
      memberName: mb.member.name,
      cycleName: currentCycle.name,
      roomRent: mb.roomRent,
      utilityShare: totalUtilitySharePerMember,
      totalDue,
      paidAmount: mb.paidAmount,
      balance,
    });

    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onShowToast(`Opening WhatsApp reminder for ${mb.member.name}! 💬 (Text copied to clipboard)`, 'success');
  };

  const handleSendWhatsAppReceipt = (mb: MemberBilling, totalDue: number) => {
    const phone = formatWhatsAppNumber(mb.member.phone);
    const msg = buildWhatsAppReceiptMessage({
      memberName: mb.member.name,
      cycleName: currentCycle.name,
      roomRent: mb.roomRent,
      utilityShare: totalUtilitySharePerMember,
      totalDue,
      paidAmount: mb.paidAmount,
    });

    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onShowToast(`Opening WhatsApp receipt for ${mb.member.name}! 🧾 (Text copied to clipboard)`, 'success');
  };

  const handleCopyWhatsAppSummary = () => {
    if (memberBillings.length === 0) return;

    let text = `🏠 *Bachelor Point - ${currentCycle.name} Dues Breakdown*\n`;
    text += `⚡ Utility Share per Member: ৳${Math.round(totalUtilitySharePerMember)}\n\n`;

    memberBillings.forEach((mb) => {
      const totalDue = mb.roomRent + totalUtilitySharePerMember;
      const balance = totalDue - mb.paidAmount;
      const statusText = balance <= 0 ? '✅ Paid' : `⚠️ Due: ৳${Math.round(balance)}`;
      text += `• *${mb.member.name}*: Total ৳${Math.round(totalDue)} (Rent: ৳${mb.roomRent} + Util: ৳${Math.round(totalUtilitySharePerMember)}) | Paid: ৳${mb.paidAmount} [${statusText}]\n`;
    });

    const totalCollected = memberBillings.reduce((acc, mb) => acc + mb.paidAmount, 0);
    const totalExpected = memberBillings.reduce((acc, mb) => acc + mb.roomRent + totalUtilitySharePerMember, 0);
    const totalRemaining = Math.max(0, totalExpected - totalCollected);

    text += `\n💰 *Total Collected*: ৳${Math.round(totalCollected)} / ৳${Math.round(totalExpected)}`;
    text += `\n⏳ *Remaining Due*: ৳${Math.round(totalRemaining)}`;

    navigator.clipboard.writeText(text);
    onShowToast('Dues summary copied to clipboard for WhatsApp! 📋', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Member Dues & Payments</h2>
          <p className="text-xs text-slate-500">
            Room rent + Utility share (৳{Math.round(totalUtilitySharePerMember)}) = Total Due
          </p>
        </div>

        {memberBillings.length > 0 && (
          <button
            type="button"
            onClick={handleCopyWhatsAppSummary}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer touch-manipulation"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600" />
            <span>Copy WhatsApp Summary</span>
          </button>
        )}
      </div>

      {memberBillings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No members registered yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Add members in the Members tab to start managing dues.
          </p>
          <button
            type="button"
            onClick={onNavigateToMembers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Go to Members
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {memberBillings.map((mb) => {
              const totalDue = mb.roomRent + totalUtilitySharePerMember;
              const balance = totalDue - mb.paidAmount;
              const isPaid = balance <= 0 && totalDue > 0;
              const isPartial = balance > 0 && mb.paidAmount > 0;

              return (
                <div
                  key={mb.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Member Info */}
                  <div className="min-w-[170px]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{mb.member.name}</h3>
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                        </span>
                      )}
                      {isPartial && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                          Partial
                        </span>
                      )}
                      {!isPaid && !isPartial && totalDue > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={`tel:${mb.member.phone}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {mb.member.phone}
                        </a>
                      </div>
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(mb.member.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Chat with ${mb.member.name} on WhatsApp`}
                        className="p-1 text-[#25D366] hover:bg-emerald-50 rounded-md transition-colors"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      </a>
                    </div>
                  </div>

                  {/* Financial Breakup & Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 items-center">
                    {/* Room Rent */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Room Rent (৳)
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
                          className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-slate-50/50"
                        />
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-50 text-slate-800 border border-slate-200">
                          ৳{mb.roomRent || 0}
                        </div>
                      )}
                    </div>

                    {/* Utility Share */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Utility Share (৳)
                      </label>
                      <div className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        ৳{Math.round(totalUtilitySharePerMember)}
                      </div>
                    </div>

                    {/* Total Due */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Total Due (৳)
                      </label>
                      <div className="px-3 py-1.5 text-sm font-bold text-slate-900 bg-slate-100 rounded-lg border border-slate-200">
                        ৳{Math.round(totalDue)}
                      </div>
                    </div>

                    {/* Paid Amount */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Paid Amount (৳)
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
                          className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white text-emerald-700 font-mono"
                        />
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-bold rounded-lg bg-slate-50 text-emerald-700 border border-slate-200 font-mono">
                          ৳{mb.paidAmount || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Balance Due & 1-Tap Quick Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Remaining Due
                      </span>
                      <span
                        className={`text-base font-extrabold ${
                          balance > 0
                            ? 'text-rose-600'
                            : balance < 0
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {balance > 0 ? `৳${Math.round(balance)}` : balance < 0 ? `-৳${Math.abs(Math.round(balance))} (Adv)` : '৳0'}
                      </span>
                    </div>

                    {/* Action Buttons: 1-Tap WhatsApp Reminder & Admin Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {balance > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReminder(mb, totalDue, balance)}
                          title={`Send 1-Tap WhatsApp Dues Reminder to ${mb.member.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white rounded-xl shadow-xs transition-all cursor-pointer touch-manipulation whitespace-nowrap"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                          <span>Remind</span>
                        </button>
                      )}

                      {isPaid && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReceipt(mb, totalDue)}
                          title={`Send WhatsApp Payment Receipt to ${mb.member.name}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation whitespace-nowrap"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                          <span>Receipt</span>
                        </button>
                      )}

                      {/* Admin Specific Actions */}
                      {isAdmin && (
                        <>
                          {balance > 0 && (
                            <button
                              type="button"
                              onClick={() => onQuickFullPay(mb, totalDue)}
                              title="Mark as 100% Fully Paid"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer touch-manipulation whitespace-nowrap active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Full</span>
                            </button>
                          )}
                          {mb.paidAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => onQuickResetPay(mb)}
                              title="Reset payment to 0"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
