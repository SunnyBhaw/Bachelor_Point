'use client';

import React from 'react';
import {
  Users,
  Phone,
  Plus,
  Lock,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Member } from '../types';
import { WhatsAppIcon, formatWhatsAppNumber } from '@/lib/whatsapp';

interface MembersTabProps {
  members: Member[];
  isAdmin: boolean;
  isPending: boolean;
  newMemberName: string;
  newMemberPhone: string;
  memberError: string;
  setNewMemberName: (v: string) => void;
  setNewMemberPhone: (v: string) => void;
  onAddMember: (e: React.FormEvent) => void;
  onDeleteMember: (id: string, name: string) => void;
  onOpenPinModal: () => void;
}

export default function MembersTab({
  members,
  isAdmin,
  isPending,
  newMemberName,
  newMemberPhone,
  memberError,
  setNewMemberName,
  setNewMemberPhone,
  onAddMember,
  onDeleteMember,
  onOpenPinModal,
}: MembersTabProps) {
  return (
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

            <form onSubmit={onAddMember} className="space-y-3">
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
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
              onClick={onOpenPinModal}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:text-indigo-600 hover:underline"
                          >
                            {member.phone}
                          </a>
                        </div>
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(member.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Chat with ${member.name} on WhatsApp`}
                          className="p-1 text-[#25D366] hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDeleteMember(member.id, member.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
  );
}
