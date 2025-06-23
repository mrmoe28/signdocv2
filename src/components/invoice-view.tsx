'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invoice } from '@/lib/types';
import { mockCompany } from '@/lib/mock-data';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/invoice-utils';
import { ArrowLeft, Edit, Download, Send } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
  onEdit: () => void;
  onBack: () => void;
}

export function InvoiceView({ invoice, onEdit, onBack }: InvoiceViewProps) {
  const handleStatusUpdate = async (newStatus: Invoice['status']) => {
    try {
      await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-green-600 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            Return to Invoices
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="relative">
                <div className="w-16 h-16 bg-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  EKO
                </div>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded transform rotate-12">
                  SOLAR
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-600">EKO</h1>
                <h2 className="text-2xl font-bold">SOLAR</h2>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
              <p className="text-lg text-gray-600">#{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* FROM Section */}
            <div>
              <h3 className="font-bold text-lg mb-4">FROM:</h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{mockCompany.name}</p>
                {mockCompany.license && (
                  <p className="text-sm text-gray-600">License: {mockCompany.license}</p>
                )}
                {mockCompany.ein && (
                  <p className="text-sm text-gray-600">EIN # {mockCompany.ein}</p>
                )}
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {mockCompany.address}
                </div>
                <p className="text-sm text-gray-600">Email: {mockCompany.email}</p>
                <p className="text-sm text-gray-600">Phone: {mockCompany.phone}</p>
              </div>
            </div>

            {/* TO and Invoice Info */}
            <div className="space-y-6">
              {/* TO Section */}
              <div>
                <h3 className="font-bold text-lg mb-4">TO:</h3>
                <div className="space-y-2">
                  <p className="font-semibold text-green-600">{invoice.customer.company || invoice.customer.name}</p>
                  {invoice.customer.contactPerson && invoice.customer.contactPerson !== invoice.customer.name && (
                    <p className="text-sm text-gray-600">Attn: {invoice.customer.contactPerson}</p>
                  )}
                  <p className="text-sm text-gray-600">Phone: {invoice.customer.phone}</p>
                </div>
              </div>

              {/* Job Location */}
              {invoice.jobLocation && (
                <div>
                  <h3 className="font-bold text-lg mb-2">JOB LOCATION:</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {invoice.jobLocation}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-sm text-gray-600">Date Issued:</p>
              <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date:</p>
              <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type:</p>
              <p className="font-semibold">{invoice.invoiceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance Due:</p>
              <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
            </div>
          </div>

          {/* Job Section */}
          {invoice.jobName && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">JOB:</h3>
              <p className="text-gray-700">{invoice.jobName}</p>
            </div>
          )}

          {/* Services Table */}
          <div className="mb-8">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="text-right w-20">Qty</TableHead>
                  <TableHead className="text-right w-24">Price</TableHead>
                  <TableHead className="text-right w-24">Discount</TableHead>
                  <TableHead className="text-right w-24">Tax</TableHead>
                  <TableHead className="text-right w-24">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => {
                  const subtotal = item.quantity * item.rate;
                  const discountAmount = item.discount ? (subtotal * item.discount) / 100 : 0;
                  const afterDiscount = subtotal - discountAmount;
                  const taxAmount = item.taxRate ? (afterDiscount * item.taxRate) / 100 : 0;
                  const total = afterDiscount + taxAmount;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.detailedDescription && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.detailedDescription}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">
                        {item.discount ? `${item.discount}%` : '$0.00'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.taxRate ? `${item.taxRate}%` : 'No Tax'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                <span>Grand Total ($):</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Accepted payment methods</h3>
            <p className="text-gray-700">Credit Card, Cash, Direct Deposit, Cash App, Other</p>
          </div>

          {/* Message */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Message</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Terms</h3>
              <p className="text-gray-700">{invoice.terms}</p>
            </div>
          )}

          {/* Status Actions */}
          <div className="flex justify-center gap-4 pt-8 border-t">
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
            {invoice.status === 'Draft' && (
              <Button size="sm" onClick={() => handleStatusUpdate('Sent')}>
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}
            {(invoice.status === 'Sent' || invoice.status === 'Overdue') && (
              <Button size="sm" onClick={() => handleStatusUpdate('Paid')}>
                Mark as Paid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 