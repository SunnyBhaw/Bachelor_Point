'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  addMember,
  deleteMember,
  addUtilityBill,
  updateUtilityBill,
  deleteUtilityBill,
  updateMemberBilling,
  quickSetMemberPayment,
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

import {
  Member,
  BillingCycle,
  BillingCycleSummary,
  ImportantNote,
  TabType,
  MemberBilling,
} from './dashboard/types';

import Header from './dashboard/Header';
import SummaryCards from './dashboard/SummaryCards';
import MobileDrawer from './dashboard/MobileDrawer';
import MobileCycleModal from './dashboard/MobileCycleModal';
import Toast, { ToastMessage } from './dashboard/Toast';

import DuesTab from './dashboard/tabs/DuesTab';
import BillsTab from './dashboard/tabs/BillsTab';
import MembersTab from './dashboard/tabs/MembersTab';
import NotesTab from './dashboard/tabs/NotesTab';

import BillModal from './dashboard/modals/BillModal';
import NewMonthModal from './dashboard/modals/NewMonthModal';
import PinModal from './dashboard/modals/PinModal';
import ChangePinModal from './dashboard/modals/ChangePinModal';
import NoteModal from './dashboard/modals/NoteModal';
import HouseRentModal from './dashboard/modals/HouseRentModal';

export type { ImportantNote, BillingCycle, Member, MemberBilling };

