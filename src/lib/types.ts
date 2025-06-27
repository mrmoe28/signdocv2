export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  contactPerson?: string;
  customerType: string;
  notifyByEmail: boolean;
  notifyBySmsText: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  type: 'Service' | 'Product';
  taxRate?: number;
  discount?: number;
  detailedDescription?: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  description?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Pending';
  createdAt: string;
  updatedAt: string;
  userId?: string;
  customerId?: string;
  customer?: Customer;
  // Legacy fields for backward compatibility
  invoiceNumber?: string;
  total?: number;
  dueDate?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  terms?: string;
  jobLocation?: string;
  jobName?: string;
  workOrderNumber?: string;
  purchaseOrderNumber?: string;
  invoiceType?: 'Total Due' | 'Partial' | 'Deposit';
  adjustment?: number;
  adjustmentDescription?: string;
  issueDate?: string;
}

export interface InvoiceFilters {
  status?: Invoice['status'] | 'All';
  search?: string;
  sortBy?: 'invoiceNumber' | 'customer' | 'total' | 'dueDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateInvoiceData {
  customerId: string;
  dueDate: string;
  issueDate?: string;
  items: Omit<InvoiceItem, 'id'>[];
  notes?: string;
  terms?: string;
  jobLocation?: string;
  jobName?: string;
  workOrderNumber?: string;
  purchaseOrderNumber?: string;
  invoiceType?: Invoice['invoiceType'];
  adjustment?: number;
  adjustmentDescription?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: Invoice['status'];
}

export interface Company {
  name: string;
  logo?: string;
  address: string;
  email: string;
  phone: string;
  license?: string;
  ein?: string;
} 