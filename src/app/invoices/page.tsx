'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, DollarSign, Calendar, Eye, Edit, Trash2, Download, Mail } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Invoice {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/invoices');
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        setError('Failed to load invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details
      const response = await fetch(`/api/invoices/${invoice.id}`);
      if (response.ok) {
        const fullInvoice = await response.json();
        setViewingInvoice(fullInvoice);
        setShowViewDialog(true);
      } else {
        alert('Failed to load invoice details');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Failed to load invoice details');
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    // Navigate to edit page (you can implement this route)
    window.location.href = `/invoices/edit/${invoice.id}`;
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloadLoading(invoice.id);
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceId || invoice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Failed to download PDF: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.customer?.email && !invoice.customerName) {
      alert('No customer email available for this invoice');
      return;
    }

    const confirmed = confirm(`Send invoice ${invoice.invoiceId || invoice.id} to ${invoice.customer?.email || invoice.customerName}?`);
    if (!confirmed) return;

    try {
      setEmailLoading(invoice.id);
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: invoice.customer?.email || `${invoice.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          subject: `Invoice ${invoice.invoiceId || invoice.id} from EKO SOLAR`,
          message: `Dear ${invoice.customerName},\n\nPlease find your invoice attached.\n\nAmount: $${invoice.amount}\nStatus: ${invoice.status}\n\nThank you for your business!\n\nBest regards,\nEKO SOLAR Team`
        })
      });

      if (response.ok) {
        alert('Invoice email sent successfully!');
        // Update invoice status to 'Sent' if it was 'Draft'
        if (invoice.status === 'Draft') {
          setInvoices(prev => prev.map(inv => 
            inv.id === invoice.id ? { ...inv, status: 'Sent' } : inv
          ));
        }
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setEmailLoading(null);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    const confirmed = confirm(`Are you sure you want to delete invoice ${invoice.invoiceId || invoice.id}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoice.id));
        alert('Invoice deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete invoice: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Paid': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customer?.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
  const pendingAmount = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link href="/invoices/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices by number, customer, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No invoices match your search criteria.' : 'Get started by creating your first invoice.'}
              </p>
              {!searchTerm && (
                <Link href="/invoices/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Invoice
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customerName || 'Unknown Customer'}</div>
                          {invoice.customer?.company && (
                            <div className="text-sm text-gray-600">{invoice.customer.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount || 0)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status || 'Draft')}</TableCell>
                      <TableCell>{invoice.createdAt ? formatDate(invoice.createdAt) : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={downloadLoading === invoice.id}
                            title="Download PDF"
                          >
                            {downloadLoading === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendEmail(invoice)}
                            disabled={emailLoading === invoice.id}
                            title="Send Email"
                          >
                            {emailLoading === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditInvoice(invoice)}
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteInvoice(invoice)}
                            title="Delete Invoice"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                    EKO
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-600">EKO SOLAR</h2>
                    <p className="text-sm text-gray-600">Professional Solar Solutions</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-gray-800">INVOICE</h3>
                  <p className="text-lg text-gray-600">#{viewingInvoice.invoiceId}</p>
                  <div className="mt-2">
                    {getStatusBadge(viewingInvoice.status)}
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Bill To:</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{viewingInvoice.customerName}</p>
                    {viewingInvoice.customer?.company && (
                      <p className="text-sm text-gray-600">{viewingInvoice.customer.company}</p>
                    )}
                    {viewingInvoice.customer?.email && (
                      <p className="text-sm text-gray-600">{viewingInvoice.customer.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Invoice Info:</h4>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(viewingInvoice.createdAt)}</p>
                    <p className="text-sm"><span className="font-medium">Amount:</span> {formatCurrency(viewingInvoice.amount)}</p>
                    {viewingInvoice.description && (
                      <p className="text-sm"><span className="font-medium">Description:</span> {viewingInvoice.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadPDF(viewingInvoice)}
                  disabled={downloadLoading === viewingInvoice.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSendEmail(viewingInvoice)}
                  disabled={emailLoading === viewingInvoice.id}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button onClick={() => handleEditInvoice(viewingInvoice)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 