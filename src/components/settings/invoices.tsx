'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, Settings, CreditCard, Mail } from 'lucide-react';

interface InvoiceSettings {
  numbering: {
    prefix: string;
    nextNumber: number;
    autoIncrement: boolean;
  };
  defaults: {
    paymentTerms: number;
    taxRate: number;
    currency: string;
    lateFeeRate: number;
    terms: string;
    footer: string;
  };
  payment: {
    allowOnlinePayment: boolean;
    acceptCreditCards: boolean;
    acceptBankTransfer: boolean;
    acceptCrypto: boolean;
    processingFeeRate: number;
  };
  automation: {
    autoSend: boolean;
    sendReminders: boolean;
    reminderDays: number[];
    autoLateFees: boolean;
    autoCollection: boolean;
  };
}

const defaultSettings: InvoiceSettings = {
  numbering: {
    prefix: 'INV-',
    nextNumber: 1001,
    autoIncrement: true,
  },
  defaults: {
    paymentTerms: 30,
    taxRate: 8.5,
    currency: 'USD',
    lateFeeRate: 1.5,
    terms: 'Payment is due within 30 days of invoice date.',
    footer: 'Thank you for your business!',
  },
  payment: {
    allowOnlinePayment: true,
    acceptCreditCards: true,
    acceptBankTransfer: false,
    acceptCrypto: false,
    processingFeeRate: 2.9,
  },
  automation: {
    autoSend: false,
    sendReminders: true,
    reminderDays: [7, 3, 1],
    autoLateFees: false,
    autoCollection: false,
  },
};

export function Invoices() {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNumberingChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      numbering: { ...prev.numbering, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleDefaultsChange = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      defaults: { ...prev.defaults, [field]: value }
    }));
    setHasChanges(true);
  };

  const handlePaymentChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleAutomationChange = (field: string, value: string | number | boolean | number[]) => {
    setSettings(prev => ({
      ...prev,
      automation: { ...prev.automation, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('Invoice settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Settings</h1>
          <p className="text-gray-600">Configure your invoice templates and payment options</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>Reset</Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
        </div>
      </div>

      {/* Numbering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Invoice Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prefix</label>
              <Input
                value={settings.numbering.prefix}
                onChange={(e) => handleNumberingChange('prefix', e.target.value)}
                placeholder="INV-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Next Number</label>
              <Input
                type="number"
                value={settings.numbering.nextNumber}
                onChange={(e) => handleNumberingChange('nextNumber', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-increment Numbers</p>
              <p className="text-sm text-gray-600">Automatically assign sequential numbers</p>
            </div>
            <Switch
              checked={settings.numbering.autoIncrement}
              onCheckedChange={(checked) => handleNumberingChange('autoIncrement', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Default Values
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Terms (days)</label>
              <Input
                type="number"
                value={settings.defaults.paymentTerms}
                onChange={(e) => handleDefaultsChange('paymentTerms', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.defaults.taxRate}
                onChange={(e) => handleDefaultsChange('taxRate', parseFloat(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Late Fee (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.defaults.lateFeeRate}
                onChange={(e) => handleDefaultsChange('lateFeeRate', parseFloat(e.target.value))}
                min="0"
                max="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                title="Currency"
                value={settings.defaults.currency}
                onChange={(e) => handleDefaultsChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Terms</label>
            <Textarea
              value={settings.defaults.terms}
              onChange={(e) => handleDefaultsChange('terms', e.target.value)}
              rows={3}
              placeholder="Enter default payment terms..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Invoice Footer</label>
            <Textarea
              value={settings.defaults.footer}
              onChange={(e) => handleDefaultsChange('footer', e.target.value)}
              rows={2}
              placeholder="Enter default footer text..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Allow Online Payments</p>
              <p className="text-sm text-gray-600">Enable online payment processing</p>
            </div>
            <Switch
              checked={settings.payment.allowOnlinePayment}
              onCheckedChange={(checked) => handlePaymentChange('allowOnlinePayment', checked)}
            />
          </div>

          {settings.payment.allowOnlinePayment && (
            <>
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Accept Credit Cards</p>
                    <p className="text-sm text-gray-600">Visa, MasterCard, American Express</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptCreditCards}
                    onCheckedChange={(checked) => handlePaymentChange('acceptCreditCards', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Accept Bank Transfer</p>
                    <p className="text-sm text-gray-600">ACH and wire transfers</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptBankTransfer}
                    onCheckedChange={(checked) => handlePaymentChange('acceptBankTransfer', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Accept Cryptocurrency</p>
                    <p className="text-sm text-gray-600">Bitcoin, Ethereum, etc.</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptCrypto}
                    onCheckedChange={(checked) => handlePaymentChange('acceptCrypto', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Processing Fee Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.payment.processingFeeRate}
                    onChange={(e) => handlePaymentChange('processingFeeRate', parseFloat(e.target.value))}
                    min="0"
                    max="10"
                    className="w-32"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Automation & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-send Invoices</p>
              <p className="text-sm text-gray-600">Automatically email invoices when created</p>
            </div>
            <Switch
              checked={settings.automation.autoSend}
              onCheckedChange={(checked) => handleAutomationChange('autoSend', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Send Payment Reminders</p>
              <p className="text-sm text-gray-600">Automatic reminder emails for overdue invoices</p>
            </div>
            <Switch
              checked={settings.automation.sendReminders}
              onCheckedChange={(checked) => handleAutomationChange('sendReminders', checked)}
            />
          </div>

          {settings.automation.sendReminders && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2">Reminder Schedule (days before due)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={settings.automation.reminderDays.join(', ')}
                  onChange={(e) => {
                    const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                    handleAutomationChange('reminderDays', days);
                  }}
                  placeholder="7, 3, 1"
                  className="w-48"
                />
                <span className="text-sm text-gray-500 self-center">days</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto Late Fees</p>
              <p className="text-sm text-gray-600">Automatically apply late fees to overdue invoices</p>
            </div>
            <Switch
              checked={settings.automation.autoLateFees}
              onCheckedChange={(checked) => handleAutomationChange('autoLateFees', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto Collections</p>
              <p className="text-sm text-gray-600">Send to collections after extended overdue period</p>
            </div>
            <Switch
              checked={settings.automation.autoCollection}
              onCheckedChange={(checked) => handleAutomationChange('autoCollection', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 