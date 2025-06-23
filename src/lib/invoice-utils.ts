import { Invoice, InvoiceItem } from './types';

export function calculateItemTotal(item: InvoiceItem): number {
  const subtotal = item.quantity * item.rate;
  const discountAmount = item.discount ? (subtotal * item.discount) / 100 : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = item.taxRate ? (afterDiscount * item.taxRate) / 100 : 0;
  return afterDiscount + taxAmount;
}

export function calculateInvoiceTotals(items: InvoiceItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  const discountAmount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate;
    return sum + (item.discount ? (itemSubtotal * item.discount) / 100 : 0);
  }, 0);
  
  const afterDiscount = subtotal - discountAmount;
  
  const taxAmount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate;
    const itemDiscount = item.discount ? (itemSubtotal * item.discount) / 100 : 0;
    const itemAfterDiscount = itemSubtotal - itemDiscount;
    return sum + (item.taxRate ? (itemAfterDiscount * item.taxRate) / 100 : 0);
  }, 0);
  
  const total = afterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

export function getStatusColor(status: Invoice['status']): string {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800';
    case 'Sent':
      return 'bg-blue-100 text-blue-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function isOverdue(dueDate: string, status: Invoice['status']): boolean {
  if (status === 'Paid' || status === 'Cancelled') return false;
  return new Date(dueDate) < new Date();
}

// Stripe payment utility
export async function createStripeCheckoutSession(
  invoiceId: string,
  amount: number,
  description: string
): Promise<{ sessionUrl: string } | { error: string }> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
        amount,
        description,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return { sessionUrl: data.sessionUrl };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return { error: 'Failed to create payment session' };
  }
} 