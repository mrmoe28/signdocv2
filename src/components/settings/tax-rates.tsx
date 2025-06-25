'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Calculator } from 'lucide-react';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  type: 'sales' | 'service' | 'product';
}

const mockTaxRates: TaxRate[] = [
  {
    id: '1',
    name: 'Sales Tax',
    rate: 8.25,
    description: 'Standard sales tax rate',
    isDefault: true,
    isActive: true,
    type: 'sales'
  },
  {
    id: '2',
    name: 'Service Tax',
    rate: 5.0,
    description: 'Tax rate for services',
    isDefault: false,
    isActive: true,
    type: 'service'
  },
  {
    id: '3',
    name: 'Product Tax',
    rate: 10.0,
    description: 'Tax rate for products',
    isDefault: false,
    isActive: false,
    type: 'product'
  }
];

export function TaxRates() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>(mockTaxRates);
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    description: '',
    type: 'sales' as 'sales' | 'service' | 'product',
    isActive: true
  });

  const handleCreate = () => {
    setFormData({ name: '', rate: '', description: '', type: 'sales', isActive: true });
    setSelectedTaxRate(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (taxRate: TaxRate) => {
    setFormData({
      name: taxRate.name,
      rate: taxRate.rate.toString(),
      description: taxRate.description || '',
      type: taxRate.type,
      isActive: taxRate.isActive
    });
    setSelectedTaxRate(taxRate);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = () => {
    const newTaxRate: TaxRate = {
      id: selectedTaxRate?.id || Date.now().toString(),
      name: formData.name,
      rate: parseFloat(formData.rate),
      description: formData.description,
      type: formData.type,
      isActive: formData.isActive,
      isDefault: selectedTaxRate?.isDefault || false
    };

    if (isEditing && selectedTaxRate) {
      setTaxRates(prev => prev.map(t => t.id === selectedTaxRate.id ? newTaxRate : t));
    } else {
      setTaxRates(prev => [...prev, newTaxRate]);
    }

    setShowForm(false);
    setSelectedTaxRate(null);
    setIsEditing(false);
  };

  const handleDelete = (taxRateId: string) => {
    const taxRate = taxRates.find(t => t.id === taxRateId);
    if (taxRate?.isDefault) {
      alert('Cannot delete the default tax rate');
      return;
    }
    
    setTaxRates(prev => prev.filter(t => t.id !== taxRateId));
  };

  const handleSetDefault = (taxRateId: string) => {
    setTaxRates(prev => prev.map(t => ({ 
      ...t, 
      isDefault: t.id === taxRateId,
      isActive: t.id === taxRateId ? true : t.isActive // Auto-activate when setting as default
    })));
  };

  const handleToggleActive = (taxRateId: string) => {
    const taxRate = taxRates.find(t => t.id === taxRateId);
    if (taxRate?.isDefault && taxRate.isActive) {
      alert('Cannot deactivate the default tax rate');
      return;
    }
    
    setTaxRates(prev => prev.map(t => 
      t.id === taxRateId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Rates</h1>
          <p className="text-gray-600">Configure tax rates for your invoices and estimates</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Tax Rate
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit' : 'Add'} Tax Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Tax, VAT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="e.g., 8.25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                title="Tax Rate Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sales' | 'service' | 'product' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sales">Sales Tax</option>
                <option value="service">Service Tax</option>
                <option value="product">Product Tax</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this tax rate"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isEditing ? 'Update' : 'Add'} Tax Rate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((taxRate) => (
                <TableRow key={taxRate.id}>
                  <TableCell className="font-medium">{taxRate.name}</TableCell>
                  <TableCell className="font-mono">{taxRate.rate}%</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {taxRate.type.charAt(0).toUpperCase() + taxRate.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {taxRate.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {taxRate.isDefault && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Default
                        </Badge>
                      )}
                      <Badge variant={taxRate.isActive ? 'default' : 'secondary'}>
                        {taxRate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={taxRate.isActive}
                        onCheckedChange={() => handleToggleActive(taxRate.id)}
                        disabled={taxRate.isDefault}
                      />
                      {!taxRate.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(taxRate.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(taxRate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(taxRate.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={taxRate.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Rate Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Setting Default Tax Rate</h4>
              <p className="text-sm text-gray-600">
                The default tax rate will be automatically applied to new invoices and estimates. 
                You can change this by clicking "Set Default" on any active tax rate.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tax Rate Types</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Sales Tax:</strong> Applied to general sales</div>
                <div><strong>Service Tax:</strong> Applied to service-based items</div>
                <div><strong>Product Tax:</strong> Applied to physical products</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 