'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Smartphone, Clock, DollarSign } from 'lucide-react';

interface NotificationSettings {
  email: {
    enabled: boolean;
    invoiceCreated: boolean;
    paymentReceived: boolean;
    paymentOverdue: boolean;
    estimateAccepted: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  push: {
    enabled: boolean;
    invoiceCreated: boolean;
    paymentReceived: boolean;
    paymentOverdue: boolean;
    estimateAccepted: boolean;
  };
  sms: {
    enabled: boolean;
    paymentReceived: boolean;
    paymentOverdue: boolean;
    urgentReminders: boolean;
  };
  schedule: {
    overdueReminderDays: number;
    reportDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    reportTime: string;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    invoiceCreated: true,
    paymentReceived: true,
    paymentOverdue: true,
    estimateAccepted: true,
    weeklyReports: false,
    monthlyReports: true
  },
  push: {
    enabled: true,
    invoiceCreated: false,
    paymentReceived: true,
    paymentOverdue: true,
    estimateAccepted: true
  },
  sms: {
    enabled: false,
    paymentReceived: false,
    paymentOverdue: false,
    urgentReminders: false
  },
  schedule: {
    overdueReminderDays: 7,
    reportDay: 'monday',
    reportTime: '09:00'
  }
};

export function Notifications() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEmailChange = (field: keyof NotificationSettings['email'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }));
    setHasChanges(true);
  };

  const handlePushChange = (field: keyof NotificationSettings['push'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSmsChange = (field: keyof NotificationSettings['sms'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleScheduleChange = (field: keyof NotificationSettings['schedule'], value: string | number) => {
    setSettings(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings logic would go here
    setHasChanges(false);
    alert('Notification settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notification preferences and settings</p>
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

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
            <Badge variant={settings.email.enabled ? 'default' : 'secondary'}>
              {settings.email.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Enable Email Notifications</label>
              <p className="text-sm text-gray-500">Turn on/off all email notifications</p>
            </div>
            <Switch
              checked={settings.email.enabled}
              onCheckedChange={(checked) => handleEmailChange('enabled', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Invoice Created</label>
                <p className="text-xs text-gray-500">Notify when new invoices are created</p>
              </div>
              <Switch
                checked={settings.email.invoiceCreated}
                onCheckedChange={(checked) => handleEmailChange('invoiceCreated', checked)}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Received</label>
                <p className="text-xs text-gray-500">Notify when payments are received</p>
              </div>
              <Switch
                checked={settings.email.paymentReceived}
                onCheckedChange={(checked) => handleEmailChange('paymentReceived', checked)}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Overdue</label>
                <p className="text-xs text-gray-500">Alert when payments become overdue</p>
              </div>
              <Switch
                checked={settings.email.paymentOverdue}
                onCheckedChange={(checked) => handleEmailChange('paymentOverdue', checked)}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Estimate Accepted</label>
                <p className="text-xs text-gray-500">Notify when estimates are accepted</p>
              </div>
              <Switch
                checked={settings.email.estimateAccepted}
                onCheckedChange={(checked) => handleEmailChange('estimateAccepted', checked)}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Weekly Reports</label>
                <p className="text-xs text-gray-500">Weekly business summary reports</p>
              </div>
              <Switch
                checked={settings.email.weeklyReports}
                onCheckedChange={(checked) => handleEmailChange('weeklyReports', checked)}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Monthly Reports</label>
                <p className="text-xs text-gray-500">Monthly business summary reports</p>
              </div>
              <Switch
                checked={settings.email.monthlyReports}
                onCheckedChange={(checked) => handleEmailChange('monthlyReports', checked)}
                disabled={!settings.email.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
            <Badge variant={settings.push.enabled ? 'default' : 'secondary'}>
              {settings.push.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Enable Push Notifications</label>
              <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
            </div>
            <Switch
              checked={settings.push.enabled}
              onCheckedChange={(checked) => handlePushChange('enabled', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Invoice Created</label>
                <p className="text-xs text-gray-500">Push notification for new invoices</p>
              </div>
              <Switch
                checked={settings.push.invoiceCreated}
                onCheckedChange={(checked) => handlePushChange('invoiceCreated', checked)}
                disabled={!settings.push.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Received</label>
                <p className="text-xs text-gray-500">Instant notification when paid</p>
              </div>
              <Switch
                checked={settings.push.paymentReceived}
                onCheckedChange={(checked) => handlePushChange('paymentReceived', checked)}
                disabled={!settings.push.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Overdue</label>
                <p className="text-xs text-gray-500">Alert for overdue payments</p>
              </div>
              <Switch
                checked={settings.push.paymentOverdue}
                onCheckedChange={(checked) => handlePushChange('paymentOverdue', checked)}
                disabled={!settings.push.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Estimate Accepted</label>
                <p className="text-xs text-gray-500">Notification when estimates accepted</p>
              </div>
              <Switch
                checked={settings.push.estimateAccepted}
                onCheckedChange={(checked) => handlePushChange('estimateAccepted', checked)}
                disabled={!settings.push.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
            <Badge variant={settings.sms.enabled ? 'default' : 'secondary'}>
              {settings.sms.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium">Enable SMS Notifications</label>
              <p className="text-sm text-gray-500">Text message notifications to your phone</p>
            </div>
            <Switch
              checked={settings.sms.enabled}
              onCheckedChange={(checked) => handleSmsChange('enabled', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Received</label>
                <p className="text-xs text-gray-500">SMS when payments come in</p>
              </div>
              <Switch
                checked={settings.sms.paymentReceived}
                onCheckedChange={(checked) => handleSmsChange('paymentReceived', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Payment Overdue</label>
                <p className="text-xs text-gray-500">SMS alerts for overdue payments</p>
              </div>
              <Switch
                checked={settings.sms.paymentOverdue}
                onCheckedChange={(checked) => handleSmsChange('paymentOverdue', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Urgent Reminders</label>
                <p className="text-xs text-gray-500">Critical payment reminders</p>
              </div>
              <Switch
                checked={settings.sms.urgentReminders}
                onCheckedChange={(checked) => handleSmsChange('urgentReminders', checked)}
                disabled={!settings.sms.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Overdue Reminder Frequency</label>
            <select
              title="Overdue Reminder Days"
              value={settings.schedule.overdueReminderDays}
              onChange={(e) => handleScheduleChange('overdueReminderDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>Daily</option>
              <option value={3}>Every 3 days</option>
              <option value={7}>Weekly</option>
              <option value={14}>Every 2 weeks</option>
              <option value={30}>Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Day</label>
              <select
                title="Report Day"
                value={settings.schedule.reportDay}
                onChange={(e) => handleScheduleChange('reportDay', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Report Time</label>
              <input
                type="time"
                value={settings.schedule.reportTime}
                onChange={(e) => handleScheduleChange('reportTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 