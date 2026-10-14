'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const DEFAULT_PIN = '1234';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

// Check if current user is admin
export async function getAdminStatus(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('bp_admin_session');
  return session?.value === 'authenticated';
}

// Verify PIN and grant admin session
export async function verifyAdminPin(pin: string) {
  const pinSetting = await prisma.setting.findUnique({
    where: { key: 'admin_pin' },
  });
  const storedVal = pinSetting?.value || DEFAULT_PIN;
  const inputTrimmed = pin.trim();
  const inputHash = hashPin(inputTrimmed);

  // Check if matches either the cryptographic hash OR legacy plaintext
  const isMatch =
    storedVal === inputHash ||
    storedVal === inputTrimmed ||
    (storedVal === DEFAULT_PIN && inputTrimmed === DEFAULT_PIN);

  if (isMatch) {
    // Automatically migrate stored plaintext PIN to hash
    if (storedVal !== inputHash) {
      await prisma.setting.upsert({
        where: { key: 'admin_pin' },
        update: { value: inputHash },
        create: { key: 'admin_pin', value: inputHash },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set('bp_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
    });
    revalidatePath('/');
    return { success: true };
  }

  return { success: false, error: 'Incorrect PIN. Try again.' };
}

// Lock admin session (switch back to view-only)
export async function lockAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('bp_admin_session');
  revalidatePath('/');
  return { success: true };
}

// Change the admin PIN
export async function changeAdminPin(currentPin: string, newPin: string) {
  const pinSetting = await prisma.setting.findUnique({
    where: { key: 'admin_pin' },
  });
  const storedVal = pinSetting?.value || DEFAULT_PIN;
  const currentTrimmed = currentPin.trim();
  const currentHash = hashPin(currentTrimmed);

  const isMatch =
    storedVal === currentHash ||
    storedVal === currentTrimmed ||
    (storedVal === DEFAULT_PIN && currentTrimmed === DEFAULT_PIN);

  if (!isMatch) {
    return { success: false, error: 'Current PIN is incorrect.' };
  }

  if (newPin.trim().length < 4) {
    return { success: false, error: 'New PIN must be at least 4 digits.' };
  }

  const newHash = hashPin(newPin.trim());
  await prisma.setting.upsert({
    where: { key: 'admin_pin' },
    update: { value: newHash },
    create: { key: 'admin_pin', value: newHash },
  });

  return { success: true };
}

async function requireAdmin() {
  const isAdmin = await getAdminStatus();
  if (!isAdmin) {
    throw new Error('Admin privileges required. Please unlock admin mode.');
  }
}

// Month names helper
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export async function getMembers() {
  return await prisma.member.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMember(name: string, phone: string) {
  await requireAdmin();
  if (!name.trim() || !phone.trim()) {
    throw new Error('Name and phone are required');
  }

  const member = await prisma.member.create({
    data: {
      name: name.trim(),
      phone: phone.trim(),
    },
  });

  // Also auto-add this member to all existing billing cycles in one batch
  const cycles = await prisma.billingCycle.findMany({ select: { id: true } });
  if (cycles.length > 0) {
    await prisma.memberBilling.createMany({
      data: cycles.map((cycle) => ({
        billingCycleId: cycle.id,
        memberId: member.id,
        roomRent: 0,
        paidAmount: 0,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath('/');
  return member;
}

export async function deleteMember(id: string) {
  await requireAdmin();
  await prisma.member.delete({
    where: { id },
  });
  revalidatePath('/');
}

export async function getBillingCycles() {
  return await prisma.billingCycle.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
}

export async function getOrCreateCurrentCycle(year?: number, month?: number) {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1; // 1-12
  const name = `${MONTH_NAMES[targetMonth - 1]} ${targetYear}`;

  let cycle = await prisma.billingCycle.findUnique({
    where: {
      year_month: {
        year: targetYear,
        month: targetMonth,
      },
    },
    include: {
      bills: true,
      memberBillings: {
        include: {
          member: true,
        },
      },
    },
  });

  if (!cycle) {
    cycle = await prisma.billingCycle.create({
      data: {
        year: targetYear,
        month: targetMonth,
        name,
      },
      include: {
        bills: true,
        memberBillings: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  // Ensure all current members have a MemberBilling record for this cycle in a single batch
  const members = await prisma.member.findMany();
  const existingMemberIds = new Set(cycle.memberBillings.map((b) => b.memberId));
  const missingMembers = members.filter((m) => !existingMemberIds.has(m.id));

  if (missingMembers.length > 0) {
    await prisma.memberBilling.createMany({
      data: missingMembers.map((m) => ({
        billingCycleId: cycle.id,
        memberId: m.id,
        roomRent: 0,
        paidAmount: 0,
      })),
      skipDuplicates: true,
    });
  }

  // Fetch updated cycle
  const updatedCycle = await prisma.billingCycle.findUnique({
    where: { id: cycle.id },
    include: {
      bills: {
        orderBy: { createdAt: 'asc' },
      },
      memberBillings: {
        include: {
          member: true,
        },
        orderBy: { member: { name: 'asc' } },
      },
    },
  });

  return updatedCycle;
}

export async function createBillingCycle(year: number, month: number) {
  await requireAdmin();
  const name = `${MONTH_NAMES[month - 1]} ${year}`;
  const existing = await prisma.billingCycle.findUnique({
    where: {
      year_month: { year, month },
    },
  });

  if (existing) {
    return existing;
  }

  // Find previous billing cycle to carry over room rents and fixed utility bills
  const previousCycle = await prisma.billingCycle.findFirst({
    where: {
      OR: [
        { year: { lt: year } },
        { year: year, month: { lt: month } },
      ],
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      memberBillings: true,
      bills: true,
    },
  });

  const cycle = await prisma.billingCycle.create({
    data: {
      year,
      month,
      name,
    },
  });

  // Initialize all members into this cycle carrying over their room rents
  const members = await prisma.member.findMany();
  if (members.length > 0) {
    const memberBillingsData = members.map((m) => {
      const prevBilling = previousCycle?.memberBillings.find((pb) => pb.memberId === m.id);
      return {
        billingCycleId: cycle.id,
        memberId: m.id,
        roomRent: prevBilling ? prevBilling.roomRent : 0,
        paidAmount: 0,
      };
    });

    await prisma.memberBilling.createMany({
      data: memberBillingsData,
      skipDuplicates: true,
    });
  }

  // Automatically carry over recurring FIXED bills (WiFi, Maid, Dust, etc.) from previous cycle
  if (previousCycle && previousCycle.bills.length > 0) {
    const fixedBills = previousCycle.bills.filter((b) => b.billType === 'FIXED');
    if (fixedBills.length > 0) {
      await prisma.utilityBill.createMany({
        data: fixedBills.map((b) => ({
          billingCycleId: cycle.id,
          name: b.name,
          billType: b.billType,
          totalAmount: b.totalAmount,
          collectedPerPerson: b.collectedPerPerson,
          splitCount: b.splitCount ?? 0,
          isPaid: false,
        })),
      });
    }
  }

  revalidatePath('/');
  return cycle;
}

export async function addUtilityBill(
  billingCycleId: string,
  data: {
    name: string;
    billType: 'FIXED' | 'VARIABLE';
    totalAmount: number;
    collectedPerPerson: number;
    splitCount?: number;
  }
) {
  await requireAdmin();
  const bill = await prisma.utilityBill.create({
    data: {
      billingCycleId,
      name: data.name.trim(),
      billType: data.billType,
      totalAmount: data.totalAmount,
      collectedPerPerson: data.collectedPerPerson,
      splitCount: data.splitCount ?? 0,
    },
  });

  revalidatePath('/');
  return bill;
}

export async function updateUtilityBill(
  billId: string,
  data: {
    name: string;
    billType: 'FIXED' | 'VARIABLE';
    totalAmount: number;
    collectedPerPerson: number;
    splitCount?: number;
  }
) {
  await requireAdmin();
  const bill = await prisma.utilityBill.update({
    where: { id: billId },
    data: {
      name: data.name.trim(),
      billType: data.billType,
      totalAmount: data.totalAmount,
      collectedPerPerson: data.collectedPerPerson,
      ...(data.splitCount !== undefined ? { splitCount: data.splitCount } : {}),
    },
  });

  revalidatePath('/');
  return bill;
}

export async function deleteUtilityBill(billId: string) {
  await requireAdmin();
  await prisma.utilityBill.delete({
    where: { id: billId },
  });
  revalidatePath('/');
}

export async function updateMemberBilling(
  memberBillingId: string,
  data: {
    roomRent: number;
    paidAmount: number;
  }
) {
  await requireAdmin();
  const billing = await prisma.memberBilling.update({
    where: { id: memberBillingId },
    data: {
      roomRent: data.roomRent,
      paidAmount: data.paidAmount,
    },
  });

  revalidatePath('/');
  return billing;
}

export async function quickSetMemberPayment(
  memberBillingId: string,
  paidAmount: number
) {
  await requireAdmin();
  const billing = await prisma.memberBilling.update({
    where: { id: memberBillingId },
    data: {
      paidAmount: Math.max(0, paidAmount),
    },
    include: {
      member: true,
    },
  });

  revalidatePath('/');
  return billing;
}

// Important Contacts & Notes (Public access for all roommates - No Admin PIN required)
export async function getImportantNotes() {
  return await prisma.importantNote.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addImportantNote(data: {
  title: string;
  contactNumber?: string;
  details?: string;
  category?: string;
}) {
  if (!data.title.trim()) {
    throw new Error('Title is required');
  }

  const note = await prisma.importantNote.create({
    data: {
      title: data.title.trim(),
      contactNumber: data.contactNumber?.trim() || null,
      details: data.details?.trim() || null,
      category: data.category?.trim() || 'CONTACT',
    },
  });

  revalidatePath('/');
  return note;
}

export async function updateImportantNote(
  id: string,
  data: {
    title: string;
    contactNumber?: string;
    details?: string;
    category?: string;
  }
) {
  if (!data.title.trim()) {
    throw new Error('Title is required');
  }

  const note = await prisma.importantNote.update({
    where: { id },
    data: {
      title: data.title.trim(),
      contactNumber: data.contactNumber?.trim() || null,
      details: data.details?.trim() || null,
      category: data.category?.trim() || 'CONTACT',
    },
  });

  revalidatePath('/');
  return note;
}

export async function deleteImportantNote(id: string) {
  await prisma.importantNote.delete({
    where: { id },
  });
  revalidatePath('/');
}

// Toggle House Rent Payment to Landlord (Open to all roommates)
export async function toggleHouseRentPayment(
  billingCycleId: string,
  houseRentPaid: boolean,
  note?: string
) {
  const cycle = await prisma.billingCycle.update({
    where: { id: billingCycleId },
    data: {
      houseRentPaid,
      houseRentPaidAt: houseRentPaid ? new Date() : null,
      houseRentPaidNote: houseRentPaid ? (note?.trim() || null) : null,
    },
  });

  revalidatePath('/');
  return cycle;
}

// Toggle Utility Bill Payment to Vendor/Provider (Open to all roommates)
export async function toggleUtilityBillPayment(
  billId: string,
  isPaid: boolean,
  note?: string
) {
  const bill = await prisma.utilityBill.update({
    where: { id: billId },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
      paidNote: isPaid ? (note?.trim() || null) : null,
    },
  });

  revalidatePath('/');
  return bill;
}

// ------------------------------------------------------------------
// Shared Mess Pantry & Grocery Checklist Actions (Open to all roommates)
// ------------------------------------------------------------------

export async function getPantryItems() {
  return prisma.pantryItem.findMany({
    orderBy: [
      { isCompleted: 'asc' },
      { urgency: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function addPantryItem(data: {
  name: string;
  quantity?: string;
  category?: string;
  urgency?: string;
  addedBy?: string;
  notes?: string;
}) {
  if (!data.name?.trim()) {
    throw new Error('Item name is required');
  }

  const item = await prisma.pantryItem.create({
    data: {
      name: data.name.trim(),
      quantity: data.quantity?.trim() || null,
      category: data.category?.trim() || 'GROCERY',
      urgency: data.urgency === 'URGENT' ? 'URGENT' : 'NORMAL',
      addedBy: data.addedBy?.trim() || null,
      notes: data.notes?.trim() || null,
      isCompleted: false,
    },
  });

  revalidatePath('/');
  return item;
}

export async function togglePantryItem(id: string, isCompleted: boolean) {
  const item = await prisma.pantryItem.update({
    where: { id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  revalidatePath('/');
  return item;
}

export async function deletePantryItem(id: string) {
  await prisma.pantryItem.delete({
    where: { id },
  });

  revalidatePath('/');
}

export async function clearCompletedPantryItems() {
  const result = await prisma.pantryItem.deleteMany({
    where: { isCompleted: true },
  });

  revalidatePath('/');
  return result.count;
}

export async function syncOfflinePantryActions(
  actions: Array<{ type: 'TOGGLE' | 'ADD' | 'DELETE' | 'CLEAR_COMPLETED'; payload: any }>
) {
  for (const action of actions) {
    try {
      if (action.type === 'TOGGLE' && action.payload?.id) {
        await prisma.pantryItem.update({
          where: { id: action.payload.id },
          data: {
            isCompleted: Boolean(action.payload.isCompleted),
            completedAt: action.payload.isCompleted ? new Date() : null,
          },
        });
      } else if (action.type === 'ADD' && action.payload?.name) {
        await prisma.pantryItem.create({
          data: {
            name: action.payload.name.trim(),
            quantity: action.payload.quantity?.trim() || null,
            category: action.payload.category || 'GROCERY',
            urgency: action.payload.urgency === 'URGENT' ? 'URGENT' : 'NORMAL',
            addedBy: action.payload.addedBy?.trim() || null,
            notes: action.payload.notes?.trim() || null,
            isCompleted: Boolean(action.payload.isCompleted),
          },
        });
      } else if (action.type === 'DELETE' && action.payload?.id) {
        await prisma.pantryItem.delete({
          where: { id: action.payload.id },
        });
      } else if (action.type === 'CLEAR_COMPLETED') {
        await prisma.pantryItem.deleteMany({
          where: { isCompleted: true },
        });
      }
    } catch (err) {
      console.warn(`[Sync] Skipped failed offline action (${action.type}):`, err);
    }
  }

  revalidatePath('/');
  return { success: true };
}
