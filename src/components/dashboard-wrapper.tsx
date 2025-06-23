'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Invoice } from '@/lib/types';
import { InvoiceList } from '@/components/invoice-list';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoiceView } from '@/components/invoice-view';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { DashboardContent as DashboardHome } from '@/components/dashboard-content';
import { PaymentsPage } from '@/components/payments-page';
import { CustomersPage } from '@/components/customers-page';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

function DashboardContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const searchParams = useSearchParams();

  // Check for payment status in URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const invoiceId = searchParams.get('invoice');
    
    if (paymentStatus === 'success' && invoiceId) {
      // Update invoice status to paid
      updateInvoiceStatus(invoiceId, 'Paid');
      alert(`✅ Payment successful for invoice ${invoiceId}!`);
      // Switch to invoices tab to show updated status
      setActiveTab('invoices-payments');
    } else if (paymentStatus === 'cancelled') {
      alert(`❌ Payment cancelled for invoice ${invoiceId}.`);
      setActiveTab('invoices-payments');
    }
  }, [searchParams]);

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        console.error('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setViewMode('create');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('edit');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('view');
  };

  const handleSaveInvoice = () => {
    setViewMode('list');
  };

  const handleCancel = () => {
    setSelectedInvoice(null);
    setViewMode('list');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'invoices-payments') {
      setViewMode('list');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'home' && <DashboardHome />}
        {activeTab === 'payments' && <PaymentsPage />}
        {activeTab === 'customers' && <CustomersPage />}
        
        {activeTab !== 'home' && activeTab !== 'payments' && activeTab !== 'customers' && (
          <div className="p-6">
            {viewMode === 'list' && activeTab === 'invoices-payments' && (
              <InvoiceList
                onCreateNew={handleCreateNew}
                onEditInvoice={handleEditInvoice}
                onViewInvoice={handleViewInvoice}
              />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
              <InvoiceForm
                invoice={selectedInvoice || undefined}
                onSave={handleSaveInvoice}
                onCancel={handleCancel}
              />
            )}

            {viewMode === 'view' && selectedInvoice && (
              <InvoiceView
                invoice={selectedInvoice}
                onEdit={() => handleEditInvoice(selectedInvoice)}
                onBack={handleCancel}
              />
            )}
            
            {activeTab !== 'invoices-payments' && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' & ')}
                </h2>
                <p className="text-gray-500">This section is coming soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardWrapper() {
  return <DashboardContent />;
} 