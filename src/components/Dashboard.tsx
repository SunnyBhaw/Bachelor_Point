'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import {
  Users,
  Receipt,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowRightLeft,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  PhoneCall,
  Pencil,
  Copy,
  BookOpen,
  Home,
  Menu,
  X,
} from 'lucide-react';
import {
  addMember,
  deleteMember,
  addUtilityBill,
  updateUtilityBill,
  deleteUtilityBill,
  updateMemberBilling,
  createBillingCycle,
  verifyAdminPin,
  lockAdmin,
  changeAdminPin,
  addImportantNote,
  updateImportantNote,
  deleteImportantNote,
  toggleHouseRentPayment,
  toggleUtilityBillPayment,
} from '@/app/actions';

interface Member {
  id: string;
  name: string;
  phone: string;
}

interface UtilityBill {
  id: string;
  name: string;
  billType: string;
  totalAmount: number;
  collectedPerPerson: number;
  splitCount?: number | null;
  isPaid?: boolean;
  paidAt?: Date | string | null;
  paidNote?: string | null;
}

interface MemberBilling {
  id: string;
  memberId: string;
  roomRent: number;
  paidAmount: number;
  member: Member;
}

interface BillingCycle {
  id: string;
  month: number;
  year: number;
  name: string;
  houseRentPaid?: boolean;
  houseRentPaidAt?: Date | string | null;
  houseRentPaidNote?: string | null;
  bills: UtilityBill[];
  memberBillings: MemberBilling[];
}

