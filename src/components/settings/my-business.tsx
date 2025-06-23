'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building, Upload, MapPin, Phone, Mail, Globe, FileText, Save } from 'lucide-react';

interface BusinessInfo {
  companyName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description: string;
  logo?: string;
  invoiceSettings: {
    prefix: string;
    nextNumber: number;
    terms: string;
    notes: string;
  };
  banking: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
}

const defaultBusinessInfo: BusinessInfo = {
  companyName: 'Job Invoicer Pro',
  legalName: 'Job Invoicer Pro LLC',
  taxId: '12-3456789',
  email: 'info@jobinvoicer.com',
  phone: '(555) 123-4567',
  website: 'https://jobinvoicer.com',
  address: {
    street: '123 Business Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  },
  description: 'Professional invoicing and business management solutions for small businesses and freelancers.',
  invoiceSettings: {
    prefix: 'INV',
    nextNumber: 1001,
    terms: 'Payment is due within 30 days of invoice date.',
    notes: 'Thank you for your business!'
  },
  banking: {
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: ''
  }
};

export function MyBusiness() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddressChange = (field: keyof BusinessInfo['address'], value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleInvoiceSettingsChange = (field: keyof BusinessInfo['invoiceSettings'], value: string | number) => {
    setBusinessInfo(prev => ({
      ...prev,
      invoiceSettings: { ...prev.invoiceSettings, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleBankingChange = (field: keyof BusinessInfo['banking'], value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      banking: { ...prev.banking, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    // Save business info logic would go here
    setHasChanges(false);
    alert('Business information saved successfully!');
  };

  const handleReset = () => {
    setBusinessInfo(defaultBusinessInfo);
    setLogoFile(null);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Business</h1>
          <p className="text-gray-600">Manage your business information and profile</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <Input
                value={businessInfo.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Legal Name</label>
              <Input
                value={businessInfo.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Legal Business Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tax ID / EIN</label>
              <Input
                value={businessInfo.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="12-3456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input
                type="url"
                value={businessInfo.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Business Description</label>
            <Textarea
              value={businessInfo.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your business..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Business Email</label>
              <Input
                type="email"
                value={businessInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="info@yourbusiness.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={businessInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Street Address</label>
            <Input
              value={businessInfo.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Business Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input
                value={businessInfo.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <Input
                value={businessInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code</label>
              <Input
                value={businessInfo.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input
                value={businessInfo.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                placeholder="United States"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {logoFile ? (
                <img 
                  src={URL.createObjectURL(logoFile)} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button asChild variant="outline">
                  <span className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Prefix</label>
              <Input
                value={businessInfo.invoiceSettings.prefix}
                onChange={(e) => handleInvoiceSettingsChange('prefix', e.target.value)}
                placeholder="INV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Next Invoice Number</label>
              <Input
                type="number"
                value={businessInfo.invoiceSettings.nextNumber}
                onChange={(e) => handleInvoiceSettingsChange('nextNumber', parseInt(e.target.value))}
                placeholder="1001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Payment Terms</label>
            <Textarea
              value={businessInfo.invoiceSettings.terms}
              onChange={(e) => handleInvoiceSettingsChange('terms', e.target.value)}
              placeholder="Payment is due within 30 days..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Invoice Notes</label>
            <Textarea
              value={businessInfo.invoiceSettings.notes}
              onChange={(e) => handleInvoiceSettingsChange('notes', e.target.value)}
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Banking Information</CardTitle>
          <p className="text-sm text-gray-600">Optional: Add banking details for easier payment processing</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <Input
                value={businessInfo.banking.accountName}
                onChange={(e) => handleBankingChange('accountName', e.target.value)}
                placeholder="Business Account Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <Input
                value={businessInfo.banking.bankName}
                onChange={(e) => handleBankingChange('bankName', e.target.value)}
                placeholder="First National Bank"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <Input
                value={businessInfo.banking.accountNumber}
                onChange={(e) => handleBankingChange('accountNumber', e.target.value)}
                placeholder="****1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Routing Number</label>
              <Input
                value={businessInfo.banking.routingNumber}
                onChange={(e) => handleBankingChange('routingNumber', e.target.value)}
                placeholder="021000021"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 