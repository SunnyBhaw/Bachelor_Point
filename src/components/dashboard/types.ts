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

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string | null;
  category: string;
  isCompleted: boolean;
  urgency: string; // 'NORMAL' | 'URGENT'
  addedBy?: string | null;
  notes?: string | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type TabType = 'dues' | 'utilities' | 'pantry' | 'members' | 'notes';

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

export const COMMON_PANTRY_PRESETS = [
  { name: 'মিনিকেট চাল', quantity: '২৫ কেজি', category: 'GROCERY', icon: '🍚' },
  { name: 'সয়াবিন তেল', quantity: '৫ লিটার', category: 'GROCERY', icon: '🛢️' },
  { name: 'পেঁয়াজ', quantity: '২ কেজি', category: 'GROCERY', icon: '🧅' },
  { name: 'আলু', quantity: '৩ কেজি', category: 'GROCERY', icon: '🥔' },
  { name: 'ডিম', quantity: '১ কেস (৩০টি)', category: 'GROCERY', icon: '🥚' },
  { name: 'মসুর ডাল', quantity: '১ কেজি', category: 'GROCERY', icon: '🍲' },
  { name: 'লবণ', quantity: '১ কেজি', category: 'GROCERY', icon: '🧂' },
  { name: 'হুইল পাউডার', quantity: '১ কেজি', category: 'ESSENTIAL', icon: '🫧' },
  { name: 'লাইফবয় সাবান', quantity: '৩ টি', category: 'ESSENTIAL', icon: '🧼' },
  { name: 'রসুন ও আদা', quantity: '৫০০ গ্রাম', category: 'SPICE', icon: '🧄' },
];
