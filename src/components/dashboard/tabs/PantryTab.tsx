'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  ShoppingBag,
  ListTodo,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  WifiOff,
  RefreshCw,
  Tag,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { PantryItem, Member, COMMON_PANTRY_PRESETS } from '../types';
import {
  addPantryItem,
  togglePantryItem,
  deletePantryItem,
  clearCompletedPantryItems,
} from '@/app/actions';
import {
  getCachedPantryItems,
  setCachedPantryItems,
  queueOfflineAction,
  flushOfflineQueue,
  getOfflineQueue,
} from '@/lib/offlineStore';

interface PantryTabProps {
  initialPantryItems: PantryItem[];
  members: Member[];
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PantryTab({
  initialPantryItems,
  members,
  onShowToast,
}: PantryTabProps) {
  const [items, setItems] = useState<PantryItem[]>(initialPantryItems);
  const [isPending, startTransition] = useTransition();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Form State
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<'GROCERY' | 'ESSENTIAL' | 'SPICE'>('GROCERY');
  const [isUrgent, setIsUrgent] = useState(false);
  const [addedBy, setAddedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Filter & Search State
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'URGENT' | 'COMPLETED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Initialize network status & local cache
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const queue = getOfflineQueue();
      setPendingSyncCount(queue.length);

      // If initial items from server are empty and we have local cache, load from cache
      if (initialPantryItems.length === 0) {
        const cached = getCachedPantryItems();
        if (cached && cached.length > 0) {
          setItems(cached);
        }
      } else {
        // Cache initial items
        setCachedPantryItems(initialPantryItems);
      }

      const handleOnline = async () => {
        setIsOnline(true);
        triggerSync();
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [initialPantryItems]);

  // Sync state whenever initialPantryItems change from server
  useEffect(() => {
    if (initialPantryItems.length > 0) {
      setItems(initialPantryItems);
      setCachedPantryItems(initialPantryItems);
    }
  }, [initialPantryItems]);

  // Flush offline queue when online
  const triggerSync = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      const res = await flushOfflineQueue();
      if (res.syncedCount > 0) {
        onShowToast(`অফলাইন পরিবর্তন সিঙ্ক হয়েছে (${res.syncedCount} টি)`, 'success');
      }
      setPendingSyncCount(0);
    } catch {
      // Sync retry on next network change
    } finally {
      setIsSyncing(false);
    }
  }, [onShowToast]);

  // 1-Tap Toggle Completed (Bought / To Buy)
  const handleToggle = async (item: PantryItem) => {
    const newStatus = !item.isCompleted;
    const now = new Date();

    // Optimistic UI update
    const updated = items.map((i) =>
      i.id === item.id
        ? { ...i, isCompleted: newStatus, completedAt: newStatus ? now : null }
        : i
    );
    setItems(updated);
    setCachedPantryItems(updated);

    if (navigator.onLine) {
      try {
        startTransition(async () => {
          await togglePantryItem(item.id, newStatus);
        });
      } catch (err) {
        // Fallback to queue if request fails
        queueOfflineAction({
          type: 'TOGGLE',
          payload: { id: item.id, isCompleted: newStatus },
        });
        setPendingSyncCount((prev) => prev + 1);
        onShowToast('নেটওয়ার্ক সমস্যা: অফলাইনে সংরক্ষিত', 'info');
      }
    } else {
      // Offline mode: queue action
      queueOfflineAction({
        type: 'TOGGLE',
        payload: { id: item.id, isCompleted: newStatus },
      });
      setPendingSyncCount((prev) => prev + 1);
      onShowToast('অফলাইনে সংরক্ষিত • ইন্টারনেট পেলে সিঙ্ক হবে', 'info');
    }
  };

  // Add Item
  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = itemName.trim();
    if (!trimmedName) {
      onShowToast('পণ্যের নাম লিখুন', 'error');
      return;
    }

    const tempId = 'temp_' + Date.now();
    const newItem: PantryItem = {
      id: tempId,
      name: trimmedName,
      quantity: quantity.trim() || null,
      category,
      urgency: isUrgent ? 'URGENT' : 'NORMAL',
      addedBy: addedBy.trim() || null,
      notes: notes.trim() || null,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    const updated = [newItem, ...items];
    setItems(updated);
    setCachedPantryItems(updated);

    // Reset inputs
    setItemName('');
    setQuantity('');
    setNotes('');
    setIsUrgent(false);
    setFormOpen(false);

    if (navigator.onLine) {
      try {
        startTransition(async () => {
          const created = await addPantryItem({
            name: newItem.name,
            quantity: newItem.quantity || undefined,
            category: newItem.category,
            urgency: newItem.urgency,
            addedBy: newItem.addedBy || undefined,
            notes: newItem.notes || undefined,
          });

          // Replace tempId with actual server record id
          setItems((prev) =>
            prev.map((i) => (i.id === tempId ? { ...i, id: created.id } : i))
          );
        });
        onShowToast(`"${trimmedName}" ফর্দে যোগ করা হয়েছে`, 'success');
      } catch (err) {
        queueOfflineAction({
          type: 'ADD',
          payload: newItem,
        });
        setPendingSyncCount((prev) => prev + 1);
        onShowToast('নেটওয়ার্ক ড্রপ: আইটেম অফলাইনে সংরক্ষিত', 'info');
      }
    } else {
      // Offline
      queueOfflineAction({
        type: 'ADD',
        payload: newItem,
      });
      setPendingSyncCount((prev) => prev + 1);
      onShowToast(`"${trimmedName}" অফলাইনে যোগ হয়েছে (সিঙ্ক অপেক্ষমাণ)`, 'info');
    }
  };

  // Quick Preset 1-Tap Add
  const handleAddPreset = async (preset: {
    name: string;
    quantity: string;
    category: string;
  }) => {
    const tempId = 'temp_' + Date.now();
    const newItem: PantryItem = {
      id: tempId,
      name: preset.name,
      quantity: preset.quantity,
      category: preset.category,
      urgency: 'NORMAL',
      addedBy: addedBy || null,
      notes: null,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    setCachedPantryItems(updated);

    if (navigator.onLine) {
      try {
        startTransition(async () => {
          const created = await addPantryItem({
            name: preset.name,
            quantity: preset.quantity,
            category: preset.category,
            urgency: 'NORMAL',
            addedBy: addedBy || undefined,
          });
          setItems((prev) =>
            prev.map((i) => (i.id === tempId ? { ...i, id: created.id } : i))
          );
        });
        onShowToast(`"${preset.name}" ফর্দে যোগ করা হয়েছে`, 'success');
      } catch {
        queueOfflineAction({ type: 'ADD', payload: newItem });
        setPendingSyncCount((prev) => prev + 1);
        onShowToast('অফলাইনে সংরক্ষিত', 'info');
      }
    } else {
      queueOfflineAction({ type: 'ADD', payload: newItem });
      setPendingSyncCount((prev) => prev + 1);
      onShowToast(`"${preset.name}" অফলাইনে যোগ হয়েছে`, 'info');
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`"${name}" ফর্দ থেকে মুছে ফেলতে চান?`)) return;

    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    setCachedPantryItems(updated);

    if (navigator.onLine && !id.startsWith('temp_')) {
      try {
        startTransition(async () => {
          await deletePantryItem(id);
        });
        onShowToast(`"${name}" মুছে ফেলা হয়েছে`, 'info');
      } catch {
        queueOfflineAction({ type: 'DELETE', payload: { id } });
        setPendingSyncCount((prev) => prev + 1);
      }
    } else if (!id.startsWith('temp_')) {
      queueOfflineAction({ type: 'DELETE', payload: { id } });
      setPendingSyncCount((prev) => prev + 1);
      onShowToast('মুছে ফেলার অনুরোধ অফলাইনে জমা রাখা হয়েছে', 'info');
    }
  };

  // Clear All Completed Items
  const handleClearCompleted = async () => {
    const completedCount = items.filter((i) => i.isCompleted).length;
    if (completedCount === 0) return;

    if (!confirm(`কেনা শেষ হওয়া ${completedCount} টি পণ্য তালিকা থেকে মুছে ফেলবেন?`)) {
      return;
    }

    const updated = items.filter((i) => !i.isCompleted);
    setItems(updated);
    setCachedPantryItems(updated);

    if (navigator.onLine) {
      try {
        startTransition(async () => {
          await clearCompletedPantryItems();
        });
        onShowToast('কেনা পণ্যগুলো মুছে ফেলা হয়েছে', 'success');
      } catch {
        queueOfflineAction({ type: 'CLEAR_COMPLETED', payload: {} });
        setPendingSyncCount((prev) => prev + 1);
      }
    } else {
      queueOfflineAction({ type: 'CLEAR_COMPLETED', payload: {} });
      setPendingSyncCount((prev) => prev + 1);
      onShowToast('অফলাইনে সাফ করা হয়েছে (সিঙ্ক অপেক্ষমাণ)', 'info');
    }
  };

  // Summary Counts
  const totalCount = items.length;
  const pendingItems = items.filter((i) => !i.isCompleted);
  const completedItems = items.filter((i) => i.isCompleted);
  const urgentItems = items.filter((i) => !i.isCompleted && i.urgency === 'URGENT');

  // Filtered List
  const filteredItems = items.filter((item) => {
    if (filter === 'PENDING' && item.isCompleted) return false;
    if (filter === 'COMPLETED' && !item.isCompleted) return false;
    if (filter === 'URGENT' && (item.isCompleted || item.urgency !== 'URGENT')) return false;

    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              Shared Mess To-Do & Grocery Checklist
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Open to All Roommates
            </span>
            {!isOnline && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline Mode
              </span>
            )}
            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={triggerSync}
                disabled={isSyncing}
                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {pendingSyncCount} changes to sync
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            মেসের কাজ ও বাজারের ফর্দ। বাজারে বা বাইরে নেটওয়ার্ক না থাকলেও সহজে টিক দিন বা নতুন কাজ যোগ করুন—স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {completedItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearCompleted}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Completed ({completedItems.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 pointer-events-none" />
            <span>Add Task / Item</span>
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Tasks / Items (মোট)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div
          onClick={() => setFilter('PENDING')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'PENDING'
              ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            To Do / To Buy (বাকি কাজ)
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {pendingItems.length}
          </div>
        </div>

        <div
          onClick={() => setFilter('URGENT')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'URGENT'
              ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Urgent (জরুরী)
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {urgentItems.length}
          </div>
        </div>

        <div
          onClick={() => setFilter('COMPLETED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'COMPLETED'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" />
            Completed (সম্পন্ন)
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {completedItems.length}
          </div>
        </div>
      </div>

      {/* Quick Add Presets Bar (1-Tap addition for common Bengali mess staples) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Add Common Mess Items (দ্রুত ফর্দে যোগ করুন)
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            1-tap to add
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {COMMON_PANTRY_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 touch-manipulation"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {preset.quantity}
              </span>
              <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Add Custom Item Form */}
      {formOpen && (
        <form
          onSubmit={handleAddItem}
          className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Task or Item to List (তালিকায় নতুন কাজ বা পণ্য যোগ করুন)
            </h4>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Item Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Task / Item Name (কাজের নাম বা পণ্য) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. মিনিকেট চাল ২৫ কেজি, ডিম, বুয়াকে জানানো, গ্যাস চেক করা"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
                autoFocus
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity (পরিমাণ)
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. ৫ কেজি, ২ লিটার, ১ ডজন"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category (ক্যাটাগরি)
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'GROCERY' | 'ESSENTIAL' | 'SPICE')
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="GROCERY">খাবার / বাজার (Grocery)</option>
                <option value="ESSENTIAL">মেস সামগ্রী (Essentials / Soap)</option>
                <option value="SPICE">মসলা ও অন্যান্য (Spices / Misc)</option>
              </select>
            </div>

            {/* Added By Roommate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Added By (কে যোগ করেছেন)
              </label>
              <select
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- মেসের যে কেউ --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes (ব্র্যান্ড / বিশেষ নির্দেশনা)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. তীর বা রূপচাঁদা তেল, তাজা পেঁয়াজ"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 rounded-xs"
              />
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Mark as Urgent (জরুরী - আজকেই লাগবে)
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
            >
              Add to Checklist (তালিকায় যোগ করুন)
            </button>
          </div>
        </form>
      )}

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            To Buy ({pendingItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('URGENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'URGENT'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Urgent ({urgentItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Bought ({completedItems.length})
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="GROCERY">খাবার / বাজার</option>
            <option value="ESSENTIAL">মেস সামগ্রী</option>
            <option value="SPICE">মসলা ও অন্যান্য</option>
          </select>
        </div>
      </div>

      {/* Item Checklist Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">
            {filter === 'COMPLETED'
              ? 'No bought items yet'
              : filter === 'URGENT'
              ? 'No urgent items right now'
              : 'ফর্দ এখন খালি! কোনো পণ্য তালিকাভুক্ত নেই'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'উপরের কুইক বাটন থেকে চাল, তেল, ডিম ইত্যাদি যোগ করুন অথবা নতুন আইটেম লিখুন।'
              : 'ফিল্টার পরিবর্তন করে সব আইটেম দেখুন।'}
          </p>
          {filter === 'ALL' && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isUrgentItem = !item.isCompleted && item.urgency === 'URGENT';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-3.5 sm:p-4 transition-all flex items-center justify-between gap-3 group ${
                  item.isCompleted
                    ? 'border-slate-200 bg-slate-50/50 opacity-75'
                    : isUrgentItem
                    ? 'border-rose-300 bg-rose-50/30 shadow-2xs'
                    : 'border-slate-200 hover:border-indigo-200 shadow-2xs'
                }`}
              >
                {/* 1-Tap Checkbox & Item Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 touch-manipulation ${
                      item.isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isUrgentItem
                        ? 'border-2 border-rose-400 bg-white hover:bg-rose-50'
                        : 'border-2 border-slate-300 bg-white hover:border-indigo-500'
                    }`}
                    title={item.isCompleted ? 'Mark as to buy' : 'Mark as bought'}
                  >
                    {item.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-bold truncate ${
                          item.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Quantity Badge */}
                      {item.quantity && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                            item.isCompleted
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      )}

                      {/* Urgent Badge */}
                      {isUrgentItem && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          জরুরী
                        </span>
                      )}

                      {/* Completed Badge */}
                      {item.isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          কেনা শেষ
                        </span>
                      )}
                    </div>

                    {/* Metadata: Notes & Added By */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                      {item.category && (
                        <span>
                          {item.category === 'GROCERY'
                            ? 'খাবার'
                            : item.category === 'ESSENTIAL'
                            ? 'মেস সামগ্রী'
                            : 'মসলা'}
                        </span>
                      )}

                      {item.addedBy && (
                        <span>
                          যোগ করেছেন: <strong className="text-slate-600">{item.addedBy}</strong>
                        </span>
                      )}

                      {item.notes && (
                        <span className="italic text-slate-500">
                          &quot;{item.notes}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions: Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
