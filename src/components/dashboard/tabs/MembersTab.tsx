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
import { Member, getAvatarColor, getInitials } from '../types';

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
          <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-2xs sticky top-24">
            <h3 className="font-extrabold text-[#2C241E] text-base mb-1">নতুন সদস্য যোগ করুন</h3>
            <p className="text-xs text-[#8C7A6B] mb-4">
              রুমমেটের নাম ও ফোন নাম্বার লিখে সেভ করুন।
            </p>

            {memberError && (
              <div className="p-3 bg-[#FDF2EC] border border-[#F7D5C9] text-[#B33A3A] rounded-xl text-xs mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {memberError}
              </div>
            )}

            <form onSubmit={onAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
                  সদস্যের নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: তানভীর, রাফসান, শুভ"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-[#FAF7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">
                  ফোন নাম্বার
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 017xxxxxxxx"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#DDD3C2] focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-[#FAF7F2] font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl font-bold text-sm shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                সদস্য যুক্ত করুন
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFC8] shadow-2xs sticky top-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-3 text-[#C25E3E]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#2C241E] text-base mb-1">সদস্য তালিকা লক করা</h3>
            <p className="text-xs text-[#8C7A6B] mb-4 leading-relaxed">
              শুধুমাত্র মেস ম্যানেজার সদস্য যোগ বা বাদ দিতে পারবেন। ৪-সংখ্যার পিন দিয়ে আনলক করুন।
            </p>
            <button
              type="button"
              onClick={onOpenPinModal}
              className="w-full py-2.5 px-4 bg-[#C25E3E] hover:bg-[#B05133] active:bg-[#9C452B] text-white rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              ম্যানেজার আনলক
            </button>
          </div>
        )}
      </div>

      {/* Members Directory */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#F2ECE1] flex items-center justify-between">
            <h3 className="font-extrabold text-[#2C241E] text-base">
              বর্তমান রুমমেট ({members.length} জন)
            </h3>
            <span className="text-xs text-[#8C7A6B]">
              খরচ ভাগ হবে: {members.length} জনে
            </span>
          </div>

          {members.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-10 h-10 text-[#DDD3C2] mx-auto mb-2" />
              <p className="text-[#8C7A6B] text-sm">কোন সদস্য এখনো যুক্ত করা হয়নি।</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F2ECE1]">
              {members.map((member, index) => {
                const avatar = getAvatarColor(index);
                const initials = getInitials(member.name);

                return (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border shadow-2xs ${avatar.bg} ${avatar.text} ${avatar.border}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2C241E] text-sm">{member.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B] mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-[#8C7A6B]" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:text-[#C25E3E] hover:underline font-mono"
                          >
                            {member.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteMember(member.id, member.name)}
                        className="p-2 text-[#8C7A6B] hover:text-[#B33A3A] hover:bg-[#FDF2EC] rounded-xl transition-colors cursor-pointer"
                        title="সদস্য মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
