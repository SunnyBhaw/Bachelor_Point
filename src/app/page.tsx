import {
  getMembers,
  getBillingCycles,
  getOrCreateCurrentCycle,
  getAdminStatus,
  getImportantNotes,
} from '@/app/actions';
import Dashboard from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : undefined;
  const month = params.month ? parseInt(params.month) : undefined;

  const [members, cycles, currentCycle, isAdmin, importantNotes] = await Promise.all([
    getMembers(),
    getBillingCycles(),
    getOrCreateCurrentCycle(year, month),
    getAdminStatus(),
    getImportantNotes(),
  ]);

  if (!currentCycle) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading Bachelor Point...
      </div>
    );
  }

  return (
    <Dashboard
      initialMembers={members}
      initialCycles={cycles}
      currentCycle={currentCycle}
      initialIsAdmin={isAdmin}
      initialImportantNotes={importantNotes}
    />
  );
}
