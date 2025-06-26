'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsSidebar } from '@/components/settings-sidebar';
import { OnlinePaymentsSettings } from '@/components/online-payments-settings';
import { EmailSmsTemplates } from '@/components/settings/email-sms-templates';
import { EmailSettings } from '@/components/settings/email-settings';
import { Notifications } from '@/components/settings/notifications';
import { FilesVault } from '@/components/settings/files-vault';
import { TaxRates } from '@/components/settings/tax-rates';
import { Customers } from '@/components/settings/customers';
import { MyBusiness } from '@/components/settings/my-business';
import { Schedule } from '@/components/settings/schedule';
import { Estimates } from '@/components/settings/estimates';
import { Invoices } from '@/components/settings/invoices';
import { WorkOrders } from '@/components/settings/work-orders';
import { Leads } from '@/components/settings/leads';
import { CreditNotes } from '@/components/settings/credit-notes';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('online-payments');
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'online-payments':
        return <OnlinePaymentsSettings />;
      case 'email-sms-templates':
        return <EmailSmsTemplates />;
      case 'email-settings':
        return <EmailSettings />;
      case 'notifications':
        return <Notifications />;
      case 'files-vault':
        return <FilesVault />;
      case 'tax-rates':
        return <TaxRates />;
      case 'customers':
        return <Customers />;
      case 'my-business':
        return <MyBusiness />;
      case 'schedule':
        return <Schedule />;
      case 'estimates':
        return <Estimates />;
      case 'invoices':
        return <Invoices />;
      case 'work-orders':
        return <WorkOrders />;
      case 'leads':
        return <Leads />;
      case 'credit-notes':
        return <CreditNotes />;
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBack}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
} 