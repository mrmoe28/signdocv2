'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  Home,
  CreditCard, 
  DollarSign,
  Package, 
  Users, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'invoices-payments', label: 'Invoices & Payments', icon: CreditCard, active: true },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'vendors', label: 'Item Vendors', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings, isLink: true, href: '/settings' },
];

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">JI</span>
          </div>
          <span className="font-semibold text-lg">JOB INVOICER</span>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || activeTab === item.id;
            
            if (item.isLink && item.href) {
              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 px-3",
                      isActive && "bg-green-50 text-green-700 hover:bg-green-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Button>
                </Link>
              );
            }
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3",
                  isActive && "bg-green-50 text-green-700 hover:bg-green-50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 