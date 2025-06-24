'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard page
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">JI</span>
          </div>
          <span className="font-bold text-2xl text-gray-900">JOB INVOICER</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Job Invoicer
        </h1>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-600 ml-3">Loading dashboard...</p>
        </div>
      </div>
    </div>
  );
}
