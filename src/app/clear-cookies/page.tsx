'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCookiesPage() {
  const router = useRouter();

  useEffect(() => {
    const clearCookies = async () => {
      try {
        // Call logout API to clear cookies
        await fetch('/api/auth/logout', { method: 'POST' });
        
        // Clear any client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Redirect to auth page
        setTimeout(() => {
          router.push('/auth');
        }, 1000);
      } catch (error) {
        console.error('Error clearing cookies:', error);
        router.push('/auth');
      }
    };

    clearCookies();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Clearing session...
        </h1>
        <p className="text-gray-600">
          Redirecting to login page...
        </p>
      </div>
    </div>
  );
} 