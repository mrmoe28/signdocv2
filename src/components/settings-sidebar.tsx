'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Settings,
  CreditCard,
  Mail,
  MailOpen,
  Bell,
  FolderOpen,
  Calculator,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Package,
  UserCheck,
  StickyNote,
  Building,
  ChevronLeft
} from 'lucide-react';

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
}

const settingsItems = [
  { id: 'settings', label: 'Settings', icon: Settings, isHeader: true },
  { id: 'online-payments', label: 'Online Payments', icon: CreditCard },
  { id: 'email-sms-templates', label: 'Email/SMS Templates', icon: Mail },
  { id: 'email-settings', label: 'Email Settings', icon: MailOpen },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'files-vault', label: 'Files Vault', icon: FolderOpen },
  { id: 'tax-rates', label: 'Tax Rates', icon: Calculator },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'estimates', label: 'Estimates', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: ClipboardList },
  { id: 'work-orders', label: 'Work Orders', icon: Package },
  { id: 'leads', label: 'Leads', icon: UserCheck },
  { id: 'credit-notes', label: 'Credit Notes', icon: StickyNote },
  { id: 'my-business', label: 'My Business', icon: Building },
];

export function SettingsSidebar({ activeTab, onTabChange, onBack }: SettingsSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <nav className="space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3 text-sm",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50",
                  item.isHeader && "font-semibold text-gray-900"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 