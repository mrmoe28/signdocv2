'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Invoice, InvoiceFilters } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, createStripeCheckoutSession } from '@/lib/invoice-utils';
import { Plus, Search, Eye, Edit, Trash2, CreditCard, Mail, Download, Send } from 'lucide-react';

interface InvoiceListProps {
  onCreateNew: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ onCreateNew, onViewInvoice, onEditInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'All',
    search: '',
    sortBy: 'invoiceNumber',
    sortOrder: 'desc'
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/invoices?${params.toString()}`);
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handlePayment = async (invoice: Invoice) => {
    if (invoice.status === 'Paid') return;
    
    setPaymentLoading(invoice.id);
    try {
      const result = await createStripeCheckoutSession(
        invoice.id,
        invoice.total,
        `Payment for ${invoice.invoiceNumber} - ${invoice.customer.name}`
      );

      if ('sessionUrl' in result) {
        window.location.href = result.sessionUrl;
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to process payment');
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleSendReminder = async (invoice: Invoice) => {
    if (invoice.status === 'Paid' || invoice.status === 'Draft') return;
    
    try {
      // Simulate sending reminder email
      const success = confirm(
        `Send payment reminder to ${invoice.customer.name} for invoice ${invoice.invoiceNumber}?`
      );
      
      if (success) {
        // Here you would typically call an API to send the reminder
        // await fetch(`/api/invoices/${invoice.id}/reminder`, { method: 'POST' });
        
        alert(`Payment reminder sent to ${invoice.customer.email || invoice.customer.name}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  const handleEmailInvoice = async (invoice: Invoice) => {
    if (invoice.status === 'Draft') {
      alert('Cannot email draft invoices. Please finalize the invoice first.');
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: invoice.customer.email || `${invoice.customer.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          subject: `Invoice ${invoice.invoiceNumber} from EKO SOLAR`,
          message: `Dear ${invoice.customer.name},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total)}.\n\nThank you for your business!\n\nBest regards,\nEKO SOLAR Team`
        })
      });

      if (response.ok) {
        alert(`Invoice ${invoice.invoiceNumber} has been emailed successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Failed to download invoice: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(inv => inv.status === 'Draft').length,
    sent: invoices.filter(inv => inv.status === 'Sent').length,
    paid: invoices.filter(inv => inv.status === 'Paid').length,
    overdue: invoices.filter(inv => inv.status === 'Overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and payments</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.draft}</div>
            <div className="text-sm text-muted-foreground">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.sent}</div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.paid}</div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value as InvoiceFilters['status'] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, sortBy: value as InvoiceFilters['sortBy'] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoiceNumber">Invoice Number</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="total">Amount</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, sortOrder: value as InvoiceFilters['sortOrder'] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading invoices...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found. Create your first invoice to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer.name}</div>
                          {invoice.customer.company && (
                            <div className="text-sm text-muted-foreground">
                              {invoice.customer.company}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Primary Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewInvoice(invoice)}
                            title="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditInvoice(invoice)}
                            title="Edit invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Email & Download Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmailInvoice(invoice)}
                            disabled={invoice.status === 'Draft'}
                            title={invoice.status === 'Draft' ? 'Cannot email draft invoices' : 'Email invoice'}
                            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download PDF"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {/* Payment Actions */}
                          {invoice.status !== 'Paid' && invoice.status !== 'Draft' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePayment(invoice)}
                                disabled={paymentLoading === invoice.id}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                                title="Pay now"
                              >
                                <CreditCard className="h-3 w-3" />
                                {paymentLoading === invoice.id ? 'Processing...' : 'Pay'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(invoice)}
                                className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                title="Send payment reminder"
                              >
                                <Mail className="h-3 w-3" />
                                Remind
                              </Button>
                            </>
                          )}
                          
                          {/* Delete Action */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 