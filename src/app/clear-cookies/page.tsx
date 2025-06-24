'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCookiesPage() {
  const router = useRouter();

  useEffect(() => {
    const clearCookies = async () => {
      try {
        // Clear all cookies by setting them to expire
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error clearing cookies:', error);
        // Redirect to dashboard even if clearing fails
        router.push('/dashboard');
      }
    };

    clearCookies();
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
          Clearing Cookies
        </h1>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-600 ml-3">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
} 