'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const DEFAULT_PIN = '1234';

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
  const actualPin = pinSetting?.value || DEFAULT_PIN;

  if (pin.trim() === actualPin) {
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
  const actualPin = pinSetting?.value || DEFAULT_PIN;

  if (currentPin.trim() !== actualPin) {
    return { success: false, error: 'Current PIN is incorrect.' };
  }

  if (newPin.trim().length < 4) {
    return { success: false, error: 'New PIN must be at least 4 digits.' };
  }

  await prisma.setting.upsert({
    where: { key: 'admin_pin' },
    update: { value: newPin.trim() },
    create: { key: 'admin_pin', value: newPin.trim() },
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

  // Also auto-add this member to any open billing cycle
  const openCycles = await prisma.billingCycle.findMany();
  for (const cycle of openCycles) {
    await prisma.memberBilling.upsert({
      where: {
        billingCycleId_memberId: {
          billingCycleId: cycle.id,
          memberId: member.id,
        },
      },
      update: {},
      create: {
        billingCycleId: cycle.id,
        memberId: member.id,
        roomRent: 0,
        paidAmount: 0,
      },
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

  // Ensure all current members have a MemberBilling record for this cycle
  const members = await prisma.member.findMany();
  for (const member of members) {
    const existing = cycle.memberBillings.find((b) => b.memberId === member.id);
    if (!existing) {
      await prisma.memberBilling.create({
        data: {
          billingCycleId: cycle.id,
          memberId: member.id,
          roomRent: 0,
          paidAmount: 0,
        },
      });
    }
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

  const cycle = await prisma.billingCycle.create({
    data: {
      year,
      month,
      name,
    },
  });

  // Initialize all members into this cycle
  const members = await prisma.member.findMany();
  for (const m of members) {
    await prisma.memberBilling.create({
      data: {
        billingCycleId: cycle.id,
        memberId: m.id,
        roomRent: 0,
        paidAmount: 0,
      },
    });
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
