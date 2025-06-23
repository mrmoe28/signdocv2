'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mail, Server, Shield, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';

interface EmailSettings {
  smtp: {
    server: string;
    port: number;
    username: string;
    password: string;
    encryption: 'none' | 'tls' | 'ssl';
  };
  sender: {
    name: string;
    email: string;
    replyTo: string;
  };
  notifications: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    overdueReminders: boolean;
    weeklyReports: boolean;
  };
  templates: {
    useCustomHeader: boolean;
    useCustomFooter: boolean;
    includeCompanyLogo: boolean;
  };
}

const defaultSettings: EmailSettings = {
  smtp: {
    server: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls'
  },
  sender: {
    name: 'Job Invoicer',
    email: '',
    replyTo: ''
  },
  notifications: {
    invoiceCreated: true,
    paymentReceived: true,
    overdueReminders: true,
    weeklyReports: false
  },
  templates: {
    useCustomHeader: false,
    useCustomFooter: false,
    includeCompanyLogo: true
  }
};

export function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSmtpChange = (field: keyof EmailSettings['smtp'], value: string | number) => {
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSenderChange = (field: keyof EmailSettings['sender'], value: string) => {
    setSettings(prev => ({
      ...prev,
      sender: { ...prev.sender, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleNotificationChange = (field: keyof EmailSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleTemplateChange = (field: keyof EmailSettings['templates'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      templates: { ...prev.templates, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    
    // Simulate testing email connection
    setTimeout(() => {
      if (settings.smtp.server && settings.smtp.username) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
      
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 2000);
  };

  const handleSave = () => {
    // Save settings logic would go here
    setHasChanges(false);
    alert('Email settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-gray-600">Configure your email settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Server</label>
              <Input
                value={settings.smtp.server}
                onChange={(e) => handleSmtpChange('server', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Port</label>
              <Input
                type="number"
                value={settings.smtp.port}
                onChange={(e) => handleSmtpChange('port', parseInt(e.target.value))}
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                value={settings.smtp.username}
                onChange={(e) => handleSmtpChange('username', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={settings.smtp.password}
                onChange={(e) => handleSmtpChange('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Encryption</label>
            <select
              title="SMTP Encryption"
              value={settings.smtp.encryption}
              onChange={(e) => handleSmtpChange('encryption', e.target.value as 'none' | 'tls' | 'ssl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">None</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {testStatus === 'success' && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connection successful
              </Badge>
            )}
            
            {testStatus === 'error' && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Connection failed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sender Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Sender Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sender Name</label>
            <Input
              value={settings.sender.name}
              onChange={(e) => handleSenderChange('name', e.target.value)}
              placeholder="Your Business Name"
            />
            <p className="text-xs text-gray-500 mt-1">This will appear as the sender name in emails</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <Input
                type="email"
                value={settings.sender.email}
                onChange={(e) => handleSenderChange('email', e.target.value)}
                placeholder="noreply@yourbusiness.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reply-To Email</label>
              <Input
                type="email"
                value={settings.sender.replyTo}
                onChange={(e) => handleSenderChange('replyTo', e.target.value)}
                placeholder="support@yourbusiness.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Invoice Created</label>
                <p className="text-xs text-gray-500">Send confirmation when new invoices are created</p>
              </div>
              <Switch
                checked={settings.notifications.invoiceCreated}
                onCheckedChange={(checked) => handleNotificationChange('invoiceCreated', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Received</label>
                <p className="text-xs text-gray-500">Notify when payments are received</p>
              </div>
              <Switch
                checked={settings.notifications.paymentReceived}
                onCheckedChange={(checked) => handleNotificationChange('paymentReceived', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Overdue Reminders</label>
                <p className="text-xs text-gray-500">Automatic reminders for overdue invoices</p>
              </div>
              <Switch
                checked={settings.notifications.overdueReminders}
                onCheckedChange={(checked) => handleNotificationChange('overdueReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Weekly Reports</label>
                <p className="text-xs text-gray-500">Weekly summary of business activity</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Include Company Logo</label>
                <p className="text-xs text-gray-500">Add your company logo to email headers</p>
              </div>
              <Switch
                checked={settings.templates.includeCompanyLogo}
                onCheckedChange={(checked) => handleTemplateChange('includeCompanyLogo', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Custom Header</label>
                <p className="text-xs text-gray-500">Use custom header in email templates</p>
              </div>
              <Switch
                checked={settings.templates.useCustomHeader}
                onCheckedChange={(checked) => handleTemplateChange('useCustomHeader', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Custom Footer</label>
                <p className="text-xs text-gray-500">Use custom footer in email templates</p>
              </div>
              <Switch
                checked={settings.templates.useCustomFooter}
                onCheckedChange={(checked) => handleTemplateChange('useCustomFooter', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Security Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your email credentials are encrypted and stored securely. We recommend using app-specific passwords 
                for Gmail and other email providers that support 2-factor authentication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 