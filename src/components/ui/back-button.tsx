'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BackButton({ href = '/dashboard', children, className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`flex items-center gap-2 ${className || ''}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || 'Back to Dashboard'}
    </Button>
  );
} 