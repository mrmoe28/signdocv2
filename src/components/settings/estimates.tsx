'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Settings, DollarSign, Calendar, Mail } from 'lucide-react';

interface EstimateSettings {
  numbering: {
    prefix: string;
    nextNumber: number;
    autoIncrement: boolean;
  };
  defaults: {
    validityDays: number;
    taxRate: number;
    currency: string;
    terms: string;
    notes: string;
  };
  features: {
    allowOnlineAcceptance: boolean;
    requireSignature: boolean;
    showPricing: boolean;
    enableComments: boolean;
    autoFollowUp: boolean;
    followUpDays: number;
  };
  branding: {
    showLogo: boolean;
    customColors: boolean;
    primaryColor: string;
    showCompanyInfo: boolean;
  };
}

const defaultSettings: EstimateSettings = {
  numbering: {
    prefix: 'EST-',
    nextNumber: 1001,
    autoIncrement: true,
  },
  defaults: {
    validityDays: 30,
    taxRate: 8.5,
    currency: 'USD',
    terms: 'This estimate is valid for 30 days from the date of issue.',
    notes: 'Thank you for considering our services.',
  },
  features: {
    allowOnlineAcceptance: true,
    requireSignature: false,
    showPricing: true,
    enableComments: true,
    autoFollowUp: false,
    followUpDays: 7,
  },
  branding: {
    showLogo: true,
    customColors: false,
    primaryColor: '#3B82F6',
    showCompanyInfo: true,
  },
};

export function Estimates() {
  const [settings, setSettings] = useState<EstimateSettings>(defaultSettings);
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

  const handleFeaturesChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleBrandingChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('Estimate settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimate Settings</h1>
          <p className="text-gray-600">Configure your estimate templates and preferences</p>
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
            <FileText className="h-5 w-5" />
            Estimate Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prefix</label>
              <Input
                value={settings.numbering.prefix}
                onChange={(e) => handleNumberingChange('prefix', e.target.value)}
                placeholder="EST-"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Validity (days)</label>
              <Input
                type="number"
                value={settings.defaults.validityDays}
                onChange={(e) => handleDefaultsChange('validityDays', parseInt(e.target.value))}
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
              placeholder="Enter default terms and conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Notes</label>
            <Textarea
              value={settings.defaults.notes}
              onChange={(e) => handleDefaultsChange('notes', e.target.value)}
              rows={2}
              placeholder="Enter default notes..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Features & Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Allow Online Acceptance</p>
              <p className="text-sm text-gray-600">Customers can accept estimates online</p>
            </div>
            <Switch
              checked={settings.features.allowOnlineAcceptance}
              onCheckedChange={(checked) => handleFeaturesChange('allowOnlineAcceptance', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Digital Signature</p>
              <p className="text-sm text-gray-600">Require signature for acceptance</p>
            </div>
            <Switch
              checked={settings.features.requireSignature}
              onCheckedChange={(checked) => handleFeaturesChange('requireSignature', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Show Detailed Pricing</p>
              <p className="text-sm text-gray-600">Display itemized pricing breakdown</p>
            </div>
            <Switch
              checked={settings.features.showPricing}
              onCheckedChange={(checked) => handleFeaturesChange('showPricing', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable Customer Comments</p>
              <p className="text-sm text-gray-600">Allow customers to add comments</p>
            </div>
            <Switch
              checked={settings.features.enableComments}
              onCheckedChange={(checked) => handleFeaturesChange('enableComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <div>
                <p className="font-medium">Auto Follow-up</p>
                <p className="text-sm text-gray-600">Send automatic follow-up emails</p>
              </div>
            </div>
            <Switch
              checked={settings.features.autoFollowUp}
              onCheckedChange={(checked) => handleFeaturesChange('autoFollowUp', checked)}
            />
          </div>

          {settings.features.autoFollowUp && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2">Follow-up after (days)</label>
              <Input
                type="number"
                value={settings.features.followUpDays}
                onChange={(e) => handleFeaturesChange('followUpDays', parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Branding & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Show Company Logo</p>
                <p className="text-sm text-gray-600">Display your logo on estimates</p>
              </div>
              <Switch
                checked={settings.branding.showLogo}
                onCheckedChange={(checked) => handleBrandingChange('showLogo', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Show Company Information</p>
                <p className="text-sm text-gray-600">Include contact details and address</p>
              </div>
              <Switch
                checked={settings.branding.showCompanyInfo}
                onCheckedChange={(checked) => handleBrandingChange('showCompanyInfo', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Custom Colors</p>
                <p className="text-sm text-gray-600">Use custom brand colors</p>
              </div>
              <Switch
                checked={settings.branding.customColors}
                onCheckedChange={(checked) => handleBrandingChange('customColors', checked)}
              />
            </div>

            {settings.branding.customColors && (
              <div className="ml-6">
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 