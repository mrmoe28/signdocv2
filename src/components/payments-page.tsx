'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatCurrency, formatDate, createStripeCheckoutSession } from '@/lib/invoice-utils';
import { 
  CreditCard, 
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentDate?: string;
  paymentMethod?: string;
  stripePaymentId?: string;
}

// Mock data - replace with actual API calls
const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceId: 'inv_1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'ABC Company',
    amount: 2500.00,
    status: 'Paid',
    paymentDate: '2024-01-15',
    paymentMethod: 'card',
    stripePaymentId: 'pi_123456789'
  },
  {
    id: '2',
    invoiceId: 'inv_2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'XYZ Corp',
    amount: 1200.00,
    status: 'Pending',
  },
  {
    id: '3',
    invoiceId: 'inv_3',
    invoiceNumber: 'INV-2024-003',
    customerName: 'Tech Solutions',
    amount: 750.00,
    status: 'Failed',
    paymentDate: '2024-01-10'
  }
];

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  const variants = {
    Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    Paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    Failed: { icon: XCircle, color: 'bg-red-100 text-red-800' },
    Refunded: { icon: XCircle, color: 'bg-gray-100 text-gray-800' }
  };
  
  const { icon: Icon, color } = variants[status];
  
  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export function PaymentsPage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [loading, setLoading] = useState(false);

  const handleProcessPayment = async (payment: Payment) => {
    if (payment.status !== 'Pending') return;
    
    setLoading(true);
    try {
      const result = await createStripeCheckoutSession(
        payment.invoiceId,
        payment.amount,
        `Payment for ${payment.invoiceNumber} - ${payment.customerName}`
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
      setLoading(false);
    }
  };

  const stats = {
    totalPaid: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    successRate: Math.round((payments.filter(p => p.status === 'Paid').length / payments.length) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and process invoice payments via Stripe</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">Powered by Stripe</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </div>
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalPending)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.invoiceNumber}
                  </TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payment.status === 'Pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayment(payment)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </Button>
                      )}
                      {payment.status === 'Paid' && payment.stripePaymentId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/payments/${payment.stripePaymentId}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View in Stripe
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 