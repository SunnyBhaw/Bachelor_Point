'use client';

import React from 'react';
import { Receipt } from 'lucide-react';
import { COMMON_BILLS_SUGGESTIONS } from '../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  newBillName: string;
  setNewBillName: (v: string) => void;
  newBillType: 'FIXED' | 'VARIABLE';
  setNewBillType: (v: 'FIXED' | 'VARIABLE') => void;
  newBillAmount: string;
  newBillCollected: string;
  setNewBillCollected: (v: string) => void;
  newBillSplitCount: number;
  memberCount: number;
  onAmountChange: (val: string) => void;
  onSplitCountChange: (count: number) => void;
}

export default function BillModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  newBillName,
  setNewBillName,
  newBillType,
  setNewBillType,
  newBillAmount,
  newBillCollected,
  setNewBillCollected,
  newBillSplitCount,
  memberCount,
  onAmountChange,
  onSplitCountChange,
}: BillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2C241E] text-base">নতুন ইউটিলিটি বিল যোগ</h3>
              <p className="text-xs text-[#8C7A6B]">মেস খরচের নতুন বিল যুক্ত ও শেয়ার করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#8C7A6B] hover:text-[#2C241E] hover:bg-[#F3ECE1] flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5">
            সরাসরি নির্বাচন করুন (Quick Suggestions)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_BILLS_SUGGESTIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setNewBillName(item.name);
                  setNewBillType(item.type);
                  onAmountChange(item.defaultAmount);
                }}
                className="text-xs px-2.5 py-1 rounded-xl border border-[#DDD3C2] bg-white hover:bg-[#F5E5DC] hover:border-[#E8C2B3] text-[#2C241E] font-semibold transition-colors cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              বিলের নাম
            </label>
            <input
              type="text"
              placeholder="যেমন: ওয়াইফাই বিল, কারেন্ট বিল, বুয়া বিল..."
              value={newBillName}
              onChange={(e) => setNewBillName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              বিলের ধরন (Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewBillType('FIXED')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  newBillType === 'FIXED'
                    ? 'bg-[#F5E5DC] border-[#C25E3E] text-[#C25E3E]'
                    : 'border-[#DDD3C2] bg-white text-[#7A6A5C] hover:bg-[#FAF7F2]'
                }`}
              >
                ফিক্সড মাসিক (Fixed)
              </button>
              <button
                type="button"
                onClick={() => setNewBillType('VARIABLE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  newBillType === 'VARIABLE'
                    ? 'bg-[#FDF0D5] border-[#D97706] text-[#9C6500]'
                    : 'border-[#DDD3C2] bg-white text-[#7A6A5C] hover:bg-[#FAF7F2]'
                }`}
              >
                পরিবর্তনশীল (Variable)
              </button>
            </div>
          </div>

          {/* Custom Split People Count */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#2C241E]">
                  ভাগ হবে (সদস্য ও মিল গেস্ট)
                </label>
                <span className="text-[11px] text-[#8C7A6B]">
                  {newBillSplitCount > memberCount ? (
                    <span className="text-[#9C6500] font-semibold">
                      {memberCount} রুমমেট + {newBillSplitCount - memberCount} মিল গেস্ট
                    </span>
                  ) : newBillSplitCount === memberCount ? (
                    'সকল রুমমেটের মধ্যে সমবণ্টন'
                  ) : (
                    `${newBillSplitCount} জনের মধ্যে বণ্টন`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSplitCountChange(Math.max(1, newBillSplitCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#DDD3C2] hover:bg-[#F3ECE1] flex items-center justify-center text-[#2C241E] font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono text-[#C25E3E]">
                  {newBillSplitCount}
                </span>
                <button
                  type="button"
                  onClick={() => onSplitCountChange(newBillSplitCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-[#DDD3C2] hover:bg-[#F3ECE1] flex items-center justify-center text-[#2C241E] font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Presets for Split */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-[#E8DFC8]">
              <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">প্রিসেট:</span>
              <button
                type="button"
                onClick={() => onSplitCountChange(memberCount)}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border cursor-pointer ${
                  newBillSplitCount === memberCount
                    ? 'bg-[#C25E3E] text-white border-[#C25E3E]'
                    : 'bg-white text-[#7A6A5C] border-[#DDD3C2] hover:bg-[#FAF7F2]'
                }`}
              >
                {memberCount} জন রুমমেট
              </button>
              <button
                type="button"
                onClick={() => onSplitCountChange(memberCount + 1)}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border cursor-pointer ${
                  newBillSplitCount === memberCount + 1
                    ? 'bg-[#D97706] text-white border-[#D97706]'
                    : 'bg-white text-[#7A6A5C] border-[#DDD3C2] hover:bg-[#FAF7F2]'
                }`}
              >
                +১ গেস্ট ({memberCount + 1})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              মোট বিলের পরিমাণ (৳)
            </label>
            <input
              type="number"
              step="any"
              placeholder="যেমন: 1000 অথবা 1700"
              value={newBillAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden font-mono bg-white"
              required
            />
            {newBillAmount && newBillSplitCount > 0 && (
              <p className="text-[11px] text-[#8C7A6B] mt-1 font-mono">
                সঠিক ভাগ ({newBillSplitCount} জন):{' '}
                <strong className="text-[#2C241E]">
                  ৳{(parseFloat(newBillAmount) / newBillSplitCount).toFixed(2)}
                </strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              মাথাপিছু ধার্য টাকা (৳)
            </label>
            <input
              type="number"
              step="any"
              placeholder="যেমন: 165 অথবা 285"
              value={newBillCollected}
              onChange={(e) => setNewBillCollected(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden font-mono text-[#C25E3E] font-black bg-white"
              required
            />
            {newBillAmount && newBillCollected && newBillSplitCount > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs">
                {(() => {
                  const splitPeople = newBillSplitCount;
                  const collPerPerson = parseFloat(newBillCollected) || 0;
                  const totalColl = collPerPerson * splitPeople;
                  const billTot = parseFloat(newBillAmount) || 0;
                  const diff = totalColl - billTot;
                  const hasGuests = splitPeople > memberCount;
                  const guestCount = splitPeople - memberCount;

                  return (
                    <div className="space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A6A5C] font-sans">
                          মোট উঠবে ({splitPeople} জন): <strong>৳{totalColl}</strong>
                        </span>
                        <span
                          className={`font-black ${
                            diff >= 0 ? 'text-[#2D5A27]' : 'text-[#B33A3A]'
                          }`}
                        >
                          {diff === 0
                            ? 'সমান (৳০)'
                            : diff > 0
                            ? `+৳${diff.toFixed(0)} উদ্বৃত্ত`
                            : `-৳${Math.abs(diff).toFixed(0)} ঘাটতি`}
                        </span>
                      </div>
                      {hasGuests && (
                        <div className="text-[11px] text-[#9C6500] font-semibold pt-1 border-t border-[#E8DFC8] flex items-center justify-between font-sans">
                          <span>{memberCount} রুমমেট: ৳{collPerPerson * memberCount}</span>
                          <span>{guestCount} মিল গেস্ট: ৳{collPerPerson * guestCount}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8C7A6B] hover:bg-[#F3ECE1] rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              বিল সেভ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
