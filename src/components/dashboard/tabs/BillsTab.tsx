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
  return (
    <div className="space-y-6">
      {/* Mess Outgoing Payouts Tracker (House Rent + Utilities) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Mess Outgoing Payouts Tracker
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Open to All Roommates
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {currentCycle.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track when you gave House Rent to the Landlord and paid utility vendors.
            </p>
          </div>

          {/* Overall Payout Status Summary */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
            <span className="text-xs font-semibold text-slate-500">Paid Out:</span>
            <span className="text-xs font-extrabold text-emerald-600">
              ৳{Math.round(totalPaidOutExpenses)}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-700">
              ৳{Math.round(totalMessExpenses)}
            </span>
            {totalRemainingExpensesToPay > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold ml-1">
                ৳{Math.round(totalRemainingExpensesToPay)} Due
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold ml-1">
                All Cleared ✓
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalMessExpenses > 0
                    ? Math.min(100, Math.round((totalPaidOutExpenses / totalMessExpenses) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>
              {totalMessExpenses > 0
                ? Math.round((totalPaidOutExpenses / totalMessExpenses) * 100)
                : 0}
              % of total payouts completed
            </span>
            <span>
              {currentCycle.houseRentPaid ? '1/1 Rent' : '0/1 Rent'} • {totalPaidBillsCount}/
              {currentCycle.bills.length} Bills Paid
            </span>
          </div>
        </div>

        {/* House Rent Card (Prominent) */}
        <div
          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            currentCycle.houseRentPaid
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-rose-50/40 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                currentCycle.houseRentPaid
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  House Rent to Landlord (বাড়িওয়ালার ভাড়া)
                </h4>
                {currentCycle.houseRentPaid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid to Landlord ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold border border-rose-300">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Due to Landlord ⏳
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Total Apartment Rent: <strong className="text-slate-900">৳{Math.round(totalRoomRent)}</strong>
                </span>
                {currentCycle.houseRentPaid && currentCycle.houseRentPaidAt && (
                  <span className="text-emerald-700 font-medium">
                    • Paid on {new Date(currentCycle.houseRentPaidAt).toLocaleDateString()}
                  </span>
                )}
                {currentCycle.houseRentPaidNote && (
                  <span className="text-slate-500 italic">
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
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white bg-white/80 border border-slate-200 rounded-xl transition-all cursor-pointer touch-manipulation"
              >
                Mark as Unpaid
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenHouseRentModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer touch-manipulation"
              >
                <Check className="w-4 h-4" />
                Mark House Rent as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Utility Bills List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Utility Bills</h3>
          <p className="text-xs text-slate-500">
            Manage monthly utilities and custom split counts (e.g. meal guests on Gas)
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
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
        >
          {isAdmin ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          Add Bill
        </button>
      </div>

      {/* Meal Guest Summary Alert if extra people share any bill (like Gas) */}
      {totalGuestContributions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🍲</span>
            <div>
              <span className="font-bold">Meal Guests Active: </span>
              <span className="text-amber-800">
                Collect <strong>৳{Math.round(totalGuestContributions)}</strong> total from guest(s) sharing meal bills.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-100 rounded-lg font-extrabold text-amber-900 shrink-0">
            ৳{Math.round(totalGuestContributions)} Guest Share
          </span>
        </div>
      )}

      {/* Utility Bills Grid */}
      {currentCycle.bills.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">No bills added yet for this month</h4>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Add bills like WiFi, Gas, Maid salary, or Electricity to start splitting.
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Add First Bill
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
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Bill details */}
                  <div className="min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{bill.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          bill.billType === 'FIXED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {bill.billType}
                      </span>
                      {hasGuests && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          +{guestCount} Meal Guest{guestCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Total Bill: <strong className="text-slate-800">৳{bill.totalAmount}</strong> | Exact split ({effectiveSplitPeople}p):{' '}
                      <span className="font-mono">৳{exactSplit.toFixed(2)}</span>
                    </div>
                    {hasGuests && (
                      <div className="text-[11px] text-amber-800 font-semibold mt-1.5 flex items-center gap-1.5">
                        <span>🍲</span>
                        <span>
                          {memberCount} Roommates + {guestCount} Guest{guestCount > 1 ? 's' : ''} • Guest pays: <strong>৳{bill.collectedPerPerson * guestCount}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Split Count & Collected Amount Tuning */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Split People Stepper */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Split Among
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
                            title="Decrease people count"
                            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <div
                            className={`px-2.5 py-1 text-xs font-bold rounded-md border text-center min-w-[56px] ${
                              hasGuests
                                ? 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold'
                                : 'bg-slate-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            {effectiveSplitPeople} pers
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBillSplitCount(bill.id, effectiveSplitPeople + 1)
                            }
                            title="Increase people count (add meal guest)"
                            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`px-2.5 py-1 text-xs font-bold rounded-md border text-center ${
                            hasGuests
                              ? 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          {effectiveSplitPeople} Persons
                        </div>
                      )}
                    </div>

                    {/* Collected / Person */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Collected / Person (৳)
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
                            className="w-20 px-2 py-1 text-sm font-bold text-indigo-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden text-center"
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
                              title="Decrease by 5"
                              className="px-1.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer"
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
                              title="Increase by 5"
                              className="px-1.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 text-sm font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono">
                          ৳{bill.collectedPerPerson}
                        </div>
                      )}
                    </div>

                    {/* Bill Net Variance */}
                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center min-w-[110px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Adjustment
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          diff === 0
                            ? 'text-slate-600'
                            : diff > 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {diff === 0
                          ? 'Exact (0)'
                          : diff > 0
                          ? `+৳${diff.toFixed(0)} Gain`
                          : `-৳${Math.abs(diff).toFixed(0)} Loss`}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteBill(bill.id, bill.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Provider Payout Status & Quick Toggle */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Provider Payout:
                    </span>
                    {bill.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Paid to Provider ✓
                        {bill.paidAt && (
                          <span className="font-normal text-[10px] text-emerald-700 hidden sm:inline">
                            ({new Date(bill.paidAt).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full font-bold border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Payment Pending ⏳
                      </span>
                    )}
                  </div>

                  {/* Toggle button - Open to all roommates */}
                  {bill.isPaid ? (
                    <button
                      type="button"
                      onClick={() => onToggleUtilityBill(bill.id, false)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
                    >
                      Mark Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleUtilityBill(bill.id, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer touch-manipulation"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark as Paid
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
