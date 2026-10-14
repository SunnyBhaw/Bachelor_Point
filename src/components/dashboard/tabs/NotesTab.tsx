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
          onClick={onOpenAddNote}
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
            onClick={onOpenAddNote}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
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
                        onClick={() => onOpenEditNote(note)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id, note.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                          onClick={() => onCopyContact(note.id, note.contactNumber!)}
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
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
  );
}
