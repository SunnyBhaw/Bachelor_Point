'use client';

import React from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Home,
  Check,
  Plus,
  Lock,
  Trash2,
} from 'lucide-react';
import { BillingCycle } from '../types';

interface BillsTabProps {
  currentCycle: BillingCycle;
  memberCount: number;
  totalRoomRent: number;
  totalPaidOutExpenses: number;
  totalMessExpenses: number;
  totalRemainingExpensesToPay: number;
  totalPaidBillsCount: number;
  totalGuestContributions: number;
  isAdmin: boolean;
  onOpenHouseRentModal: () => void;
  onMarkHouseRentUnpaid: () => void;
  onOpenAddBillModal: () => void;
  onOpenPinModal: () => void;
  onUpdateBillSplitCount: (billId: string, count: number) => void;
  onUpdateCollectedAmount: (billId: string, amount: number) => void;
  onToggleUtilityBill: (billId: string, isPaid: boolean) => void;
  onDeleteBill: (billId: string, name: string) => void;
}

export default function BillsTab({
  currentCycle,
  memberCount,
  totalRoomRent,
  totalPaidOutExpenses,
  totalMessExpenses,
  totalRemainingExpensesToPay,
  totalPaidBillsCount,
  totalGuestContributions,
  isAdmin,
  onOpenHouseRentModal,
  onMarkHouseRentUnpaid,
  onOpenAddBillModal,
  onOpenPinModal,
  onUpdateBillSplitCount,
  onUpdateCollectedAmount,
  onToggleUtilityBill,
  onDeleteBill,
}: BillsTabProps) {
  const payoutPercent =
    totalMessExpenses > 0
      ? Math.min(100, Math.round((totalPaidOutExpenses / totalMessExpenses) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Mess Outgoing Payouts Tracker (House Rent + Utilities) */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F2ECE1]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#2C241E]">
                Mess Outgoing Payouts Tracker (মেস খরচ ও পরিশোধ)
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E2EBDD] text-[#2D5A27] border border-[#CFDEC8]">
                সবার জন্য উন্মুক্ত
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3ECE1] text-[#7A6A5C]">
                {currentCycle.name}
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              বাড়িওয়ালার বাসা ভাড়া এবং ওয়াইফাই, বুয়া, কারেন্ট ও গ্যাস বিল পরিশোধের হিসাব।
            </p>
          </div>

          {/* Overall Payout Status Summary */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-2 rounded-xl border border-[#E8DFC8] shrink-0 font-mono">
            <span className="text-xs font-semibold text-[#8C7A6B] font-sans">পরিশোধ:</span>
            <span className="text-xs font-black text-[#2D5A27]">
              ৳{Math.round(totalPaidOutExpenses)}
            </span>
            <span className="text-[#DDD3C2]">/</span>
            <span className="text-xs font-bold text-[#2C241E]">
              ৳{Math.round(totalMessExpenses)}
            </span>
            {totalRemainingExpensesToPay > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FDF2EC] text-[#B33A3A] border border-[#F7D5C9] font-bold ml-1 font-sans">
                ৳{Math.round(totalRemainingExpensesToPay)} বাকি
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E2EBDD] text-[#2D5A27] border border-[#CFDEC8] font-bold ml-1 font-sans">
                সব পরিশোধিত ✓
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-[#EFE9DF] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2D5A27] h-2 rounded-full transition-all duration-300"
              style={{ width: `${payoutPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] mt-1.5 font-medium">
            <span>{payoutPercent}% মেস খরচ পরিশোধ সম্পন্ন</span>
            <span>
              {currentCycle.houseRentPaid ? '১/১ বাড়ি ভাড়া' : '০/১ বাড়ি ভাড়া'} •{' '}
              {totalPaidBillsCount}/{currentCycle.bills.length} ইউটিলিটি পরিশোধিত
            </span>
          </div>
        </div>

        {/* House Rent Card (Prominent Warm Banner) */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            currentCycle.houseRentPaid
              ? 'bg-[#E2EBDD]/50 border-[#CFDEC8]'
              : 'bg-[#FDF2EC]/70 border-[#F7D5C9]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-2xs ${
                currentCycle.houseRentPaid
                  ? 'bg-[#E2EBDD] text-[#2D5A27] border border-[#CFDEC8]'
                  : 'bg-[#FDF2EC] text-[#C25E3E] border border-[#F7D5C9]'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-[#2C241E] text-sm sm:text-base">
                  House Rent to Landlord (বাড়িওয়ালার বাসা ভাড়া)
                </h4>
                {currentCycle.houseRentPaid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-[#E2EBDD] text-[#2D5A27] rounded-full font-bold border border-[#CFDEC8]">
                    <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" /> বাড়িওয়ালাকে পরিশোধিত ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-[#FDF2EC] text-[#B33A3A] rounded-full font-bold border border-[#F7D5C9]">
                    <AlertCircle className="w-3 h-3 text-[#B33A3A]" /> বাড়িওয়ালার ভাড়া বাকি ⏳
                  </span>
                )}
              </div>
              <div className="text-xs text-[#7A6A5C] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  মোট অ্যাপার্টমেন্ট ভাড়া:{' '}
                  <strong className="text-[#2C241E] font-mono">৳{Math.round(totalRoomRent)}</strong>
                </span>
                {currentCycle.houseRentPaid && currentCycle.houseRentPaidAt && (
                  <span className="text-[#2D5A27] font-semibold">
                    • পরিশোধের তারিখ: {new Date(currentCycle.houseRentPaidAt).toLocaleDateString()}
                  </span>
                )}
                {currentCycle.houseRentPaidNote && (
                  <span className="text-[#8C7A6B] italic">
                    ({currentCycle.houseRentPaidNote})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {currentCycle.houseRentPaid ? (
              <button
                type="button"
                onClick={onMarkHouseRentUnpaid}
                className="px-3 py-1.5 text-xs font-bold text-[#8C7A6B] hover:text-[#B33A3A] hover:bg-white bg-white/80 border border-[#DDD3C2] rounded-xl transition-all cursor-pointer touch-manipulation"
              >
                বাকি চিহ্নিত করুন
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenHouseRentModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5A27] hover:bg-[#23491E] text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer touch-manipulation"
              >
                <Check className="w-4 h-4" />
                বাড়ি ভাড়া পরিশোধ মার্ক
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Utility Bills List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-[#2C241E]">Utility Bills (মেস বিলসমূহ)</h3>
          <p className="text-xs text-[#8C7A6B]">
            ওয়াইফাই, বুয়া, কারেন্ট, গ্যাস ও ময়লা বিল ব্যবস্থাপনা ও স্প্লিট
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isAdmin) {
              onOpenPinModal();
            } else {
              onOpenAddBillModal();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl text-sm font-bold shadow-2xs transition-colors cursor-pointer"
        >
          {isAdmin ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          বিল যুক্ত করুন
        </button>
      </div>

      {/* Meal Guest Summary Alert if extra people share any bill */}
      {totalGuestContributions > 0 && (
        <div className="bg-[#FDF0D5] border border-[#F2D79E] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-[#9C6500] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🍲</span>
            <div>
              <span className="font-bold">মিল গেস্ট যুক্ত আছেন: </span>
              <span className="text-[#7A4E2D]">
                খাবারের বিলে অতিথি(দের) থেকে <strong>৳{Math.round(totalGuestContributions)}</strong> গ্রহণ করুন।
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-[#F2D79E] rounded-lg font-extrabold text-[#9C6500] shrink-0 font-mono">
            ৳{Math.round(totalGuestContributions)} Guest
          </span>
        </div>
      )}

      {/* Utility Bills Grid */}
      {currentCycle.bills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#DDD3C2] p-10 text-center">
          <Receipt className="w-12 h-12 text-[#8C7A6B] mx-auto mb-3" />
          <h4 className="font-bold text-[#2C241E] text-base">এই মাসে কোনো বিল যুক্ত করা হয়নি</h4>
          <p className="text-sm text-[#8C7A6B] mt-1 mb-4">
            ওয়াইফাই, গ্যাস, বুয়ার বেতন বা কারেন্ট বিল যুক্ত করে শেয়ারিং শুরু করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              if (!isAdmin) {
                onOpenPinModal();
              } else {
                onOpenAddBillModal();
              }
            }}
            className="px-4 py-2 bg-[#C25E3E] text-white rounded-xl text-sm font-bold hover:bg-[#B05133] cursor-pointer"
          >
            প্রথম বিল যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {currentCycle.bills.map((bill) => {
            const effectiveSplitPeople =
              bill.splitCount && bill.splitCount > 0 ? bill.splitCount : memberCount;
            const exactSplit =
              effectiveSplitPeople > 0 ? bill.totalAmount / effectiveSplitPeople : 0;
            const totalCollectedForThisBill =
              bill.collectedPerPerson * effectiveSplitPeople;
            const diff = totalCollectedForThisBill - bill.totalAmount;
            const hasGuests = effectiveSplitPeople > memberCount;
            const guestCount = effectiveSplitPeople - memberCount;

            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border border-[#E8DFC8] p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Bill details */}
                  <div className="min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-[#2C241E] text-base">{bill.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          bill.billType === 'FIXED'
                            ? 'bg-[#F5E5DC] text-[#C25E3E] border border-[#E8C2B3]'
                            : 'bg-[#FDF0D5] text-[#9C6500] border border-[#F2D79E]'
                        }`}
                      >
                        {bill.billType === 'FIXED' ? 'ফিক্সড বিল' : 'ভেরিয়েবল'}
                      </span>
                      {hasGuests && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FDF0D5] text-[#9C6500] border border-[#F2D79E]">
                          +{guestCount} মিল গেস্ট
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#7A6A5C] mt-1 font-mono">
                      মোট বিল: <strong className="text-[#2C241E]">৳{bill.totalAmount}</strong> | সঠিক ভাগ ({effectiveSplitPeople}জন):{' '}
                      <span className="font-bold text-[#C25E3E]">৳{exactSplit.toFixed(2)}</span>
                    </div>
                    {hasGuests && (
                      <div className="text-[11px] text-[#7A4E2D] font-semibold mt-1 flex items-center gap-1.5">
                        <span>🍲</span>
                        <span>
                          {memberCount} রুমমেট + {guestCount} গেস্ট • গেস্ট দিবে:{' '}
                          <strong className="font-mono">৳{bill.collectedPerPerson * guestCount}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Split Count & Collected Amount Tuning */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {/* Split People Stepper */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        ভাগ হবে (সদস্য)
                      </label>
                      {isAdmin ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBillSplitCount(
                                bill.id,
                                Math.max(1, effectiveSplitPeople - 1)
                              )
                            }
                            title="সদস্য কমান"
                            className="w-7 h-7 rounded-lg bg-[#F3ECE1] hover:bg-[#EAE1D3] text-[#2C241E] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <div
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border text-center min-w-[56px] font-mono ${
                              hasGuests
                                ? 'bg-[#FDF0D5] text-[#9C6500] border-[#F2D79E] font-black'
                                : 'bg-[#FAF7F2] text-[#2C241E] border-[#E8DFC8]'
                            }`}
                          >
                            {effectiveSplitPeople} জন
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBillSplitCount(bill.id, effectiveSplitPeople + 1)
                            }
                            title="সদস্য বা মিল গেস্ট বাড়ান"
                            className="w-7 h-7 rounded-lg bg-[#F3ECE1] hover:bg-[#EAE1D3] text-[#2C241E] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border text-center font-mono ${
                            hasGuests
                              ? 'bg-[#FDF0D5] text-[#9C6500] border-[#F2D79E] font-black'
                              : 'bg-[#FAF7F2] text-[#2C241E] border-[#E8DFC8]'
                          }`}
                        >
                          {effectiveSplitPeople} জন
                        </div>
                      )}
                    </div>

                    {/* Collected / Person */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8C7A6B] mb-1">
                        মাথাপিছু ধার্য (৳)
                      </label>
                      {isAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={bill.collectedPerPerson}
                            onChange={(e) =>
                              onUpdateCollectedAmount(
                                bill.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 text-sm font-extrabold text-[#C25E3E] bg-[#FAF7F2] border border-[#DDD3C2] rounded-xl focus:border-[#C25E3E] outline-hidden text-center font-mono"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCollectedAmount(
                                  bill.id,
                                  bill.collectedPerPerson - 5
                                )
                              }
                              title="৫ টাকা কমান"
                              className="px-1.5 py-1 text-xs font-bold bg-[#F3ECE1] hover:bg-[#EAE1D3] text-[#2C241E] rounded-md cursor-pointer font-mono"
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCollectedAmount(
                                  bill.id,
                                  bill.collectedPerPerson + 5
                                )
                              }
                              title="৫ টাকা বাড়ান"
                              className="px-1.5 py-1 text-xs font-bold bg-[#F3ECE1] hover:bg-[#EAE1D3] text-[#2C241E] rounded-md cursor-pointer font-mono"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-extrabold text-[#C25E3E] bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl text-center font-mono">
                          ৳{bill.collectedPerPerson}
                        </div>
                      )}
                    </div>

                    {/* Bill Net Variance */}
                    <div className="bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#E8DFC8] text-center min-w-[110px]">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                        ব্যালান্স লাভ/ঘাটতি
                      </span>
                      <span
                        className={`text-xs font-extrabold font-mono ${
                          diff === 0
                            ? 'text-[#7A6A5C]'
                            : diff > 0
                            ? 'text-[#2D5A27]'
                            : 'text-[#B33A3A]'
                        }`}
                      >
                        {diff === 0
                          ? 'সমান (৳০)'
                          : diff > 0
                          ? `+৳${diff.toFixed(0)} উদ্বৃত্ত`
                          : `-৳${Math.abs(diff).toFixed(0)} ঘাটতি`}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteBill(bill.id, bill.name)}
                        className="p-2 text-[#8C7A6B] hover:text-[#B33A3A] hover:bg-[#FDF2EC] rounded-xl transition-colors cursor-pointer"
                        title="বিল মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Provider Payout Status & Quick Toggle */}
                <div className="flex items-center justify-between border-t border-[#F2ECE1] pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8C7A6B] font-semibold">
                      ভেন্ডর পরিশোধ:
                    </span>
                    {bill.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-[#E2EBDD] text-[#2D5A27] rounded-full font-bold border border-[#CFDEC8]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                        ভেন্ডরকে পরিশোধিত ✓
                        {bill.paidAt && (
                          <span className="font-normal text-[10px] text-[#2D5A27] hidden sm:inline">
                            ({new Date(bill.paidAt).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-[#FDF0D5] text-[#9C6500] rounded-full font-bold border border-[#F2D79E]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#9C6500]" />
                        বিল পরিশোধ বাকি ⏳
                      </span>
                    )}
                  </div>

                  {/* Toggle button - Open to all roommates */}
                  {bill.isPaid ? (
                    <button
                      type="button"
                      onClick={() => onToggleUtilityBill(bill.id, false)}
                      className="px-2.5 py-1 text-xs font-bold text-[#8C7A6B] hover:text-[#9C6500] hover:bg-[#F3ECE1] rounded-lg transition-colors cursor-pointer touch-manipulation"
                    >
                      বাকি মার্ক করুন
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleUtilityBill(bill.id, true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D5A27] hover:bg-[#23491E] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer touch-manipulation"
                    >
                      <Check className="w-3.5 h-3.5" />
                      পরিশোধ মার্ক করুন
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
