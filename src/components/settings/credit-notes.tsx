'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Settings, CreditCard, Mail } from 'lucide-react';

interface CreditNoteSettings {
  numbering: {
    prefix: string;
    nextNumber: number;
    autoIncrement: boolean;
  };
  defaults: {
    reasonRequired: boolean;
    approvalRequired: boolean;
    autoApplyToAccount: boolean;
    defaultReason: string;
    terms: string;
    validityDays: number;
  };
  workflow: {
    requireApproval: boolean;
    approverRole: string;
    sendNotifications: boolean;
    autoEmail: boolean;
    allowPartialCredits: boolean;
  };
  features: {
    enableRefunds: boolean;
    enableAccountCredit: boolean;
    enableExchange: boolean;
    trackOriginalInvoice: boolean;
    showTaxBreakdown: boolean;
  };
}

const defaultSettings: CreditNoteSettings = {
  numbering: {
    prefix: 'CN-',
    nextNumber: 1001,
    autoIncrement: true,
  },
  defaults: {
    reasonRequired: true,
    approvalRequired: true,
    autoApplyToAccount: false,
    defaultReason: 'Product return/refund',
    terms: 'Credit note issued for returned items or service adjustments.',
    validityDays: 365,
  },
  workflow: {
    requireApproval: true,
    approverRole: 'Manager',
    sendNotifications: true,
    autoEmail: true,
    allowPartialCredits: true,
  },
  features: {
    enableRefunds: true,
    enableAccountCredit: true,
    enableExchange: false,
    trackOriginalInvoice: true,
    showTaxBreakdown: true,
  },
};

export function CreditNotes() {
  const [settings, setSettings] = useState<CreditNoteSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNumberingChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      numbering: { ...prev.numbering, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleDefaultsChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      defaults: { ...prev.defaults, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleWorkflowChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      workflow: { ...prev.workflow, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleFeaturesChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('Credit note settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Note Settings</h1>
          <p className="text-gray-600">Configure credit note processing and approval workflow</p>
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
            <StickyNote className="h-5 w-5" />
            Credit Note Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prefix</label>
              <Input
                value={settings.numbering.prefix}
                onChange={(e) => handleNumberingChange('prefix', e.target.value)}
                placeholder="CN-"
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
            Default Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Validity Period (days)</label>
              <Input
                type="number"
                value={settings.defaults.validityDays}
                onChange={(e) => handleDefaultsChange('validityDays', parseInt(e.target.value))}
                min="1"
                max="3650"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Reason Required</p>
                <p className="text-sm text-gray-600">Require reason for credit note creation</p>
              </div>
              <Switch
                checked={settings.defaults.reasonRequired}
                onCheckedChange={(checked) => handleDefaultsChange('reasonRequired', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Auto-apply to Customer Account</p>
                <p className="text-sm text-gray-600">Automatically apply credit to customer balance</p>
              </div>
              <Switch
                checked={settings.defaults.autoApplyToAccount}
                onCheckedChange={(checked) => handleDefaultsChange('autoApplyToAccount', checked)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Reason</label>
            <Input
              value={settings.defaults.defaultReason}
              onChange={(e) => handleDefaultsChange('defaultReason', e.target.value)}
              placeholder="Enter default reason..."
            />
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
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Approval</p>
              <p className="text-sm text-gray-600">Credit notes need manager approval</p>
            </div>
            <Switch
              checked={settings.workflow.requireApproval}
              onCheckedChange={(checked) => handleWorkflowChange('requireApproval', checked)}
            />
          </div>

          {settings.workflow.requireApproval && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2">Approver Role</label>
              <select
                title="Approver Role"
                value={settings.workflow.approverRole}
                onChange={(e) => handleWorkflowChange('approverRole', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Owner">Owner</option>
                <option value="Finance">Finance Team</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Send Notifications</p>
              <p className="text-sm text-gray-600">Notify relevant parties of status changes</p>
            </div>
            <Switch
              checked={settings.workflow.sendNotifications}
              onCheckedChange={(checked) => handleWorkflowChange('sendNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <div>
                <p className="font-medium">Auto-email Credit Notes</p>
                <p className="text-sm text-gray-600">Automatically email approved credit notes</p>
              </div>
            </div>
            <Switch
              checked={settings.workflow.autoEmail}
              onCheckedChange={(checked) => handleWorkflowChange('autoEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Allow Partial Credits</p>
              <p className="text-sm text-gray-600">Enable partial credit amounts</p>
            </div>
            <Switch
              checked={settings.workflow.allowPartialCredits}
              onCheckedChange={(checked) => handleWorkflowChange('allowPartialCredits', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Features & Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable Refunds</p>
              <p className="text-sm text-gray-600">Allow cash/card refunds</p>
            </div>
            <Switch
              checked={settings.features.enableRefunds}
              onCheckedChange={(checked) => handleFeaturesChange('enableRefunds', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable Account Credit</p>
              <p className="text-sm text-gray-600">Allow credit to customer account balance</p>
            </div>
            <Switch
              checked={settings.features.enableAccountCredit}
              onCheckedChange={(checked) => handleFeaturesChange('enableAccountCredit', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable Product Exchange</p>
              <p className="text-sm text-gray-600">Allow product exchanges instead of refunds</p>
            </div>
            <Switch
              checked={settings.features.enableExchange}
              onCheckedChange={(checked) => handleFeaturesChange('enableExchange', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Track Original Invoice</p>
              <p className="text-sm text-gray-600">Link credit notes to original invoices</p>
            </div>
            <Switch
              checked={settings.features.trackOriginalInvoice}
              onCheckedChange={(checked) => handleFeaturesChange('trackOriginalInvoice', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Show Tax Breakdown</p>
              <p className="text-sm text-gray-600">Display detailed tax calculations</p>
            </div>
            <Switch
              checked={settings.features.showTaxBreakdown}
              onCheckedChange={(checked) => handleFeaturesChange('showTaxBreakdown', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 