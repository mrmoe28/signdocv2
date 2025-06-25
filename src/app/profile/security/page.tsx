'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react';

export default function SecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwords.new.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    console.log('Changing password...');
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    if (!twoFactorEnabled) {
      alert('Two-factor authentication setup initiated. Please check your email for instructions.');
    } else {
      alert('Two-factor authentication disabled.');
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log('Revoking session:', sessionId);
    alert('Session revoked successfully!');
  };

  const activeSessions = [
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'Atlanta, GA',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'Atlanta, GA',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: '3',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      lastActive: '2 days ago',
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-600">Manage your account security and privacy settings</p>
        </div>

        <div className="space-y-6">
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Settings
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => handlePasswordChange('current', e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => handlePasswordChange('new', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                </AlertDescription>
              </Alert>

              <Button onClick={handleChangePassword} className="w-full sm:w-auto">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Two-Factor Authentication</Label>
                    {twoFactorEnabled && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled 
                      ? 'Your account is protected with 2FA' 
                      : 'Secure your account with an authenticator app'
                    }
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleEnable2FA}
                />
              </div>

              {twoFactorEnabled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                                         Two-factor authentication is active. You&apos;ll need your authenticator app to sign in.
                  </AlertDescription>
                </Alert>
              )}

              {!twoFactorEnabled && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How to enable 2FA:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Download an authenticator app like Google Authenticator or Authy</li>
                    <li>Toggle the switch above to enable 2FA</li>
                    <li>Follow the setup instructions sent to your email</li>
                    <li>Scan the QR code with your authenticator app</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices that are currently signed in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Smartphone className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.device}</span>
                          {session.current && (
                            <Badge variant="secondary" className="text-xs">
                              Current session
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.lastActive}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security Recommendations
              </CardTitle>
              <CardDescription>
                Follow these best practices to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Strong Password</h4>
                    <p className="text-sm text-gray-500">Your password meets security requirements</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  {twoFactorEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      {twoFactorEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Enable 2FA for enhanced security'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email Verified</h4>
                    <p className="text-sm text-gray-500">Your email address is verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 