export interface ImportantNote {
  id: string;
  title: string;
  contactNumber?: string | null;
  details?: string | null;
  category: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const COMMON_BILLS_SUGGESTIONS = [
  { name: 'কারেন্ট বিল', type: 'VARIABLE' as const, defaultAmount: '2640', defaultCollected: '440' },
  { name: 'বুয়া খরচ', type: 'FIXED' as const, defaultAmount: '3600', defaultCollected: '600' },
  { name: 'ময়লা খরচ', type: 'FIXED' as const, defaultAmount: '150', defaultCollected: '25' },
  { name: 'নেট বিল', type: 'FIXED' as const, defaultAmount: '1050', defaultCollected: '175' },
  { name: 'গ্যাস বিল', type: 'VARIABLE' as const, defaultAmount: '1700', defaultCollected: '285' },
];

const COMMON_NOTE_SUGGESTIONS = [
  { title: 'বুয়ার নাম্বার', category: 'CONTACT', icon: '🧹', placeholderNumber: '017xxxxxxxx', placeholderDetails: 'সকাল ৭টায় আসে, রান্নার দায়িত্ব' },
  { title: 'গ্যাস সিলিন্ডার ডেলিভারি', category: 'CONTACT', icon: '🔥', placeholderNumber: '018xxxxxxxx', placeholderDetails: 'দোকান: ভাই ভাই গ্যাস, দিতে ৩০ মিনিট সময় লাগে' },
  { title: 'ওয়াইফাই সাপোর্ট (ISP)', category: 'CONTACT', icon: '📶', placeholderNumber: '019xxxxxxxx', placeholderDetails: 'User ID: 10425, প্যাকেজ: 30 Mbps' },
  { title: 'বাড়িওয়ালা (মালিক)', category: 'CONTACT', icon: '🏠', placeholderNumber: '017xxxxxxxx', placeholderDetails: 'ভাড়া প্রতি মাসের ১-৭ তারিখের মধ্যে পরিশোধ' },
  { title: 'ইলেকট্রিশিয়ান', category: 'CONTACT', icon: '⚡', placeholderNumber: '016xxxxxxxx', placeholderDetails: 'জরুরী বিদ্যুৎ মেরামতের জন্য' },
  { title: 'প্লাম্বার (পানি/পাইপ)', category: 'CONTACT', icon: '🔧', placeholderNumber: '018xxxxxxxx', placeholderDetails: 'পানি লাইনে সমস্যা হলে' },
];

interface DashboardProps {
  initialMembers: Member[];
  initialCycles: { id: string; month: number; year: number; name: string }[];
  currentCycle: BillingCycle;
  initialIsAdmin?: boolean;
  initialImportantNotes?: ImportantNote[];
}

export default function Dashboard({
  initialMembers,
  initialCycles,
  currentCycle: initialCycle,
  initialIsAdmin = false,
  initialImportantNotes = [],
}: DashboardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [changePinModalOpen, setChangePinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<'dues' | 'utilities' | 'members' | 'notes'>('dues');
  const [currentCycle, setCurrentCycle] = useState<BillingCycle>(initialCycle);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isPending, startTransition] = useTransition();

  // Important Notes State (Open to all roommates - No Admin PIN required)
  const [importantNotes, setImportantNotes] = useState<ImportantNote[]>(initialImportantNotes);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContact, setNoteContact] = useState('');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteCategory, setNoteCategory] = useState('CONTACT');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // House Rent Payout State
  const [houseRentModalOpen, setHouseRentModalOpen] = useState(false);
  const [houseRentNoteInput, setHouseRentNoteInput] = useState('');

  // Handle PIN Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setPinError('');

    startTransition(async () => {
      const res = await verifyAdminPin(pinInput);
      if (res.success) {
        setIsAdmin(true);
        setPinModalOpen(false);
        setPinInput('');
      } else {
        setPinError(res.error || 'Incorrect PIN');
      }
    });
  };

  // Handle PIN Lock
  const handleLock = async () => {
    startTransition(async () => {
      await lockAdmin();
      setIsAdmin(false);
    });
  };

  // Handle Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');
    setChangePinSuccess(false);

    startTransition(async () => {
      const res = await changeAdminPin(currentPinInput, newPinInput);
      if (res.success) {
        setChangePinSuccess(true);
        setCurrentPinInput('');
        setNewPinInput('');
        setTimeout(() => {
          setChangePinModalOpen(false);
          setChangePinSuccess(false);
        }, 1200);
      } else {
        setChangePinError(res.error || 'Failed to update PIN');
      }
    });
  };

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [memberError, setMemberError] = useState('');

  // New Bill Form State
  const [newBillName, setNewBillName] = useState('');
  const [newBillType, setNewBillType] = useState<'FIXED' | 'VARIABLE'>('FIXED');
  const [newBillAmount, setNewBillAmount] = useState<string>('');
  const [newBillCollected, setNewBillCollected] = useState<string>('');
  const [newBillSplitCount, setNewBillSplitCount] = useState<number>(initialMembers.length || 6);
  const [billModalOpen, setBillModalOpen] = useState(false);

  // New Month Cycle State
  const [newMonthModalOpen, setNewMonthModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileCycleModalOpen, setMobileCycleModalOpen] = useState(false);
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

  const handleTabSwitch = (tab: 'dues' | 'utilities' | 'members' | 'notes') => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  // Quick calculations
  const memberCount = members.length;

  // Utility calculations
  const totalBillsAmount = currentCycle.bills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalUtilitySharePerMember = currentCycle.bills.reduce(
    (acc, b) => acc + b.collectedPerPerson,
    0
  );
  // Total utility collected across all bills including extra meal guests:
  const totalUtilityCollected = currentCycle.bills.reduce((acc, b) => {
    const people = b.splitCount && b.splitCount > 0 ? b.splitCount : memberCount;
    return acc + b.collectedPerPerson * people;
  }, 0);
  const netUtilityAdjustment = totalUtilityCollected - totalBillsAmount; // Positive = Surplus, Negative = Deficit

  // Guest calculations (for meal guests sharing gas bill)
  const totalGuestContributions = currentCycle.bills.reduce((acc, b) => {
    const people = b.splitCount && b.splitCount > 0 ? b.splitCount : memberCount;
    if (people > memberCount) {
      return acc + (people - memberCount) * b.collectedPerPerson;
    }
    return acc;
  }, 0);

  // Members dues calculations (for room residents)
  const totalRoomRent = currentCycle.memberBillings.reduce((acc, mb) => acc + mb.roomRent, 0);
  const totalRoommatesUtility = totalUtilitySharePerMember * memberCount;
  const totalExpectedAmount = totalRoomRent + totalRoommatesUtility;
  const totalPaidAmount = currentCycle.memberBillings.reduce((acc, mb) => acc + mb.paidAmount, 0);
  const totalDuesPending = totalExpectedAmount - totalPaidAmount;

  // Mess outgoing expenses & payouts (Landlord House Rent + Utility bills paid to providers)
  const totalMessExpenses = totalRoomRent + totalBillsAmount;
  const paidBillsAmount = currentCycle.bills
    .filter((b) => b.isPaid)
    .reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaidOutExpenses =
    (currentCycle.houseRentPaid ? totalRoomRent : 0) + paidBillsAmount;
  const totalRemainingExpensesToPay = Math.max(0, totalMessExpenses - totalPaidOutExpenses);
  const totalPaidBillsCount = currentCycle.bills.filter((b) => b.isPaid).length;

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      setMemberError('Please enter both name and phone number');
      return;
    }
    setMemberError('');

    startTransition(async () => {
      try {
        const created = await addMember(newMemberName, newMemberPhone);
        setMembers((prev) => [...prev, created]);
        setNewMemberName('');
        setNewMemberPhone('');
        // Reload to sync cycle
        window.location.reload();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMemberError(err.message);
        } else {
          setMemberError('Failed to add member');
        }
      }
    });
  };

  // Handle Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    startTransition(async () => {
      try {
        await deleteMember(id);
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setCurrentCycle((prev) => ({
          ...prev,
          memberBillings: prev.memberBillings.filter((mb) => mb.memberId !== id),
        }));
      } catch (err) {
        alert('Failed to delete member');
      }
    });
  };

  // Handle Split Count Change in Add Bill Modal
  const handleSplitCountChange = (count: number) => {
    const safeCount = Math.max(1, count);
    setNewBillSplitCount(safeCount);
    if (newBillAmount) {
      const amt = parseFloat(newBillAmount);
      if (!isNaN(amt)) {
        const split = amt / safeCount;
        setNewBillCollected((Math.ceil(split / 5) * 5).toString());
      }
    }
  };

  // Handle Bill Amount Change (auto suggest collected amount)
  const handleBillAmountChange = (val: string, customPeople?: number) => {
    setNewBillAmount(val);
    const amount = parseFloat(val);
    const people = customPeople ?? (newBillSplitCount > 0 ? newBillSplitCount : memberCount);
    if (!isNaN(amount) && people > 0) {
      const split = amount / people;
      // Default to rounded to nearest 5
      const rounded = Math.ceil(split / 5) * 5;
      setNewBillCollected(rounded.toString());
    } else {
      setNewBillCollected('');
    }
  };

  // Handle Add Utility Bill
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBillAmount);
    const collected = parseFloat(newBillCollected);
    const splitCount = newBillSplitCount > 0 ? newBillSplitCount : memberCount;

    if (!newBillName.trim() || isNaN(amount) || isNaN(collected)) {
      alert('Please fill in all bill details correctly.');
      return;
    }

    startTransition(async () => {
      try {
        const bill = await addUtilityBill(currentCycle.id, {
          name: newBillName,
          billType: newBillType,
          totalAmount: amount,
          collectedPerPerson: collected,
          splitCount: splitCount,
        });
        setCurrentCycle((prev) => ({
          ...prev,
          bills: [...prev.bills, bill],
        }));
        setNewBillName('');
        setNewBillAmount('');
        setNewBillCollected('');
        setNewBillSplitCount(memberCount || 6);
        setBillModalOpen(false);
      } catch (err) {
        alert('Failed to add utility bill');
      }
    });
  };

  // Handle Delete Bill
  const handleDeleteBill = async (id: string, name: string) => {
    if (!confirm(`Delete bill "${name}"?`)) return;

    startTransition(async () => {
      try {
        await deleteUtilityBill(id);
        setCurrentCycle((prev) => ({
          ...prev,
          bills: prev.bills.filter((b) => b.id !== id),
        }));
      } catch (err) {
        alert('Failed to delete bill');
      }
    });
  };

  // Update Collected Per Person on the fly
  const handleUpdateCollectedAmount = async (billId: string, newCollectedVal: number) => {
    const bill = currentCycle.bills.find((b) => b.id === billId);
    if (!bill) return;

    setCurrentCycle((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === billId ? { ...b, collectedPerPerson: newCollectedVal } : b
      ),
    }));

    startTransition(async () => {
      await updateUtilityBill(billId, {
        name: bill.name,
        billType: bill.billType as 'FIXED' | 'VARIABLE',
        totalAmount: bill.totalAmount,
        collectedPerPerson: newCollectedVal,
        splitCount: bill.splitCount ?? 0,
      });
    });
  };

  // Update Split Count (number of people sharing bill) on the fly
  const handleUpdateBillSplitCount = async (billId: string, newSplitCount: number) => {
    if (newSplitCount < 1) return;
    const bill = currentCycle.bills.find((b) => b.id === billId);
    if (!bill) return;

    // Recalculate suggested rounded collected amount if changing split
    const currentSplitPeople =
      bill.splitCount && bill.splitCount > 0 ? bill.splitCount : memberCount;
    let newCollected = bill.collectedPerPerson;

    if (newSplitCount !== currentSplitPeople && newSplitCount > 0) {
      const newExactSplit = bill.totalAmount / newSplitCount;
      newCollected = Math.ceil(newExactSplit / 5) * 5;
    }

    setCurrentCycle((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === billId
          ? { ...b, splitCount: newSplitCount, collectedPerPerson: newCollected }
          : b
      ),
    }));

    startTransition(async () => {
      await updateUtilityBill(billId, {
        name: bill.name,
        billType: bill.billType as 'FIXED' | 'VARIABLE',
        totalAmount: bill.totalAmount,
        collectedPerPerson: newCollected,
        splitCount: newSplitCount,
      });
    });
  };

  // Update Member Room Rent & Paid Amount
  const handleUpdateBilling = (
    memberBillingId: string,
    field: 'roomRent' | 'paidAmount',
    value: number
  ) => {
    setCurrentCycle((prev) => ({
      ...prev,
      memberBillings: prev.memberBillings.map((mb) =>
        mb.id === memberBillingId ? { ...mb, [field]: value } : mb
      ),
    }));

    startTransition(async () => {
      const mb = currentCycle.memberBillings.find((b) => b.id === memberBillingId);
      if (!mb) return;
      await updateMemberBilling(memberBillingId, {
        roomRent: field === 'roomRent' ? value : mb.roomRent,
        paidAmount: field === 'paidAmount' ? value : mb.paidAmount,
      });
    });
  };

  // Quick mark fully paid
  const handleMarkFullyPaid = (mb: MemberBilling, totalDue: number) => {
    handleUpdateBilling(mb.id, 'paidAmount', totalDue);
  };

  // Create new Month
  const handleCreateMonth = async () => {
    startTransition(async () => {
      await createBillingCycle(selectedYear, selectedMonth);
      window.location.href = `/?year=${selectedYear}&month=${selectedMonth}`;
    });
  };

  // Important Notes Handlers (Open to all roommates - No Admin PIN required)
  const handleCopyContact = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => {
      setCopiedNoteId(null);
    }, 2000);
  };

  const handleOpenAddNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContact('');
    setNoteDetails('');
    setNoteCategory('CONTACT');
    setNoteModalOpen(true);
  };

  const handleOpenEditNote = (note: ImportantNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContact(note.contactNumber || '');
    setNoteDetails(note.details || '');
    setNoteCategory(note.category || 'CONTACT');
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    startTransition(async () => {
      try {
        if (editingNoteId) {
          const updated = await updateImportantNote(editingNoteId, {
            title: noteTitle,
            contactNumber: noteContact,
            details: noteDetails,
            category: noteCategory,
          });
          setImportantNotes((prev) =>
            prev.map((n) => (n.id === editingNoteId ? updated : n))
          );
        } else {
          const created = await addImportantNote({
            title: noteTitle,
            contactNumber: noteContact,
            details: noteDetails,
            category: noteCategory,
          });
          setImportantNotes((prev) => [created, ...prev]);
        }
        setNoteModalOpen(false);
      } catch (err) {
        alert('Failed to save note');
      }
    });
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      try {
        await deleteImportantNote(id);
        setImportantNotes((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        alert('Failed to delete note');
      }
    });
  };

  // House Rent & Utility Bill Outgoing Payments Handlers (Open to all roommates - No PIN required)
  const handleOpenHouseRentModal = () => {
    setHouseRentNoteInput(currentCycle.houseRentPaidNote || '');
    setHouseRentModalOpen(true);
  };

  const handleSaveHouseRentPayment = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const updated = await toggleHouseRentPayment(
          currentCycle.id,
          true,
          houseRentNoteInput
        );
        setCurrentCycle((prev) => ({
          ...prev,
          houseRentPaid: updated.houseRentPaid,
          houseRentPaidAt: updated.houseRentPaidAt,
          houseRentPaidNote: updated.houseRentPaidNote,
        }));
        setHouseRentModalOpen(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Failed to update house rent payment');
        }
      }
    });
  };

  const handleMarkHouseRentUnpaid = () => {
    if (!confirm('Mark house rent as unpaid/due to landlord?')) return;

    startTransition(async () => {
      try {
        const updated = await toggleHouseRentPayment(currentCycle.id, false);
        setCurrentCycle((prev) => ({
          ...prev,
          houseRentPaid: updated.houseRentPaid,
          houseRentPaidAt: updated.houseRentPaidAt,
          houseRentPaidNote: updated.houseRentPaidNote,
        }));
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Failed to update house rent payment');
        }
      }
    });
  };

  const handleToggleUtilityBill = (billId: string, newStatus: boolean) => {
    startTransition(async () => {
      try {
        const updated = await toggleUtilityBillPayment(billId, newStatus);
        setCurrentCycle((prev) => ({
          ...prev,
          bills: prev.bills.map((b) =>
            b.id === billId
              ? {
                  ...b,
                  isPaid: updated.isPaid,
                  paidAt: updated.paidAt,
                  paidNote: updated.paidNote,
                }
              : b
          ),
        }));
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Failed to update bill payment status');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 sm:pb-16">
      {/* Top Header */}
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
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-300 active:bg-slate-50 rounded-xl shadow-2xs transition-all text-left group"
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
                          onClick={() => {
                            setMonthDropdownOpen(false);
                            window.location.href = `/?year=${c.year}&month=${c.month}`;
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
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
                      onClick={() => {
                        setMonthDropdownOpen(false);
                        setNewMonthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
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
              onClick={() => setMobileCycleModalOpen(true)}
              className="sm:hidden flex items-center gap-1 px-2 py-1.5 bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shrink-0"
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
                  onClick={() => setChangePinModalOpen(true)}
                  title="Change Admin PIN"
                  className="p-1 text-emerald-700 hover:text-indigo-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer touch-manipulation"
                >
                  <KeyRound className="w-3 h-3 pointer-events-none" />
                </button>
                <button
                  type="button"
                  onClick={handleLock}
                  title="Lock Admin Mode"
                  className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] bg-white border border-emerald-300 hover:border-rose-300 text-emerald-700 hover:text-rose-600 rounded-lg transition-colors font-bold cursor-pointer touch-manipulation"
                >
                  Lock
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPinModalOpen(true)}
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
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open mobile navigation menu"
              className="sm:hidden p-1.5 text-slate-700 hover:text-slate-900 active:bg-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0 cursor-pointer touch-manipulation"
            >
              <Menu className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Mobile Top Sticky Segmented Tab Switcher (< sm) */}
        <div className="flex sm:hidden items-center justify-between border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 py-1.5 gap-1.5 select-none sticky top-[51px] z-20 shadow-xs">
          <button
            type="button"
            onClick={() => handleTabSwitch('dues')}
            className={`flex-1 min-h-[42px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              activeTab === 'dues'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Dues</span>
            {totalDuesPending > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 pointer-events-none ${activeTab === 'dues' ? 'bg-amber-300' : 'bg-rose-500'}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('utilities')}
            className={`flex-1 min-h-[42px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Bills</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('members')}
            className={`flex-1 min-h-[42px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Members</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('notes')}
            className={`flex-1 min-h-[42px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">Notes</span>
            {importantNotes.length > 0 && (
              <span className={`px-1 py-0.2 rounded-full text-[9px] font-extrabold shrink-0 pointer-events-none ${
                activeTab === 'notes' ? 'bg-indigo-900 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {importantNotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden sm:flex max-w-5xl mx-auto px-4 sm:px-6 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dues')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'dues'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Member Dues & Payments</span>
            {totalDuesPending > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold pointer-events-none">
                ৳{Math.round(totalDuesPending)} Due
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('utilities')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'utilities'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Utility Bills & Split</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold pointer-events-none ${
                netUtilityAdjustment === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : netUtilityAdjustment > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {netUtilityAdjustment === 0
                ? 'Balanced'
                : netUtilityAdjustment > 0
                ? `+৳${netUtilityAdjustment.toFixed(0)} Surplus`
                : `-৳${Math.abs(netUtilityAdjustment).toFixed(0)} Loss`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Members ({memberCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Important Notes ({importantNotes.length})</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider pointer-events-none">
              Open
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="dashboard-main-content" className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        {/* Quick Month Metrics Summary */}
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
              {currentCycle.bills.length} bills added
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

        {/* TAB 1: MEMBER DUES & PAYMENTS */}
        {activeTab === 'dues' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Member Dues & Payments</h2>
                <p className="text-xs text-slate-500">
                  Room rent + Utility share (৳{Math.round(totalUtilitySharePerMember)}) = Total Due
                </p>
              </div>
            </div>

            {currentCycle.memberBillings.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No members registered yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Add members in the Members tab to start managing dues.
                </p>
                <button
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Go to Members
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {currentCycle.memberBillings.map((mb) => {
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
                        <div className="min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{mb.member.name}</h3>
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Paid
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
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={`tel:${mb.member.phone}`}
                              className="hover:text-indigo-600 hover:underline"
                            >
                              {mb.member.phone}
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
                                  handleUpdateBilling(
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
                                  handleUpdateBilling(
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

                        {/* Balance Due & Quick Actions */}
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

                          {isAdmin && balance > 0 && (
                            <button
                              onClick={() => handleMarkFullyPaid(mb, totalDue)}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors whitespace-nowrap"
                            >
                              Mark Full
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UTILITY BILLS & BALANCING */}
        {activeTab === 'utilities' && (
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
                  <span className="text-xs font-semibold text-slate-500">
                    Paid Out:
                  </span>
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
                      width: `${totalMessExpenses > 0 ? Math.min(100, Math.round((totalPaidOutExpenses / totalMessExpenses) * 100)) : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    {totalMessExpenses > 0 ? Math.round((totalPaidOutExpenses / totalMessExpenses) * 100) : 0}% of total payouts completed
                  </span>
                  <span>
                    {currentCycle.houseRentPaid ? '1/1 Rent' : '0/1 Rent'} • {totalPaidBillsCount}/{currentCycle.bills.length} Bills Paid
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
                      onClick={handleMarkHouseRentUnpaid}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white bg-white/80 border border-slate-200 rounded-xl transition-all cursor-pointer touch-manipulation"
                    >
                      Mark as Unpaid
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenHouseRentModal}
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
                onClick={() => {
                  if (!isAdmin) {
                    setPinModalOpen(true);
                  } else {
                    setNewBillName('');
                    setNewBillAmount('');
                    setNewBillCollected('');
                    setNewBillSplitCount(memberCount || 6);
                    setBillModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
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
                  onClick={() => {
                    if (!isAdmin) {
                      setPinModalOpen(true);
                    } else {
                      setNewBillName('');
                      setNewBillAmount('');
                      setNewBillCollected('');
                      setNewBillSplitCount(memberCount || 6);
                      setBillModalOpen(true);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
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
                          Total Bill: <strong className="text-slate-800">৳{bill.totalAmount}</strong>{' '}
                          | Exact split ({effectiveSplitPeople}p):{' '}
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
                                  handleUpdateBillSplitCount(
                                    bill.id,
                                    Math.max(1, effectiveSplitPeople - 1)
                                  )
                                }
                                title="Decrease people count"
                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
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
                                  handleUpdateBillSplitCount(bill.id, effectiveSplitPeople + 1)
                                }
                                title="Increase people count (add meal guest)"
                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
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
                                  handleUpdateCollectedAmount(
                                    bill.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 px-2 py-1 text-sm font-bold text-indigo-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden text-center"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleUpdateCollectedAmount(
                                      bill.id,
                                      bill.collectedPerPerson - 5
                                    )
                                  }
                                  title="Decrease by 5"
                                  className="px-1.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateCollectedAmount(
                                      bill.id,
                                      bill.collectedPerPerson + 5
                                    )
                                  }
                                  title="Increase by 5"
                                  className="px-1.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
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
                        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center min-w-[120px]">
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
                            onClick={() => handleDeleteBill(bill.id, bill.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

                        {/* Toggle button */}
                        {bill.isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleToggleUtilityBill(bill.id, false)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
                          >
                            Mark Pending
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleUtilityBill(bill.id, true)}
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
        )}

        {/* TAB 3: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Add Member Card */}
            <div className="md:col-span-1">
              {isAdmin ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs sticky top-24">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Add New Member</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Add roommate name and phone number only.
                  </p>

                  {memberError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {memberError}
                    </div>
                  )}

                  <form onSubmit={handleAddMember} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Member Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shuvo, Nafis"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 017xxxxxxxx"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs sticky top-24 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Members Locked</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Only the mess manager can add or delete roommates. Unlock with your 4-digit PIN.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPinModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock to Manage
                  </button>
                </div>
              )}
            </div>

            {/* Members Directory */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">
                    Current Members ({members.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Split divisor: {members.length} people
                  </span>
                </div>

                {members.length === 0 ? (
                  <div className="p-10 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No members added yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {members.map((member, index) => (
                      <div
                        key={member.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a
                                href={`tel:${member.phone}`}
                                className="hover:text-indigo-600 hover:underline"
                              >
                                {member.phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMPORTANT CONTACTS & NOTES (OPEN ACCESS FOR ALL MEMBERS) */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Important Contacts & Notes</h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Open to All Roommates
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Save Maid numbers, Gas cylinder delivery, WiFi credentials, landlord, and mess notes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddNote}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer touch-manipulation shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 pointer-events-none" />
                <span className="pointer-events-none">Add Contact / Note</span>
              </button>
            </div>

            {/* Notes & Contacts Grid */}
            {importantNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">No important notes or numbers saved yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
                  Add contacts like your maid/buya, gas cylinder supplier, or WiFi support number so all roommates can access them anytime.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddNote}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  Add First Contact / Note
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {importantNotes.map((note) => {
                  return (
                    <div
                      key={note.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-slate-900 text-base leading-snug">
                            {note.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditNote(note)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit note"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id, note.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Phone Number with 1-tap Call & Copy */}
                        {note.contactNumber && (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="font-mono font-bold text-sm text-slate-800 truncate">
                                {note.contactNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyContact(note.id, note.contactNumber!)}
                                className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all flex items-center gap-1"
                                title="Copy number"
                              >
                                {copiedNoteId === note.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <a
                                href={`tel:${note.contactNumber}`}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                                title="Call now"
                              >
                                <PhoneCall className="w-3 h-3" />
                                Call
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Details / Description */}
                        {note.details && (
                          <div className="text-xs text-slate-600 bg-amber-50/40 rounded-xl p-2.5 border border-amber-100/60 leading-relaxed whitespace-pre-wrap">
                            {note.details}
                          </div>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span>Accessible to all roommates</span>
                        <span className="capitalize font-semibold text-slate-500">
                          {note.category === 'CONTACT' ? 'Phone Contact' : 'Note'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Utility Bill Modal */}
      {billModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Utility Bill</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add bill name, select Fixed or Variable, and customize collected share.
            </p>

            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Bill Name
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Quick Suggestions</span>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COMMON_BILLS_SUGGESTIONS.map((item) => {
                    const isSelected = newBillName === item.name;
                    const alreadyInCycle = currentCycle.bills.some((b) => b.name === item.name);

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setNewBillName(item.name);
                          setNewBillType(item.type);
                          setNewBillAmount(item.defaultAmount);
                          const amt = parseFloat(item.defaultAmount);
                          const people = newBillSplitCount > 0 ? newBillSplitCount : memberCount;
                          if (!isNaN(amt) && people > 0) {
                            if (people === 6 && item.defaultCollected) {
                              setNewBillCollected(item.defaultCollected);
                            } else {
                              const split = amt / people;
                              setNewBillCollected((Math.ceil(split / 5) * 5).toString());
                            }
                          }
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer touch-manipulation flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : alreadyInCycle
                            ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 active:bg-slate-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 active:bg-indigo-100'
                        }`}
                      >
                        <span className="pointer-events-none">{item.name}</span>
                        {alreadyInCycle && (
                          <span className="text-[10px] text-slate-400 font-normal pointer-events-none">(Added)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="e.g. কারেন্ট বিল, নেট বিল..."
                  value={newBillName}
                  onChange={(e) => setNewBillName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBillType('FIXED')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      newBillType === 'FIXED'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Fixed Bill (e.g. WiFi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBillType('VARIABLE')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      newBillType === 'VARIABLE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Variable Bill (e.g. Gas)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Split Among (Persons)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {newBillSplitCount > memberCount ? (
                      <span className="font-bold text-amber-700">
                        {memberCount} Roommates + {newBillSplitCount - memberCount} Meal Guest{newBillSplitCount - memberCount > 1 ? 's' : ''}
                      </span>
                    ) : newBillSplitCount === memberCount ? (
                      `All ${memberCount} Roommates`
                    ) : (
                      `${newBillSplitCount} People`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSplitCountChange(newBillSplitCount - 1)}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center transition-colors"
                    title="Decrease people count"
                  >
                    -
                  </button>

                  <div className="flex-1">
                    <input
                      type="number"
                      min={1}
                      value={newBillSplitCount}
                      onChange={(e) => handleSplitCountChange(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-center text-sm font-bold rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden bg-slate-50/50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSplitCountChange(newBillSplitCount + 1)}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center transition-colors"
                    title="Increase people count (add extra meal guest for Gas)"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Defaults to {memberCount} roommates. Increase to 7+ if extra meal guests share this bill (like Gas Bill).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Bill Amount (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1000 or 1700"
                  value={newBillAmount}
                  onChange={(e) => handleBillAmountChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-mono"
                  required
                />
                {newBillAmount && newBillSplitCount > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Exact Split ({newBillSplitCount} people):{' '}
                    <strong className="text-slate-800">
                      ৳{(parseFloat(newBillAmount) / newBillSplitCount).toFixed(2)}
                    </strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Collected Amount per Person (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 165 or 285"
                  value={newBillCollected}
                  onChange={(e) => setNewBillCollected(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-mono text-indigo-700 font-bold"
                  required
                />
                {newBillAmount && newBillCollected && newBillSplitCount > 0 && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    {(() => {
                      const splitPeople = newBillSplitCount;
                      const collPerPerson = parseFloat(newBillCollected) || 0;
                      const totalColl = collPerPerson * splitPeople;
                      const billTot = parseFloat(newBillAmount) || 0;
                      const diff = totalColl - billTot;
                      const hasGuests = splitPeople > memberCount;
                      const guestCount = splitPeople - memberCount;

                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">
                              Total to Collect ({splitPeople} people): <strong>৳{totalColl}</strong>
                            </span>
                            <span
                              className={`font-bold ${
                                diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {diff === 0
                                ? 'Exact (৳0)'
                                : diff > 0
                                ? `+৳${diff.toFixed(0)} Surplus`
                                : `-৳${Math.abs(diff).toFixed(0)} Deficit`}
                            </span>
                          </div>
                          {hasGuests && (
                            <div className="text-[11px] text-amber-800 font-semibold pt-1 border-t border-slate-200 flex items-center justify-between">
                              <span>{memberCount} Roommates: ৳{collPerPerson * memberCount}</span>
                              <span>{guestCount} Meal Guest{guestCount > 1 ? 's' : ''}: ৳{collPerPerson * guestCount}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBillModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Month Cycle Modal */}
      {newMonthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">New Billing Month</h3>
                  <p className="text-xs text-slate-500">Pick month and year to track</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewMonthModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Year Stepper Bar */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Year
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900">{selectedYear}</span>
                    {selectedYear === new Date().getFullYear() && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        Current
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 12-Month Interactive Grid */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Month
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { num: 1, short: 'Jan', full: 'January' },
                    { num: 2, short: 'Feb', full: 'February' },
                    { num: 3, short: 'Mar', full: 'March' },
                    { num: 4, short: 'Apr', full: 'April' },
                    { num: 5, short: 'May', full: 'May' },
                    { num: 6, short: 'Jun', full: 'June' },
                    { num: 7, short: 'Jul', full: 'July' },
                    { num: 8, short: 'Aug', full: 'August' },
                    { num: 9, short: 'Sep', full: 'September' },
                    { num: 10, short: 'Oct', full: 'October' },
                    { num: 11, short: 'Nov', full: 'November' },
                    { num: 12, short: 'Dec', full: 'December' },
                  ].map((m) => {
                    const isSelected = selectedMonth === m.num;
                    const exists = initialCycles.some(
                      (c) => c.year === selectedYear && c.month === m.num
                    );

                    return (
                      <button
                        key={m.num}
                        type="button"
                        onClick={() => setSelectedMonth(m.num)}
                        className={`relative py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-102'
                            : exists
                            ? 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                      >
                        <span className="text-sm">{m.short}</span>
                        <span
                          className={`text-[10px] font-medium leading-none mt-0.5 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {exists ? 'Created' : 'New'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Status Note */}
              {(() => {
                const monthName = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ][selectedMonth - 1];
                const exists = initialCycles.some(
                  (c) => c.year === selectedYear && c.month === selectedMonth
                );

                return (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      exists
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          exists ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                      />
                      <span>
                        Selected: <strong>{monthName} {selectedYear}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold">
                      {exists ? 'Will switch to existing' : 'Ready to create'}
                    </span>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewMonthModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMonth}
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Unlock Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unlock Admin</h3>
                  <p className="text-xs text-slate-500">Enter your 4-digit PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPinModalOpen(false);
                  setPinError('');
                  setPinInput('');
                }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 pt-4">
              {pinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {pinError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  placeholder="••••"
                  value={pinInput}
                  autoFocus
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest font-mono font-bold py-2.5 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-slate-50"
                  required
                />
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Default PIN is <strong className="text-slate-700">1234</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPinModalOpen(false);
                    setPinError('');
                    setPinInput('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {changePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Admin PIN</h3>
                  <p className="text-xs text-slate-500">Update your security PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePinModalOpen(false);
                  setChangePinError('');
                }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4 pt-4">
              {changePinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {changePinError}
                </div>
              )}

              {changePinSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  PIN updated successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  placeholder="e.g. 1234"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono font-bold py-2 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New PIN (minimum 4 digits)
                </label>
                <input
                  type="password"
                  placeholder="e.g. 5678"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono font-bold py-2 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setChangePinModalOpen(false);
                    setChangePinError('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Important Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingNoteId ? 'Edit Contact / Note' : 'Add Contact / Note'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Open to all roommates • No PIN required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            {!editingNoteId && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_NOTE_SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setNoteTitle(item.title);
                        setNoteCategory(item.category);
                        if (!noteContact) setNoteContact(item.placeholderNumber);
                        if (!noteDetails) setNoteDetails(item.placeholderDetails);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 active:bg-indigo-100 text-slate-700 font-semibold transition-colors cursor-pointer touch-manipulation flex items-center gap-1.5"
                    >
                      <span className="pointer-events-none">{item.icon}</span>
                      <span className="pointer-events-none">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. বুয়ার নাম্বার, WiFi Support, গ্যাস সিলিন্ডার..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 017xxxxxxxx or 096xxxxxxx"
                  value={noteContact}
                  onChange={(e) => setNoteContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Details / Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. User ID: 10425, বুয়া সকাল ৭টায় আসে, শুক্রবার বন্ধ..."
                  value={noteDetails}
                  onChange={(e) => setNoteDetails(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark House Rent as Paid Modal */}
      {houseRentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mark House Rent Paid</h3>
                  <p className="text-xs text-slate-500">Open to all roommates • No PIN required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHouseRentModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHouseRentPayment} className="space-y-4 pt-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-slate-600 mb-1">
                  <span>Cycle:</span>
                  <span className="font-bold text-slate-900">{currentCycle.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Rent to Landlord:</span>
                  <span className="text-base font-extrabold text-indigo-600">
                    ৳{Math.round(totalRoomRent)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Note / Method (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. bKash to Landlord, Cash, Bank..."
                  value={houseRentNoteInput}
                  onChange={(e) => setHouseRentNoteInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHouseRentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Navigation Drawer (☰) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
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
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 active:bg-slate-200 rounded-xl"
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
                  setMobileDrawerOpen(false);
                  setMobileCycleModalOpen(true);
                }}
                className="px-2.5 py-1 text-xs font-bold bg-white text-indigo-600 rounded-lg border border-indigo-200 shadow-2xs active:bg-indigo-50"
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
                onClick={() => handleTabSwitch('dues')}
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
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'dues' ? 'bg-indigo-800 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>
                    ৳{Math.round(totalDuesPending)} Due
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('utilities')}
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'utilities'
                    ? 'bg-indigo-800 text-white'
                    : netUtilityAdjustment >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {netUtilityAdjustment >= 0 ? `+৳${netUtilityAdjustment.toFixed(0)}` : `-৳${Math.abs(netUtilityAdjustment).toFixed(0)}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('members')}
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'members' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {memberCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('notes')}
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'notes' ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {importantNotes.length} Notes
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
                          setMobileDrawerOpen(false);
                          handleLock();
                        }}
                        className="px-2 py-0.5 bg-white border border-rose-300 text-rose-600 rounded text-xs font-bold"
                      >
                        Lock
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setChangePinModalOpen(true);
                      }}
                      className="w-full text-center py-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold"
                    >
                      Change Admin PIN
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setPinModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 active:bg-slate-200"
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
                onClick={() => setMobileDrawerOpen(false)}
                className="font-bold text-indigo-600 active:underline"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Billing Cycle Selector Modal / Bottom Sheet */}
      {mobileCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileCycleModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Billing Cycle</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileCycleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-1.5 overflow-y-auto max-h-[50vh]">
              {initialCycles.map((c) => {
                const isSelected = c.year === currentCycle.year && c.month === currentCycle.month;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setMobileCycleModalOpen(false);
                      window.location.href = `/?year=${c.year}&month=${c.month}`;
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      />
                      <span>{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileCycleModalOpen(false);
                  setNewMonthModalOpen(true);
                }}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:bg-indigo-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Month Cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
