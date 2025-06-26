'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck, Settings, Mail, Phone } from 'lucide-react';

interface LeadSettings {
  sources: {
    enableWebForm: boolean;
    enablePhoneCalls: boolean;
    enableEmailInquiries: boolean;
    enableReferrals: boolean;
    enableSocialMedia: boolean;
    customSources: string[];
  };
  automation: {
    autoAssign: boolean;
    sendWelcomeEmail: boolean;
    createFollowUpTasks: boolean;
    followUpDays: number[];
    scoreLeads: boolean;
    autoQualify: boolean;
  };
  notifications: {
    newLeadEmail: boolean;
    newLeadSMS: boolean;
    assignmentEmail: boolean;
    followUpReminders: boolean;
    conversionAlerts: boolean;
  };
  fields: {
    requirePhone: boolean;
    requireEmail: boolean;
    requireAddress: boolean;
    requireBudget: boolean;
    requireTimeline: boolean;
    customFields: string[];
  };
}

const defaultSettings: LeadSettings = {
  sources: {
    enableWebForm: true,
    enablePhoneCalls: true,
    enableEmailInquiries: true,
    enableReferrals: true,
    enableSocialMedia: false,
    customSources: ['Trade Show', 'Advertisement'],
  },
  automation: {
    autoAssign: true,
    sendWelcomeEmail: true,
    createFollowUpTasks: true,
    followUpDays: [1, 3, 7, 14],
    scoreLeads: true,
    autoQualify: false,
  },
  notifications: {
    newLeadEmail: true,
    newLeadSMS: false,
    assignmentEmail: true,
    followUpReminders: true,
    conversionAlerts: true,
  },
  fields: {
    requirePhone: true,
    requireEmail: true,
    requireAddress: false,
    requireBudget: false,
    requireTimeline: false,
    customFields: ['Project Type', 'Property Size'],
  },
};

