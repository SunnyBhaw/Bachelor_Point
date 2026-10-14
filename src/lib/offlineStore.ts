'use client';

import { PantryItem } from '@/components/dashboard/types';

const PANTRY_CACHE_KEY = 'bp_pantry_cache_v1';
const OFFLINE_QUEUE_KEY = 'bp_offline_pantry_queue_v1';

export interface QueuedAction {
  id: string;
  type: 'TOGGLE' | 'ADD' | 'DELETE' | 'CLEAR_COMPLETED';
  payload: any;
  timestamp: number;
}

// ------------------------------------------------------------------
// Local Cache Management
// ------------------------------------------------------------------

export function getCachedPantryItems(): PantryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PANTRY_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedPantryItems(items: PantryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PANTRY_CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[OfflineStore] Failed to save cache:', err);
  }
}

// ------------------------------------------------------------------
// Offline Action Queue
// ------------------------------------------------------------------

export function getOfflineQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineQueue();
    const newAction: QueuedAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    queue.push(newAction);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OfflineStore] Failed to queue action:', err);
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.warn('[OfflineStore] Failed to clear queue:', err);
  }
}

export async function flushOfflineQueue(): Promise<{ syncedCount: number; error?: string }> {
  if (typeof window === 'undefined') return { syncedCount: 0 };
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0 };

  try {
    const { syncOfflinePantryActions } = await import('@/app/actions');
    await syncOfflinePantryActions(queue);
    clearOfflineQueue();
    return { syncedCount: queue.length };
  } catch (err: any) {
    console.error('[OfflineStore] Failed to flush queue:', err);
    return { syncedCount: 0, error: err?.message || 'Sync failed' };
  }
}
