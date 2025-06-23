'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer, Invoice, InvoiceItem } from '@/lib/types';
import { formatCurrency, calculateInvoiceTotals } from '@/lib/invoice-utils';
import { Plus, Trash2, Save, ArrowLeft, UserPlus, ChevronDown, User } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  contactPerson: string;
}

export function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(invoice?.customerId || '');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dueDate, setDueDate] = useState(invoice?.dueDate || '');
  const [issueDate, setIssueDate] = useState(invoice?.issueDate || new Date().toISOString().split('T')[0]);
  const [jobLocation, setJobLocation] = useState(invoice?.jobLocation || '');
  const [jobName, setJobName] = useState(invoice?.jobName || '');
  const [workOrderNumber, setWorkOrderNumber] = useState(invoice?.workOrderNumber || '');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(invoice?.purchaseOrderNumber || '');
  const [invoiceType, setInvoiceType] = useState(invoice?.invoiceType || 'Total Due');
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber || '');
  const [status, setStatus] = useState(invoice?.status || 'Draft');
  const [adjustment, setAdjustment] = useState(invoice?.adjustment || 0);
  const [adjustmentDescription, setAdjustmentDescription] = useState(invoice?.adjustmentDescription || 'Adjustment - Non tax');
  
  // Customer modal state
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    contactPerson: ''
  });
  const [customerFormLoading, setCustomerFormLoading] = useState(false);
  
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>(
    invoice?.items.map(item => ({ ...item, id: undefined })) || [
      { description: '', quantity: 1, rate: 0, type: 'Service', detailedDescription: '' }
    ]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Set initial customer search term if editing an invoice
    if (invoice && customers.length > 0) {
      const customer = customers.find(c => c.id === invoice.customerId);
      if (customer) {
        setCustomerSearchTerm(customer.company || customer.name);
      }
    }
  }, [invoice, customers]);

  useEffect(() => {
    // Filter customers based on search term
    if (customerSearchTerm.trim()) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearchTerm, customers]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormData.name || !customerFormData.email) {
      alert('Name and email are required');
      return;
    }

    setCustomerFormLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerFormData)
      });

      if (response.ok) {
        const newCustomer = await response.json();
        await fetchCustomers(); // Refresh the customer list
        setSelectedCustomerId(newCustomer.id); // Auto-select the new customer
        setCustomerSearchTerm(newCustomer.company || newCustomer.name); // Set search term
        setIsCustomerDialogOpen(false);
        setCustomerFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          company: '',
          contactPerson: ''
        });
        alert('Customer created successfully!');
      } else {
        throw new Error('Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer');
    } finally {
      setCustomerFormLoading(false);
    }
  };

  const totals = calculateInvoiceTotals(items.map(item => ({ ...item, id: '' })));
  const finalTotal = totals.total + adjustment;

  const addLineItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, type: 'Service', detailedDescription: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number | undefined) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateLineTotal = (item: Omit<InvoiceItem, 'id'>) => {
    const subtotal = item.quantity * item.rate;
    const discountAmount = item.discount ? (subtotal * item.discount) / 100 : 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = item.taxRate ? (afterDiscount * item.taxRate) / 100 : 0;
    return afterDiscount + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation with detailed error messages
    const errors: string[] = [];
    
    if (!selectedCustomerId) {
      errors.push('• Customer is required');
    }
    
    if (!invoiceNumber.trim()) {
      errors.push('• Invoice number is required');
    }
    
    if (!issueDate) {
      errors.push('• Issue date is required');
    }
    
    if (!dueDate) {
      errors.push('• Due date is required');
    }
    
    if (items.length === 0) {
      errors.push('• At least one invoice item is required');
    } else {
      items.forEach((item, index) => {
        if (!item.description.trim()) {
          errors.push(`• Item ${index + 1}: Description is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`• Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.rate || item.rate <= 0) {
          errors.push(`• Item ${index + 1}: Rate must be greater than 0`);
        }
      });
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    
    // Clear validation errors if all checks pass
    setValidationErrors([]);

    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        dueDate,
        issueDate,
        items,
        jobLocation,
        jobName,
        workOrderNumber,
        purchaseOrderNumber,
        invoiceType,
        adjustment,
        adjustmentDescription,
        status
      };

      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
      const method = invoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedInvoice = await response.json();
        onSave(savedInvoice);
      } else {
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearchTerm(customer.company || customer.name);
    setShowCustomerDropdown(false);
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setShowCustomerDropdown(true);
    setSelectedIndex(-1);
    
    // Clear selection if input doesn't match any customer
    if (!value.trim()) {
      setSelectedCustomerId('');
    } else {
      const exactMatch = customers.find(customer => 
        (customer.company || customer.name).toLowerCase() === value.toLowerCase()
      );
      if (exactMatch) {
        setSelectedCustomerId(exactMatch.id);
      } else {
        setSelectedCustomerId('');
      }
    }
  };

  const handleCustomerInputFocus = () => {
    setShowCustomerDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showCustomerDropdown || filteredCustomers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCustomers.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
          handleCustomerSelect(filteredCustomers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowCustomerDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Helper function to check if a field has validation errors
  const hasFieldError = (fieldName: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-green-600 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {invoice ? `Edit Invoice# ${invoice.invoiceNumber}` : 'Create Invoice'}
            </h1>
            <p className="text-muted-foreground">Edit your invoice.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Invoice'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Job Information */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm font-medium">Customer: <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={customerInputRef}
                    value={customerSearchTerm}
                    onChange={handleCustomerInputChange}
                    onFocus={handleCustomerInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder="Type customer name to search..."
                    className={`pr-8 ${hasFieldError('customer') ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div 
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      {filteredCustomers.map((customer, index) => (
                        <div
                          key={customer.id}
                          className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            index === selectedIndex ? 'bg-green-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{customer.company || customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                              {customer.company && customer.name !== customer.company && (
                                <p className="text-xs text-gray-400">Contact: {customer.name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showCustomerDropdown && customerSearchTerm.trim() && filteredCustomers.length === 0 && (
                    <div 
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                    >
                      <div className="px-3 py-4 text-center text-gray-500">
                        <p className="text-sm">No customers found</p>
                        <p className="text-xs">Try a different search term</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </Button>
                {selectedCustomer && (
                  <Button variant="link" size="sm" className="text-green-600 px-2">
                    view
                  </Button>
                )}
              </div>
            </div>

            {/* Job Location */}
            <div className="space-y-2">
              <Label htmlFor="jobLocation" className="text-sm font-medium">Job Location:</Label>
              <Input
                id="jobLocation"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="Enter job location"
              />
            </div>

            {/* Job Name */}
            <div className="space-y-2">
              <Label htmlFor="jobName" className="text-sm font-medium">Job Name <span className="text-gray-400">(optional)</span>:</Label>
              <Input
                id="jobName"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Enter job name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First Row */}
              <div className="space-y-2">
                <Label htmlFor="invoiceType" className="text-sm font-medium">Invoice Type *</Label>
                <Select value={invoiceType} onValueChange={(value: 'Total Due' | 'Partial' | 'Deposit') => setInvoiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Total Due">Total Due</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workOrder" className="text-sm font-medium">Work Order# <span className="text-gray-400">(optional)</span></Label>
                <Input
                  id="workOrder"
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
                  placeholder="Enter work order number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseOrder" className="text-sm font-medium">Purchase Order# <span className="text-gray-400">(optional)</span></Label>
                <Input
                  id="purchaseOrder"
                  value={purchaseOrderNumber}
                  onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                  placeholder="Enter purchase order number"
                />
              </div>

              {/* Second Row */}
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-sm font-medium">Invoice# *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Invoice number"
                  className={hasFieldError('invoice number') ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-sm font-medium">Date Issued *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={hasFieldError('issue date') ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={hasFieldError('due date') ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
              </div>

              {/* Third Row */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={status} onValueChange={(value: Invoice['status']) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manage Invoice Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Manage Invoice Items</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show qty as:</span>
                <Select defaultValue="Qty">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Qty">Qty</SelectItem>
                    <SelectItem value="Hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[300px]">Item</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[80px]">Qty</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Discount</TableHead>
                  <TableHead className="w-[80px]">Tax (%)</TableHead>
                  <TableHead className="w-[100px]">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="space-y-2">
                      <Input
                        placeholder="Service name"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        required
                        className={`font-medium ${hasFieldError(`item ${index + 1}`) ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <Textarea
                        placeholder="add description"
                        value={item.detailedDescription || ''}
                        onChange={(e) => updateLineItem(index, 'detailedDescription', e.target.value)}
                        className="text-sm min-h-[60px]"
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.type}
                        onValueChange={(value: 'Service' | 'Product') => 
                          updateLineItem(index, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`text-center ${hasFieldError(`item ${index + 1}`) ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className={hasFieldError(`item ${index + 1}`) ? 'border-red-500 focus:border-red-500' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0.00"
                          value={item.discount || ''}
                          onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value) || undefined)}
                        />
                        <div className="text-xs text-gray-500">set discount</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0.00"
                          value={item.taxRate || ''}
                          onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value) || undefined)}
                        />
                        <div className="text-xs text-gray-500">set tax</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {formatCurrency(calculateLineTotal(item))}
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button type="button" variant="outline" onClick={addLineItem} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add another line
            </Button>

            {/* Totals Section */}
            <div className="mt-8 flex justify-end">
              <div className="w-96 space-y-4">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {/* Adjustment */}
                <div className="border rounded p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Select value={adjustmentDescription} onValueChange={setAdjustmentDescription}>
                      <SelectTrigger className="flex-1 mr-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adjustment - Non tax">Adjustment - Non tax</SelectItem>
                        <SelectItem value="Shipping">Shipping</SelectItem>
                        <SelectItem value="Handling">Handling</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      value={adjustment}
                      onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                      className="w-24"
                      placeholder="0.00"
                    />
                    <span className="ml-2 text-sm">$</span>
                    <span className="ml-4 font-medium">{formatCurrency(adjustment)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-3 border-t border-gray-300 font-bold text-lg">
                  <span>Grand Total ($):</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Customer Modal */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={customerFormData.name}
                onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                className="col-span-3"
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                placeholder="Phone"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                className="col-span-3"
                value={customerFormData.address}
                onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                placeholder="Address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                className="col-span-3"
                value={customerFormData.company}
                onChange={(e) => setCustomerFormData({ ...customerFormData, company: e.target.value })}
                placeholder="Company"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                className="col-span-3"
                value={customerFormData.contactPerson}
                onChange={(e) => setCustomerFormData({ ...customerFormData, contactPerson: e.target.value })}
                placeholder="Contact Person"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" onClick={handleCreateCustomer} disabled={customerFormLoading}>
              {customerFormLoading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 