export function Leads() {
  const [settings, setSettings] = useState<LeadSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [newCustomSource, setNewCustomSource] = useState('');
  const [newCustomField, setNewCustomField] = useState('');

  const handleSourcesChange = (field: string, value: boolean | string[]) => {
    setSettings(prev => ({
      ...prev,
      sources: { ...prev.sources, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleAutomationChange = (field: string, value: boolean | number[]) => {
    setSettings(prev => ({
      ...prev,
      automation: { ...prev.automation, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleNotificationsChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleFieldsChange = (field: string, value: boolean | string[]) => {
    setSettings(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: value }
    }));
    setHasChanges(true);
  };

  const addCustomSource = () => {
    if (newCustomSource.trim()) {
      handleSourcesChange('customSources', [...settings.sources.customSources, newCustomSource.trim()]);
      setNewCustomSource('');
    }
  };

  const removeCustomSource = (index: number) => {
    const updated = settings.sources.customSources.filter((_, i) => i !== index);
    handleSourcesChange('customSources', updated);
  };

  const addCustomField = () => {
    if (newCustomField.trim()) {
      handleFieldsChange('customFields', [...settings.fields.customFields, newCustomField.trim()]);
      setNewCustomField('');
    }
  };

  const removeCustomField = (index: number) => {
    const updated = settings.fields.customFields.filter((_, i) => i !== index);
    handleFieldsChange('customFields', updated);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('Lead settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Settings</h1>
          <p className="text-gray-600">Configure lead capture, automation, and management</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>Reset</Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
        </div>
      </div>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Lead Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Website Contact Form</p>
              <p className="text-sm text-gray-600">Capture leads from your website</p>
            </div>
            <Switch
              checked={settings.sources.enableWebForm}
              onCheckedChange={(checked) => handleSourcesChange('enableWebForm', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Phone Calls</p>
              <p className="text-sm text-gray-600">Manual entry from phone inquiries</p>
            </div>
            <Switch
              checked={settings.sources.enablePhoneCalls}
              onCheckedChange={(checked) => handleSourcesChange('enablePhoneCalls', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Email Inquiries</p>
              <p className="text-sm text-gray-600">Direct email contacts</p>
            </div>
            <Switch
              checked={settings.sources.enableEmailInquiries}
              onCheckedChange={(checked) => handleSourcesChange('enableEmailInquiries', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Referrals</p>
              <p className="text-sm text-gray-600">Customer and partner referrals</p>
            </div>
            <Switch
              checked={settings.sources.enableReferrals}
              onCheckedChange={(checked) => handleSourcesChange('enableReferrals', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Social Media</p>
              <p className="text-sm text-gray-600">Facebook, Instagram, LinkedIn leads</p>
            </div>
            <Switch
              checked={settings.sources.enableSocialMedia}
              onCheckedChange={(checked) => handleSourcesChange('enableSocialMedia', checked)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Custom Lead Sources</label>
            <div className="space-y-2">
              {settings.sources.customSources.map((source, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={source} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => removeCustomSource(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newCustomSource}
                  onChange={(e) => setNewCustomSource(e.target.value)}
                  placeholder="Add custom source..."
                  className="flex-1"
                />
                <Button onClick={addCustomSource} disabled={!newCustomSource.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-assign Leads</p>
              <p className="text-sm text-gray-600">Automatically assign to available sales reps</p>
            </div>
            <Switch
              checked={settings.automation.autoAssign}
              onCheckedChange={(checked) => handleAutomationChange('autoAssign', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Send Welcome Email</p>
              <p className="text-sm text-gray-600">Automatic welcome email to new leads</p>
            </div>
            <Switch
              checked={settings.automation.sendWelcomeEmail}
              onCheckedChange={(checked) => handleAutomationChange('sendWelcomeEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Create Follow-up Tasks</p>
              <p className="text-sm text-gray-600">Automatically create follow-up reminders</p>
            </div>
            <Switch
              checked={settings.automation.createFollowUpTasks}
              onCheckedChange={(checked) => handleAutomationChange('createFollowUpTasks', checked)}
            />
          </div>

          {settings.automation.createFollowUpTasks && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2">Follow-up Schedule (days)</label>
              <Input
                type="text"
                value={settings.automation.followUpDays.join(', ')}
                onChange={(e) => {
                  const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                  handleAutomationChange('followUpDays', days);
                }}
                placeholder="1, 3, 7, 14"
                className="w-48"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Lead Scoring</p>
              <p className="text-sm text-gray-600">Automatically score leads based on criteria</p>
            </div>
            <Switch
              checked={settings.automation.scoreLeads}
              onCheckedChange={(checked) => handleAutomationChange('scoreLeads', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-qualify Leads</p>
              <p className="text-sm text-gray-600">Automatically qualify based on score</p>
            </div>
            <Switch
              checked={settings.automation.autoQualify}
              onCheckedChange={(checked) => handleAutomationChange('autoQualify', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">New Lead Email Alerts</p>
              <p className="text-sm text-gray-600">Email notifications for new leads</p>
            </div>
            <Switch
              checked={settings.notifications.newLeadEmail}
              onCheckedChange={(checked) => handleNotificationsChange('newLeadEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <div>
                <p className="font-medium">New Lead SMS Alerts</p>
                <p className="text-sm text-gray-600">SMS notifications for new leads</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications.newLeadSMS}
              onCheckedChange={(checked) => handleNotificationsChange('newLeadSMS', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Assignment Notifications</p>
              <p className="text-sm text-gray-600">Notify sales reps when leads are assigned</p>
            </div>
            <Switch
              checked={settings.notifications.assignmentEmail}
              onCheckedChange={(checked) => handleNotificationsChange('assignmentEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Follow-up Reminders</p>
              <p className="text-sm text-gray-600">Remind sales reps about follow-ups</p>
            </div>
            <Switch
              checked={settings.notifications.followUpReminders}
              onCheckedChange={(checked) => handleNotificationsChange('followUpReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Conversion Alerts</p>
              <p className="text-sm text-gray-600">Notify when leads convert to customers</p>
            </div>
            <Switch
              checked={settings.notifications.conversionAlerts}
              onCheckedChange={(checked) => handleNotificationsChange('conversionAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Required Fields
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Phone Number</p>
              <p className="text-sm text-gray-600">Phone number is mandatory</p>
            </div>
            <Switch
              checked={settings.fields.requirePhone}
              onCheckedChange={(checked) => handleFieldsChange('requirePhone', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Email Address</p>
              <p className="text-sm text-gray-600">Email address is mandatory</p>
            </div>
            <Switch
              checked={settings.fields.requireEmail}
              onCheckedChange={(checked) => handleFieldsChange('requireEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Address</p>
              <p className="text-sm text-gray-600">Physical address is mandatory</p>
            </div>
            <Switch
              checked={settings.fields.requireAddress}
              onCheckedChange={(checked) => handleFieldsChange('requireAddress', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Budget Information</p>
              <p className="text-sm text-gray-600">Budget range is mandatory</p>
            </div>
            <Switch
              checked={settings.fields.requireBudget}
              onCheckedChange={(checked) => handleFieldsChange('requireBudget', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Timeline</p>
              <p className="text-sm text-gray-600">Project timeline is mandatory</p>
            </div>
            <Switch
              checked={settings.fields.requireTimeline}
              onCheckedChange={(checked) => handleFieldsChange('requireTimeline', checked)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Custom Required Fields</label>
            <div className="space-y-2">
              {settings.fields.customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={field} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => removeCustomField(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newCustomField}
                  onChange={(e) => setNewCustomField(e.target.value)}
                  placeholder="Add custom field..."
                  className="flex-1"
                />
                <Button onClick={addCustomField} disabled={!newCustomField.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 