interface DashboardProps {
  initialMembers: Member[];
  initialCycles: BillingCycleSummary[];
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Core Data State (synchronized with Server Component props)
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);
  const [currentCycle, setCurrentCycle] = useState<BillingCycle>(initialCycle);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [importantNotes, setImportantNotes] = useState<ImportantNote[]>(initialImportantNotes);
  const [activeTab, setActiveTab] = useState<TabType>('dues');

  // Synchronize local state when server props update (e.g., month navigation or router.refresh)
  useEffect(() => {
    setCurrentCycle(initialCycle);
  }, [initialCycle]);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    setImportantNotes(initialImportantNotes);
  }, [initialImportantNotes]);

  useEffect(() => {
    setIsAdmin(initialIsAdmin);
  }, [initialIsAdmin]);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modal Visibility States
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileCycleModalOpen, setMobileCycleModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [changePinModalOpen, setChangePinModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [newMonthModalOpen, setNewMonthModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [houseRentModalOpen, setHouseRentModalOpen] = useState(false);

  // Modal Inputs & Sub-States
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [memberError, setMemberError] = useState('');

  const [newBillName, setNewBillName] = useState('');
  const [newBillType, setNewBillType] = useState<'FIXED' | 'VARIABLE'>('FIXED');
  const [newBillAmount, setNewBillAmount] = useState<string>('');
  const [newBillCollected, setNewBillCollected] = useState<string>('');
  const [newBillSplitCount, setNewBillSplitCount] = useState<number>(initialMembers.length || 6);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContact, setNoteContact] = useState('');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteCategory, setNoteCategory] = useState('CONTACT');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const [houseRentNoteInput, setHouseRentNoteInput] = useState('');

  // Tab & Month Navigation
  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  const handleSelectCycle = (year: number, month: number) => {
    startTransition(() => {
      router.push(`/?year=${year}&month=${month}`, { scroll: false });
    });
  };

  // ----------------------------------------------------
  // Financial & Metric Calculations
  // ----------------------------------------------------
  const memberCount = members.length;
  const totalBillsAmount = currentCycle.bills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalUtilitySharePerMember = currentCycle.bills.reduce(
    (acc, b) => acc + b.collectedPerPerson,
    0
  );

  const totalUtilityCollected = currentCycle.bills.reduce((acc, b) => {
    const people = b.splitCount && b.splitCount > 0 ? b.splitCount : memberCount;
    return acc + b.collectedPerPerson * people;
  }, 0);
  const netUtilityAdjustment = totalUtilityCollected - totalBillsAmount;

  const totalGuestContributions = currentCycle.bills.reduce((acc, b) => {
    const people = b.splitCount && b.splitCount > 0 ? b.splitCount : memberCount;
    if (people > memberCount) {
      return acc + (people - memberCount) * b.collectedPerPerson;
    }
    return acc;
  }, 0);

  const totalRoomRent = currentCycle.memberBillings.reduce((acc, mb) => acc + mb.roomRent, 0);
  const totalRoommatesUtility = totalUtilitySharePerMember * memberCount;
  const totalExpectedAmount = totalRoomRent + totalRoommatesUtility;
  const totalPaidAmount = currentCycle.memberBillings.reduce((acc, mb) => acc + mb.paidAmount, 0);
  const totalDuesPending = totalExpectedAmount - totalPaidAmount;

  const totalMessExpenses = totalRoomRent + totalBillsAmount;
  const paidBillsAmount = currentCycle.bills
    .filter((b) => b.isPaid)
    .reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaidOutExpenses =
    (currentCycle.houseRentPaid ? totalRoomRent : 0) + paidBillsAmount;
  const totalRemainingExpensesToPay = Math.max(0, totalMessExpenses - totalPaidOutExpenses);
  const totalPaidBillsCount = currentCycle.bills.filter((b) => b.isPaid).length;

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // Security: PIN Unlock
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
        showToast('Admin Mode Unlocked 🔓', 'success');
      } else {
        setPinError(res.error || 'Incorrect PIN');
      }
    });
  };

  // Security: Lock Admin
  const handleLock = async () => {
    startTransition(async () => {
      await lockAdmin();
      setIsAdmin(false);
      showToast('Admin Mode Locked 🔒', 'info');
    });
  };

  // Security: Change PIN
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
        showToast('Admin PIN updated successfully!', 'success');
        setTimeout(() => {
          setChangePinModalOpen(false);
          setChangePinSuccess(false);
        }, 1200);
      } else {
        setChangePinError(res.error || 'Failed to update PIN');
      }
    });
  };

  // Add Member
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
        showToast(`Member "${created.name}" added successfully!`, 'success');
        router.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMemberError(err.message);
        } else {
          setMemberError('Failed to add member');
        }
      }
    });
  };

  // Delete Member
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
        showToast(`Member "${name}" deleted`, 'info');
        router.refresh();
      } catch {
        showToast('Failed to delete member', 'error');
      }
    });
  };

  // Add Utility Bill Form Handlers
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

  const handleBillAmountChange = (val: string, customPeople?: number) => {
    setNewBillAmount(val);
    const amount = parseFloat(val);
    const people = customPeople ?? (newBillSplitCount > 0 ? newBillSplitCount : memberCount);
    if (!isNaN(amount) && people > 0) {
      const split = amount / people;
      const rounded = Math.ceil(split / 5) * 5;
      setNewBillCollected(rounded.toString());
    } else {
      setNewBillCollected('');
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBillAmount);
    const collected = parseFloat(newBillCollected);
    const splitCount = newBillSplitCount > 0 ? newBillSplitCount : memberCount;

    if (!newBillName.trim() || isNaN(amount) || isNaN(collected)) {
      showToast('Please fill in all bill details correctly.', 'error');
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
        showToast(`Bill "${bill.name}" added successfully!`, 'success');
      } catch {
        showToast('Failed to add utility bill', 'error');
      }
    });
  };

  const handleDeleteBill = async (id: string, name: string) => {
    if (!confirm(`Delete bill "${name}"?`)) return;

    startTransition(async () => {
      try {
        await deleteUtilityBill(id);
        setCurrentCycle((prev) => ({
          ...prev,
          bills: prev.bills.filter((b) => b.id !== id),
        }));
        showToast(`Bill "${name}" removed`, 'info');
      } catch {
        showToast('Failed to delete bill', 'error');
      }
    });
  };

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

  const handleUpdateBillSplitCount = async (billId: string, newSplitCount: number) => {
    if (newSplitCount < 1) return;
    const bill = currentCycle.bills.find((b) => b.id === billId);
    if (!bill) return;

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

  // Quick 1-Tap Mark Fully Paid
  const handleQuickFullPay = (mb: MemberBilling, totalDue: number) => {
    setCurrentCycle((prev) => ({
      ...prev,
      memberBillings: prev.memberBillings.map((b) =>
        b.id === mb.id ? { ...b, paidAmount: totalDue } : b
      ),
    }));

    startTransition(async () => {
      try {
        await quickSetMemberPayment(mb.id, totalDue);
        showToast(`৳${Math.round(totalDue)} recorded for ${mb.member.name}! 🎉`, 'success');
      } catch {
        showToast('Failed to record payment', 'error');
      }
    });
  };

  // Quick 1-Tap Reset Payment
  const handleQuickResetPay = (mb: MemberBilling) => {
    setCurrentCycle((prev) => ({
      ...prev,
      memberBillings: prev.memberBillings.map((b) =>
        b.id === mb.id ? { ...b, paidAmount: 0 } : b
      ),
    }));

    startTransition(async () => {
      try {
        await quickSetMemberPayment(mb.id, 0);
        showToast(`Reset payment for ${mb.member.name}`, 'info');
      } catch {
        showToast('Failed to reset payment', 'error');
      }
    });
  };

  // Create new Month (Client-side router push without hard reload)
  const handleCreateMonth = async () => {
    startTransition(async () => {
      try {
        await createBillingCycle(selectedYear, selectedMonth);
        setNewMonthModalOpen(false);
        showToast('Billing cycle ready!', 'success');
        router.push(`/?year=${selectedYear}&month=${selectedMonth}`, { scroll: false });
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to create month cycle', 'error');
      }
    });
  };

  // Important Notes Handlers (Public to all roommates)
  const handleCopyContact = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    showToast('Phone number copied to clipboard! 📋', 'success');
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
      showToast('Please enter a note title', 'error');
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
          showToast('Note updated successfully!', 'success');
        } else {
          const created = await addImportantNote({
            title: noteTitle,
            contactNumber: noteContact,
            details: noteDetails,
            category: noteCategory,
          });
          setImportantNotes((prev) => [created, ...prev]);
          showToast('New note saved!', 'success');
        }
        setNoteModalOpen(false);
      } catch {
        showToast('Failed to save note', 'error');
      }
    });
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      try {
        await deleteImportantNote(id);
        setImportantNotes((prev) => prev.filter((n) => n.id !== id));
        showToast(`Note "${title}" removed`, 'info');
      } catch {
        showToast('Failed to delete note', 'error');
      }
    });
  };

  // House Rent & Utility Bill Outgoing Payments Handlers (Public to all roommates)
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
        showToast('House rent marked as paid! 🏠✅', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to update house rent', 'error');
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
        showToast('House rent marked as unpaid / pending', 'info');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to update house rent', 'error');
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
        showToast(newStatus ? 'Bill marked as paid! ✅' : 'Bill marked as pending', 'info');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to update bill payment', 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 sm:pb-16">
      {/* Top Header & Navigation */}
      <Header
        currentCycle={currentCycle}
        initialCycles={initialCycles}
        isAdmin={isAdmin}
        activeTab={activeTab}
        totalDuesPending={totalDuesPending}
        netUtilityAdjustment={netUtilityAdjustment}
        memberCount={memberCount}
        importantNotesCount={importantNotes.length}
        onTabChange={handleTabSwitch}
        onSelectCycle={handleSelectCycle}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onOpenMobileCycleModal={() => setMobileCycleModalOpen(true)}
        onOpenNewMonthModal={() => setNewMonthModalOpen(true)}
        onOpenPinModal={() => setPinModalOpen(true)}
        onOpenChangePinModal={() => setChangePinModalOpen(true)}
        onLock={handleLock}
      />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Top 4 Summary Cards */}
        <SummaryCards
          memberCount={memberCount}
          totalUtilitySharePerMember={totalUtilitySharePerMember}
          billsCount={currentCycle.bills.length}
          totalPaidAmount={totalPaidAmount}
          totalExpectedAmount={totalExpectedAmount}
          totalDuesPending={totalDuesPending}
        />

        {/* Tab 1: Member Dues & Collection */}
        {activeTab === 'dues' && (
          <DuesTab
            currentCycle={currentCycle}
            totalUtilitySharePerMember={totalUtilitySharePerMember}
            isAdmin={isAdmin}
            onUpdateBilling={handleUpdateBilling}
            onQuickFullPay={handleQuickFullPay}
            onQuickResetPay={handleQuickResetPay}
            onNavigateToMembers={() => handleTabSwitch('members')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 2: Utility Bills & Outgoing Payouts Tracker */}
        {activeTab === 'utilities' && (
          <BillsTab
            currentCycle={currentCycle}
            memberCount={memberCount}
            totalRoomRent={totalRoomRent}
            totalPaidOutExpenses={totalPaidOutExpenses}
            totalMessExpenses={totalMessExpenses}
            totalRemainingExpensesToPay={totalRemainingExpensesToPay}
            totalPaidBillsCount={totalPaidBillsCount}
            totalGuestContributions={totalGuestContributions}
            isAdmin={isAdmin}
            onOpenHouseRentModal={handleOpenHouseRentModal}
            onMarkHouseRentUnpaid={handleMarkHouseRentUnpaid}
            onOpenAddBillModal={() => setBillModalOpen(true)}
            onOpenPinModal={() => setPinModalOpen(true)}
            onUpdateBillSplitCount={handleUpdateBillSplitCount}
            onUpdateCollectedAmount={handleUpdateCollectedAmount}
            onToggleUtilityBill={handleToggleUtilityBill}
            onDeleteBill={handleDeleteBill}
          />
        )}

        {/* Tab 3: Roommates Directory */}
        {activeTab === 'members' && (
          <MembersTab
            members={members}
            isAdmin={isAdmin}
            isPending={isPending}
            newMemberName={newMemberName}
            newMemberPhone={newMemberPhone}
            memberError={memberError}
            setNewMemberName={setNewMemberName}
            setNewMemberPhone={setNewMemberPhone}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onOpenPinModal={() => setPinModalOpen(true)}
          />
        )}

        {/* Tab 4: Important Contacts & Notes */}
        {activeTab === 'notes' && (
          <NotesTab
            importantNotes={importantNotes}
            copiedNoteId={copiedNoteId}
            onOpenAddNote={handleOpenAddNote}
            onOpenEditNote={handleOpenEditNote}
            onDeleteNote={handleDeleteNote}
            onCopyContact={handleCopyContact}
          />
        )}
      </main>

      {/* Mobile Slide-Over Drawer (☰) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabSwitch}
        currentCycle={currentCycle}
        totalDuesPending={totalDuesPending}
        netUtilityAdjustment={netUtilityAdjustment}
        memberCount={memberCount}
        importantNotesCount={importantNotes.length}
        isAdmin={isAdmin}
        onOpenMobileCycleModal={() => {
          setMobileDrawerOpen(false);
          setMobileCycleModalOpen(true);
        }}
        onOpenPinModal={() => {
          setMobileDrawerOpen(false);
          setPinModalOpen(true);
        }}
        onOpenChangePinModal={() => {
          setMobileDrawerOpen(false);
          setChangePinModalOpen(true);
        }}
        onLock={() => {
          setMobileDrawerOpen(false);
          handleLock();
        }}
      />

      {/* Mobile Month Cycle Selector Bottom Sheet */}
      <MobileCycleModal
        isOpen={mobileCycleModalOpen}
        onClose={() => setMobileCycleModalOpen(false)}
        currentCycle={currentCycle}
        initialCycles={initialCycles}
        onSelectCycle={handleSelectCycle}
        onOpenNewMonthModal={() => {
          setMobileCycleModalOpen(false);
          setNewMonthModalOpen(true);
        }}
      />

      {/* Add Utility Bill Modal */}
      <BillModal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        onSubmit={handleAddBill}
        isPending={isPending}
        newBillName={newBillName}
        setNewBillName={setNewBillName}
        newBillType={newBillType}
        setNewBillType={setNewBillType}
        newBillAmount={newBillAmount}
        newBillCollected={newBillCollected}
        setNewBillCollected={setNewBillCollected}
        newBillSplitCount={newBillSplitCount}
        memberCount={memberCount}
        onAmountChange={handleBillAmountChange}
        onSplitCountChange={handleSplitCountChange}
      />

      {/* New Month Cycle Modal */}
      <NewMonthModal
        isOpen={newMonthModalOpen}
        onClose={() => setNewMonthModalOpen(false)}
        initialCycles={initialCycles}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onCreateMonth={handleCreateMonth}
        isPending={isPending}
      />

      {/* Admin Unlock Modal */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPinError('');
          setPinInput('');
        }}
        pinInput={pinInput}
        setPinInput={setPinInput}
        pinError={pinError}
        onUnlock={handleUnlock}
        isPending={isPending}
      />

      {/* Admin Change PIN Modal */}
      <ChangePinModal
        isOpen={changePinModalOpen}
        onClose={() => {
          setChangePinModalOpen(false);
          setChangePinError('');
        }}
        currentPinInput={currentPinInput}
        setCurrentPinInput={setCurrentPinInput}
        newPinInput={newPinInput}
        setNewPinInput={setNewPinInput}
        changePinError={changePinError}
        changePinSuccess={changePinSuccess}
        onChangePin={handleChangePin}
        isPending={isPending}
      />

      {/* Add / Edit Contact Note Modal */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        editingNoteId={editingNoteId}
        noteTitle={noteTitle}
        setNoteTitle={setNoteTitle}
        noteContact={noteContact}
        setNoteContact={setNoteContact}
        noteDetails={noteDetails}
        setNoteDetails={setNoteDetails}
        noteCategory={noteCategory}
        setNoteCategory={setNoteCategory}
        onSaveNote={handleSaveNote}
        isPending={isPending}
      />

      {/* House Rent Paid Modal */}
      <HouseRentModal
        isOpen={houseRentModalOpen}
        onClose={() => setHouseRentModalOpen(false)}
        cycleName={currentCycle.name}
        totalRoomRent={totalRoomRent}
        houseRentNoteInput={houseRentNoteInput}
        setHouseRentNoteInput={setHouseRentNoteInput}
        onSaveHouseRentPayment={handleSaveHouseRentPayment}
        isPending={isPending}
      />

      {/* Non-blocking Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
