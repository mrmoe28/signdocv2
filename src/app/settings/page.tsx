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
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h1>
            <p className="text-gray-600">Manage your work schedule and appointments.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Schedule section coming soon.</p>
            </div>
          </div>
        );
      case 'estimates':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Estimates</h1>
            <p className="text-gray-600">Manage your estimates and quotes.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Estimates section coming soon.</p>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">Manage your invoice settings and preferences.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Invoice settings section coming soon.</p>
            </div>
          </div>
        );
      case 'work-orders':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Orders</h1>
            <p className="text-gray-600">Manage your work orders and job tracking.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Work Orders section coming soon.</p>
            </div>
          </div>
        );
      case 'leads':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leads</h1>
            <p className="text-gray-600">Manage your leads and prospects.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Leads section coming soon.</p>
            </div>
          </div>
        );
      case 'credit-notes':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Credit Notes</h1>
            <p className="text-gray-600">Manage your credit notes and refunds.</p>
            <div className="mt-8 text-center text-gray-500">
              <p>Credit Notes section coming soon.</p>
            </div>
          </div>
        );
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