'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface Invoice {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: PageProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    amount: 0,
    status: 'Draft',
    description: ''
  });

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/invoices/${resolvedParams.id}`);
        
        if (response.ok) {
          const invoiceData = await response.json();
          setInvoice(invoiceData);
          setFormData({
            customerName: invoiceData.customerName || '',
            amount: invoiceData.amount || 0,
            status: invoiceData.status || 'Draft',
            description: invoiceData.description || ''
          });
        } else {
          setError('Failed to load invoice');
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        setError('Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [params]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Invoice updated successfully!');
        router.push('/invoices');
      } else {
        const error = await response.json();
        alert(`Failed to update invoice: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Invoice not found'}</p>
          <Button onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-600">Invoice #{invoice.invoiceId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter invoice description or notes"
              rows={4}
            />
          </div>

          {/* Invoice Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Invoice ID:</span>
                <span className="ml-2">{invoice.invoiceId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <span className="ml-2">{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <span className="ml-2">{new Date(invoice.updatedAt).toLocaleDateString()}</span>
              </div>
              {invoice.customer && (
                <div>
                  <span className="font-medium text-gray-600">Customer Email:</span>
                  <span className="ml-2">{invoice.customer.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 