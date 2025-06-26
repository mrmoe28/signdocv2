'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Search, Phone, Mail } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  status: 'active' | 'inactive';
  totalInvoiced: number;
  lastInvoiceDate?: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
             const data = await response.json();
       const apiCustomers = (data.customers || []).map((customer: {
         id: string;
         name: string;
         company?: string;
         email: string;
         phone?: string;
         address?: string;
         city?: string;
         state?: string;
         zipCode?: string;
         notes?: string;
         updatedAt: string;
       }) => ({
        id: customer.id,
        name: customer.name,
        company: customer.company || undefined,
        email: customer.email,
        phone: customer.phone || undefined,
        address: customer.address ? {
          street: customer.address,
          city: customer.city || '',
          state: customer.state || '',
          zipCode: customer.zipCode || ''
        } : undefined,
        notes: customer.notes || undefined,
        status: 'active' as const,
        totalInvoiced: 0, // TODO: Calculate from invoices
        lastInvoiceDate: customer.updatedAt
      }));
      setCustomers(apiCustomers);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setFormData({
      name: '', company: '', email: '', phone: '',
      street: '', city: '', state: '', zipCode: '',
      notes: '', status: 'active'
    });
    setSelectedCustomer(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      company: customer.company || '',
      email: customer.email,
      phone: customer.phone || '',
      street: customer.address?.street || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      zipCode: customer.address?.zipCode || '',
      notes: customer.notes || '',
      status: customer.status
    });
    setSelectedCustomer(customer);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const customerData = {
        name: formData.name,
        company: formData.company || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing && selectedCustomer) {
        // Update existing customer
        const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData)
        });

        if (!response.ok) {
          throw new Error('Failed to update customer');
        }
      } else {
        // Create new customer
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData)
        });

        if (!response.ok) {
          throw new Error('Failed to create customer');
        }
      }

      // Refresh the customer list
      await fetchCustomers();
      
      setShowForm(false);
      setSelectedCustomer(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleDelete = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete customer');
        }

        // Refresh the customer list
        await fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const handleToggleStatus = (customerId: string) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCustomers}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database and information</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit' : 'Add'} Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <div className="space-y-3">
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Street address"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                title="Customer Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this customer..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
                {isEditing ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer List ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Invoiced</TableHead>
                  <TableHead>Last Invoice</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.company && (
                          <div className="text-sm text-gray-500">{customer.company}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.address ? (
                        <div className="text-sm">
                          {customer.address.street && <div>{customer.address.street}</div>}
                          {(customer.address.city || customer.address.state) && (
                            <div className="text-gray-500">
                              {customer.address.city}{customer.address.city && customer.address.state ? ', ' : ''}{customer.address.state} {customer.address.zipCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalInvoiced)}
                    </TableCell>
                    <TableCell>
                      {customer.lastInvoiceDate ? (
                        new Date(customer.lastInvoiceDate).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(customer.id)}
                        >
                          {customer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700"
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

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No customers found matching your search.' : 'No customers added yet.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 