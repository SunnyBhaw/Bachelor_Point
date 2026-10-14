export interface Member {
  id: string;
  name: string;
  phone: string;
}

export interface UtilityBill {
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

export interface MemberBilling {
  id: string;
  memberId: string;
  roomRent: number;
  paidAmount: number;
  member: Member;
}

export interface BillingCycleSummary {
  id: string;
  month: number;
  year: number;
  name: string;
}

export interface BillingCycle {
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

export type TabType = 'dues' | 'utilities' | 'members' | 'notes';

export const COMMON_BILLS_SUGGESTIONS = [
  { name: 'কারেন্ট বিল', type: 'VARIABLE' as const, defaultAmount: '2640', defaultCollected: '440' },
  { name: 'বুয়া খরচ', type: 'FIXED' as const, defaultAmount: '3600', defaultCollected: '600' },
  { name: 'ময়লা খরচ', type: 'FIXED' as const, defaultAmount: '150', defaultCollected: '25' },
  { name: 'নেট বিল', type: 'FIXED' as const, defaultAmount: '1050', defaultCollected: '175' },
  { name: 'গ্যাস বিল', type: 'VARIABLE' as const, defaultAmount: '1700', defaultCollected: '285' },
];

export const COMMON_NOTE_SUGGESTIONS = [
  { title: 'বুয়ার নাম্বার', category: 'CONTACT', icon: '🧹', placeholderNumber: '017xxxxxxxx', placeholderDetails: 'সকাল ৭টায় আসে, রান্নার দায়িত্ব' },
  { title: 'গ্যাস সিলিন্ডার ডেলিভারি', category: 'CONTACT', icon: '🔥', placeholderNumber: '018xxxxxxxx', placeholderDetails: 'দোকান: ভাই ভাই গ্যাস, দিতে ৩০ মিনিট সময় লাগে' },
  { title: 'ওয়াইফাই সাপোর্ট (ISP)', category: 'CONTACT', icon: '📶', placeholderNumber: '019xxxxxxxx', placeholderDetails: 'User ID: 10425, প্যাকেজ: 30 Mbps' },
  { title: 'বাড়িওয়ালা (মালিক)', category: 'CONTACT', icon: '🏠', placeholderNumber: '017xxxxxxxx', placeholderDetails: 'ভাড়া প্রতি মাসের ১-৭ তারিখের মধ্যে পরিশোধ' },
  { title: 'ইলেকট্রিশিয়ান', category: 'CONTACT', icon: '⚡', placeholderNumber: '016xxxxxxxx', placeholderDetails: 'জরুরী বিদ্যুৎ মেরামতের জন্য' },
  { title: 'প্লাম্বার (পানি/পাইপ)', category: 'CONTACT', icon: '🔧', placeholderNumber: '018xxxxxxxx', placeholderDetails: 'পানি লাইনে সমস্যা হলে' },
];

export const WARM_AVATAR_PALETTE = [
  { bg: 'bg-[#F5E5DC]', text: 'text-[#C25E3E]', border: 'border-[#E8C2B3]' }, // Terracotta
  { bg: 'bg-[#E2EBDD]', text: 'text-[#2D5A27]', border: 'border-[#C2D8BA]' }, // Forest Pine / Sage
  { bg: 'bg-[#FDF0D5]', text: 'text-[#9C6500]', border: 'border-[#F2D79E]' }, // Warm Mustard
  { bg: 'bg-[#E5EEF5]', text: 'text-[#2A6185]', border: 'border-[#BCD3E3]' }, // Slate River
  { bg: 'bg-[#EFE8F5]', text: 'text-[#683B8C]', border: 'border-[#D4C3E6]' }, // Warm Lavender
  { bg: 'bg-[#F5E8E8]', text: 'text-[#8C3B3B]', border: 'border-[#E6C3C3]' }, // Warm Clay
];

export function getAvatarColor(index: number) {
  return WARM_AVATAR_PALETTE[index % WARM_AVATAR_PALETTE.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'মে';
  if (parts.length === 1) return parts[0].substring(0, 2);
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
