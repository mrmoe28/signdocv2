'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Package, Settings, Users, MapPin } from 'lucide-react';

interface WorkOrderSettings {
  numbering: {
    prefix: string;
    nextNumber: number;
    autoIncrement: boolean;
  };
  defaults: {
    priority: 'low' | 'normal' | 'high' | 'urgent';
    estimatedHours: number;
    assignmentType: 'auto' | 'manual';
    requireSignature: boolean;
    allowPhotos: boolean;
    instructions: string;
  };
  workflow: {
    autoAssign: boolean;
    requireApproval: boolean;
    enableTracking: boolean;
    allowRescheduling: boolean;
    sendNotifications: boolean;
  };
  fields: {
    showCustomerNotes: boolean;
    showInternalNotes: boolean;
    requireTimeTracking: boolean;
    enableMaterialTracking: boolean;
    showEquipmentNeeded: boolean;
  };
}

const defaultSettings: WorkOrderSettings = {
  numbering: {
    prefix: 'WO-',
    nextNumber: 1001,
    autoIncrement: true,
  },
  defaults: {
    priority: 'normal',
    estimatedHours: 2,
    assignmentType: 'manual',
    requireSignature: true,
    allowPhotos: true,
    instructions: 'Please complete all work according to specifications.',
  },
  workflow: {
    autoAssign: false,
    requireApproval: true,
    enableTracking: true,
    allowRescheduling: true,
    sendNotifications: true,
  },
  fields: {
    showCustomerNotes: true,
    showInternalNotes: true,
    requireTimeTracking: true,
    enableMaterialTracking: true,
    showEquipmentNeeded: true,
  },
};

export function WorkOrders() {
  const [settings, setSettings] = useState<WorkOrderSettings>(defaultSettings);
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

  const handleWorkflowChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      workflow: { ...prev.workflow, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleFieldsChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    alert('Work order settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Order Settings</h1>
          <p className="text-gray-600">Configure work order templates and workflow</p>
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
            <Package className="h-5 w-5" />
            Work Order Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prefix</label>
              <Input
                value={settings.numbering.prefix}
                onChange={(e) => handleNumberingChange('prefix', e.target.value)}
                placeholder="WO-"
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
              <label className="block text-sm font-medium mb-2">Default Priority</label>
              <select
                title="Priority"
                value={settings.defaults.priority}
                onChange={(e) => handleDefaultsChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estimated Hours</label>
              <Input
                type="number"
                step="0.5"
                value={settings.defaults.estimatedHours}
                onChange={(e) => handleDefaultsChange('estimatedHours', parseFloat(e.target.value))}
                min="0.5"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assignment Type</label>
              <select
                title="Assignment Type"
                value={settings.defaults.assignmentType}
                onChange={(e) => handleDefaultsChange('assignmentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="manual">Manual Assignment</option>
                <option value="auto">Auto Assignment</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Require Customer Signature</p>
                <p className="text-sm text-gray-600">Require signature upon completion</p>
              </div>
              <Switch
                checked={settings.defaults.requireSignature}
                onCheckedChange={(checked) => handleDefaultsChange('requireSignature', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Allow Photo Uploads</p>
                <p className="text-sm text-gray-600">Enable before/after photos</p>
              </div>
              <Switch
                checked={settings.defaults.allowPhotos}
                onCheckedChange={(checked) => handleDefaultsChange('allowPhotos', checked)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Instructions</label>
            <Textarea
              value={settings.defaults.instructions}
              onChange={(e) => handleDefaultsChange('instructions', e.target.value)}
              rows={3}
              placeholder="Enter default work instructions..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workflow Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-assign Work Orders</p>
              <p className="text-sm text-gray-600">Automatically assign to available technicians</p>
            </div>
            <Switch
              checked={settings.workflow.autoAssign}
              onCheckedChange={(checked) => handleWorkflowChange('autoAssign', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Approval</p>
              <p className="text-sm text-gray-600">Require manager approval before starting</p>
            </div>
            <Switch
              checked={settings.workflow.requireApproval}
              onCheckedChange={(checked) => handleWorkflowChange('requireApproval', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable GPS Tracking</p>
              <p className="text-sm text-gray-600">Track technician location during work</p>
            </div>
            <Switch
              checked={settings.workflow.enableTracking}
              onCheckedChange={(checked) => handleWorkflowChange('enableTracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Allow Rescheduling</p>
              <p className="text-sm text-gray-600">Technicians can reschedule appointments</p>
            </div>
            <Switch
              checked={settings.workflow.allowRescheduling}
              onCheckedChange={(checked) => handleWorkflowChange('allowRescheduling', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Send Notifications</p>
              <p className="text-sm text-gray-600">Email/SMS notifications for status changes</p>
            </div>
            <Switch
              checked={settings.workflow.sendNotifications}
              onCheckedChange={(checked) => handleWorkflowChange('sendNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fields & Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Fields & Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Show Customer Notes</p>
              <p className="text-sm text-gray-600">Display customer notes to technicians</p>
            </div>
            <Switch
              checked={settings.fields.showCustomerNotes}
              onCheckedChange={(checked) => handleFieldsChange('showCustomerNotes', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Show Internal Notes</p>
              <p className="text-sm text-gray-600">Display internal notes and history</p>
            </div>
            <Switch
              checked={settings.fields.showInternalNotes}
              onCheckedChange={(checked) => handleFieldsChange('showInternalNotes', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Time Tracking</p>
              <p className="text-sm text-gray-600">Mandatory start/stop time tracking</p>
            </div>
            <Switch
              checked={settings.fields.requireTimeTracking}
              onCheckedChange={(checked) => handleFieldsChange('requireTimeTracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable Material Tracking</p>
              <p className="text-sm text-gray-600">Track materials used for each job</p>
            </div>
            <Switch
              checked={settings.fields.enableMaterialTracking}
              onCheckedChange={(checked) => handleFieldsChange('enableMaterialTracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Show Equipment Needed</p>
              <p className="text-sm text-gray-600">Display required tools and equipment</p>
            </div>
            <Switch
              checked={settings.fields.showEquipmentNeeded}
              onCheckedChange={(checked) => handleFieldsChange('showEquipmentNeeded', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 