'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { COMMON_NOTE_SUGGESTIONS } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNoteId: string | null;
  noteTitle: string;
  setNoteTitle: (v: string) => void;
  noteContact: string;
  setNoteContact: (v: string) => void;
  noteDetails: string;
  setNoteDetails: (v: string) => void;
  noteCategory: string;
  setNoteCategory: (v: string) => void;
  onSaveNote: (e: React.FormEvent) => void;
  isPending: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  editingNoteId,
  noteTitle,
  setNoteTitle,
  noteContact,
  setNoteContact,
  noteDetails,
  setNoteDetails,
  noteCategory,
  setNoteCategory,
  onSaveNote,
  isPending,
}: NoteModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
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

        <form onSubmit={onSaveNote} className="space-y-3.5">
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {editingNoteId ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
