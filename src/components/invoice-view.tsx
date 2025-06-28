'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Send, Edit } from 'lucide-react';
import { Invoice } from '@/lib/types';

interface InvoiceViewProps {
  invoiceId: string;
}

// Company information - replace with actual company data from settings/database
const companyInfo = {
  name: 'EKO SOLAR',
  license: 'License #123456',
  ein: '12-3456789',
  address: '123 Solar Street, Atlanta, GA 30309',
  email: 'info@ekosolar.com',
  phone: '+1 (555) 123-4567'
};

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleEmailInvoice = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: invoice.customer?.email || 'customer@example.com',
          subject: `Invoice #${invoice.invoiceNumber || invoice.invoiceId} from ${companyInfo.name}`,
          message: `Dear ${invoice.customerName},\n\nPlease find attached your invoice for the amount of $${invoice.amount}.\n\nThank you for your business!\n\nBest regards,\n${companyInfo.name}`
        }),
      });

      if (response.ok) {
        alert('Invoice emailed successfully!');
        // Refresh invoice data to show updated status
        window.location.reload();
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber || invoice.invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorText = await response.text();
        console.error('PDF download failed:', errorText);
        alert(`Failed to download invoice: ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice: Unknown error');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!invoice) return <div className="p-6">Invoice not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleEmailInvoice}>
            <Send className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={() => router.push(`/invoices/edit/${invoice.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="font-semibold text-lg">{companyInfo.name}</p>
              {companyInfo.license && (
                <p className="text-sm text-gray-600">License: {companyInfo.license}</p>
              )}
              {companyInfo.ein && (
                <p className="text-sm text-gray-600">EIN # {companyInfo.ein}</p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                {companyInfo.address}
              </div>
              <p className="text-sm text-gray-600">Email: {companyInfo.email}</p>
              <p className="text-sm text-gray-600">Phone: {companyInfo.phone}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-lg font-semibold">#{invoice.invoiceNumber}</p>
              <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Sent' ? 'secondary' : 'outline'}>
                {invoice.status}
              </Badge>
            </div>
          </div>

          {/* Customer and Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customer?.email && <p>{invoice.customer.email}</p>}
                {invoice.customer?.phone && <p>{invoice.customer.phone}</p>}
                {invoice.customer?.address && <p>{invoice.customer.address}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoice Details:</h3>
              <div className="text-gray-700">
                <p><span className="font-medium">Invoice Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Due Date:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}</p>
                {invoice.purchaseOrderNumber && <p><span className="font-medium">PO Number:</span> {invoice.purchaseOrderNumber}</p>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">${(item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {invoice.taxAmount && invoice.taxAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span>Tax:</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount:</span>
                  <span>-${invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                <span>Total:</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div>
              <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
              <p className="text-sm text-gray-600">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 