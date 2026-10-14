'use client';

import React from 'react';
import {
  BookOpen,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  PhoneCall,
} from 'lucide-react';
import { ImportantNote } from '../types';

interface NotesTabProps {
  importantNotes: ImportantNote[];
  copiedNoteId: string | null;
  onOpenAddNote: () => void;
  onOpenEditNote: (note: ImportantNote) => void;
  onDeleteNote: (id: string, title: string) => void;
  onCopyContact: (id: string, phone: string) => void;
}

export default function NotesTab({
  importantNotes,
  copiedNoteId,
  onOpenAddNote,
  onOpenEditNote,
  onDeleteNote,
  onCopyContact,
}: NotesTabProps) {
  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFC8] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#2C241E]">
              Important Contacts & Notes (জরুরী কন্টাক্ট ও নোটিশ)
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#E2EBDD] text-[#2D5A27] border border-[#CFDEC8]">
              সবার জন্য উন্মুক্ত
            </span>
          </div>
          <p className="text-xs text-[#8C7A6B] mt-1">
            বুয়ার নাম্বার, গ্যাস সিলিন্ডার ডেলিভারি, ওয়াইফাই সাপোর্ট ও বাড়িওয়ালার নাম্বার।
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddNote}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer touch-manipulation shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 pointer-events-none" />
          <span className="pointer-events-none">নতুন কন্টাক্ট / নোটিশ যোগ</span>
        </button>
      </div>

      {/* Notes & Contacts Grid */}
      {importantNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#DDD3C2] p-10 text-center">
          <BookOpen className="w-12 h-12 text-[#8C7A6B] mx-auto mb-3" />
          <h4 className="font-bold text-[#2C241E] text-base">কোন জরুরী নাম্বার এখনো সেভ করা হয়নি</h4>
          <p className="text-xs text-[#8C7A6B] mt-1 mb-4 max-w-sm mx-auto">
            বুয়া, গ্যাস সিলিন্ডার বা ওয়াইফাই হেল্পলাইন নাম্বার লিখে রাখুন যাতে মেসের সবাই যেকোনো সময় দেখতে পারে।
          </p>
          <button
            type="button"
            onClick={onOpenAddNote}
            className="px-4 py-2 bg-[#C25E3E] text-white rounded-xl text-xs font-bold hover:bg-[#B05133] transition-colors cursor-pointer"
          >
            প্রথম কন্টাক্ট যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {importantNotes.map((note) => {
            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-[#E8DFC8] p-4 shadow-2xs hover:border-[#C25E3E] transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-[#2C241E] text-base leading-snug">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenEditNote(note)}
                        className="p-1.5 text-[#8C7A6B] hover:text-[#C25E3E] hover:bg-[#FDF2EC] rounded-lg transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id, note.title)}
                        className="p-1.5 text-[#8C7A6B] hover:text-[#B33A3A] hover:bg-[#FDF2EC] rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Phone Number with 1-tap Call & Copy */}
                  {note.contactNumber && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-[#C25E3E] shrink-0" />
                        <span className="font-mono font-bold text-sm text-[#2C241E] truncate">
                          {note.contactNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onCopyContact(note.id, note.contactNumber!)}
                          className="px-2 py-1 text-[11px] font-bold text-[#7A6A5C] hover:text-[#C25E3E] hover:bg-white rounded-md border border-transparent hover:border-[#DDD3C2] transition-all flex items-center gap-1 cursor-pointer"
                          title="নাম্বার কপি করুন"
                        >
                          {copiedNoteId === note.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#2D5A27]" />
                              <span className="text-[#2D5A27] font-bold">কপি হয়েছে</span>
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
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#2D5A27] hover:bg-[#23491E] text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title="সরাসরি কল দিন"
                        >
                          <PhoneCall className="w-3 h-3" />
                          Call
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Details / Description */}
                  {note.details && (
                    <div className="text-xs text-[#7A4E2D] bg-[#FDF0D5]/50 rounded-xl p-2.5 border border-[#F2D79E]/60 leading-relaxed whitespace-pre-wrap">
                      {note.details}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="text-[10px] text-[#8C7A6B] pt-2 border-t border-[#F2ECE1] flex items-center justify-between">
                  <span>মেসের সকল রুমমেটের জন্য উন্মুক্ত</span>
                  <span className="capitalize font-semibold text-[#7A6A5C]">
                    {note.category === 'CONTACT' ? 'Phone Contact' : 'Notice'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
