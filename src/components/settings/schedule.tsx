'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Settings, Bell, MapPin } from 'lucide-react';

interface ScheduleSettings {
  workingHours: {
    monday: { enabled: boolean; start: string; end: string; };
    tuesday: { enabled: boolean; start: string; end: string; };
    wednesday: { enabled: boolean; start: string; end: string; };
    thursday: { enabled: boolean; start: string; end: string; };
    friday: { enabled: boolean; start: string; end: string; };
    saturday: { enabled: boolean; start: string; end: string; };
    sunday: { enabled: boolean; start: string; end: string; };
  };
  appointments: {
    defaultDuration: number;
    bufferTime: number;
    allowWeekendBookings: boolean;
    advanceBookingDays: number;
    requireApproval: boolean;
    sendReminders: boolean;
    reminderHours: number;
  };
  availability: {
    autoBlock: boolean;
    showAvailability: boolean;
    maxDailyAppointments: number;
  };
}

const defaultSettings: ScheduleSettings = {
  workingHours: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '15:00' },
    sunday: { enabled: false, start: '10:00', end: '14:00' },
  },
  appointments: {
    defaultDuration: 60,
    bufferTime: 15,
    allowWeekendBookings: false,
    advanceBookingDays: 30,
    requireApproval: true,
    sendReminders: true,
    reminderHours: 24,
  },
  availability: {
    autoBlock: true,
    showAvailability: true,
    maxDailyAppointments: 8,
  },
};

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Schedule() {
  const [settings, setSettings] = useState<ScheduleSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleWorkingHourChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleAppointmentChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      appointments: {
        ...prev.appointments,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleAvailabilityChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings logic would go here
    setHasChanges(false);
    alert('Schedule settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Settings</h1>
          <p className="text-gray-600">Configure your working hours and appointment preferences</p>
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

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dayNames.map((day, index) => {
            const daySettings = settings.workingHours[day as keyof typeof settings.workingHours];
            return (
              <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={daySettings.enabled}
                    onCheckedChange={(checked) => handleWorkingHourChange(day, 'enabled', checked)}
                  />
                  <span className="font-medium w-20">{dayLabels[index]}</span>
                </div>
                {daySettings.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={daySettings.start}
                      onChange={(e) => handleWorkingHourChange(day, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={daySettings.end}
                      onChange={(e) => handleWorkingHourChange(day, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
                {!daySettings.enabled && (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Duration (minutes)</label>
              <Input
                type="number"
                value={settings.appointments.defaultDuration}
                onChange={(e) => handleAppointmentChange('defaultDuration', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Buffer Time (minutes)</label>
              <Input
                type="number"
                value={settings.appointments.bufferTime}
                onChange={(e) => handleAppointmentChange('bufferTime', parseInt(e.target.value))}
                min="0"
                max="60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Advance Booking (days)</label>
              <Input
                type="number"
                value={settings.appointments.advanceBookingDays}
                onChange={(e) => handleAppointmentChange('advanceBookingDays', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reminder Hours Before</label>
              <Input
                type="number"
                value={settings.appointments.reminderHours}
                onChange={(e) => handleAppointmentChange('reminderHours', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Allow Weekend Bookings</p>
                <p className="text-sm text-gray-600">Enable appointments on Saturday and Sunday</p>
              </div>
              <Switch
                checked={settings.appointments.allowWeekendBookings}
                onCheckedChange={(checked) => handleAppointmentChange('allowWeekendBookings', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Require Approval</p>
                <p className="text-sm text-gray-600">All appointments need manual approval</p>
              </div>
              <Switch
                checked={settings.appointments.requireApproval}
                onCheckedChange={(checked) => handleAppointmentChange('requireApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <div>
                  <p className="font-medium">Send Reminders</p>
                  <p className="text-sm text-gray-600">Automatic email/SMS reminders</p>
                </div>
              </div>
              <Switch
                checked={settings.appointments.sendReminders}
                onCheckedChange={(checked) => handleAppointmentChange('sendReminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Max Daily Appointments</label>
            <Input
              type="number"
              value={settings.availability.maxDailyAppointments}
              onChange={(e) => handleAvailabilityChange('maxDailyAppointments', parseInt(e.target.value))}
              min="1"
              max="50"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                                 <p className="font-medium">Auto-block Unavailable Times</p>
                 <p className="text-sm text-gray-600">Automatically block times when you&apos;re not available</p>
              </div>
              <Switch
                checked={settings.availability.autoBlock}
                onCheckedChange={(checked) => handleAvailabilityChange('autoBlock', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Show Availability to Customers</p>
                <p className="text-sm text-gray-600">Display your available time slots publicly</p>
              </div>
              <Switch
                checked={settings.availability.showAvailability}
                onCheckedChange={(checked) => handleAvailabilityChange('showAvailability', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="h-5 w-5" />
              <span>Manage Locations</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Team Availability</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 