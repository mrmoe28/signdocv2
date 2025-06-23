import { Suspense } from 'react';
import DashboardWrapper from '@/components/dashboard-wrapper';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading dashboard...</div>}>
      <DashboardWrapper />
    </Suspense>
  );
} 