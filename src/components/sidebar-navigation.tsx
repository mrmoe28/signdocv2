'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Home,
  FileText,
  CreditCard, 
  DollarSign,
  Users, 
  Settings,
  ChevronRight,
  Menu,
  X,
  Plus,
  Calendar
} from 'lucide-react';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChangeAction: (tab: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'invoices', label: 'All Invoices', icon: FileText, isLink: true, href: '/invoices' },
  { id: 'create-invoice', label: 'Create Invoice', icon: Plus, isLink: true, href: '/invoices/create' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, isLink: true, href: '/schedule' },
  { id: 'invoices-payments', label: 'Invoices & Payments', icon: CreditCard, active: true },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings, isLink: true, href: '/settings' },
];

export function SidebarNavigation({ activeTab, onTabChangeAction }: SidebarNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleTabClick = (tab: string) => {
    onTabChangeAction(tab);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white shadow-lg min-w-[44px] min-h-[44px]"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 h-screen overflow-y-auto transition-transform duration-300 ease-in-out z-40",
        // Mobile: Fixed positioning with slide animation
        "md:relative md:translate-x-0 md:w-64",
        // Mobile closed state
        "fixed w-64 -translate-x-full",
        // Mobile open state
        isOpen && "translate-x-0"
      )}>
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
                  <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-12 px-3 min-h-[44px]",
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
                    "w-full justify-start gap-3 h-12 px-3 min-h-[44px]",
                    isActive && "bg-green-50 text-green-700 hover:bg-green-50"
                  )}
                  onClick={() => handleTabClick(item.id)}
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
    </>
  );
} 