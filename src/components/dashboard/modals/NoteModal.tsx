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
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F5E5DC] text-[#C25E3E] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2C241E]">
                {editingNoteId ? 'কন্টাক্ট / নোটিশ সম্পাদনা' : 'নতুন কন্টাক্ট / নোটিশ যোগ'}
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                সকল রুমমেটের জন্য উন্মুক্ত • পিন প্রয়োজন নেই
              </p>
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

        {/* Quick Suggestions Chips */}
        {!editingNoteId && (
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5">
              প্রিসেট বাছাই করুন (Quick Presets)
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
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#DDD3C2] bg-white hover:border-[#E8C2B3] hover:bg-[#FDF2EC]/40 text-[#2C241E] font-semibold transition-colors cursor-pointer touch-manipulation flex items-center gap-1.5"
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
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              শিরোনাম / কন্টাক্ট নাম <span className="text-[#B33A3A]">*</span>
            </label>
            <input
              type="text"
              placeholder="যেমন: বুয়ার নাম্বার, ওয়াইফাই হেল্পলাইন, গ্যাস সিলিন্ডার..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              ফোন নাম্বার (ঐচ্ছিক)
            </label>
            <input
              type="tel"
              placeholder="যেমন: 017xxxxxxxx বা 096xxxxxxx"
              value={noteContact}
              onChange={(e) => setNoteContact(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden font-mono bg-white text-[#2C241E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
              বিস্তারিত / নির্দেশনা / নোট (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              placeholder="যেমন: User ID: 10425, বুয়া সকাল ৭টায় আসে, শুক্রবার ছুটি..."
              value={noteDetails}
              onChange={(e) => setNoteDetails(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] outline-hidden bg-white text-[#2C241E]"
            />
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
              className="px-5 py-2.5 text-xs font-bold bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl transition-all shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {editingNoteId ? 'আপডেট করুন' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
