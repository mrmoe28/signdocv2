'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Users,
  Shield,
  Database,
  Plug,
  Bell,
  Palette,
  Key,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Save,
  Plus,
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Zap,
  FileText,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'Payment' | 'Communication' | 'Analytics' | 'CRM' | 'Marketing' | 'Storage';
  status: 'Connected' | 'Disconnected' | 'Error' | 'Pending';
  icon: string;
  lastSync?: string;
  features: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales' | 'Support' | 'Installer';
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;
  permissions: string[];
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    category: 'Payment',
    status: 'Connected',
    icon: '💳',
    lastSync: '2024-01-18T10:30:00Z',
    features: ['Payment Processing', 'Subscription Billing', 'Invoicing', 'Refunds']
  },
  {
    id: '2',
    name: 'Google Analytics',
    description: 'Website traffic and user behavior analytics',
    category: 'Analytics',
    status: 'Connected',
    icon: '📊',
    lastSync: '2024-01-18T09:15:00Z',
    features: ['Traffic Analysis', 'Conversion Tracking', 'User Behavior', 'Goal Tracking']
  },
  {
    id: '3',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    category: 'Marketing',
    status: 'Disconnected',
    icon: '📧',
    features: ['Email Campaigns', 'Automation', 'Audience Management', 'Analytics']
  },
  {
    id: '4',
    name: 'Salesforce',
    description: 'Customer relationship management system',
    category: 'CRM',
    status: 'Error',
    icon: '🏢',
    features: ['Contact Management', 'Lead Tracking', 'Sales Pipeline', 'Reporting']
  },
  {
    id: '5',
    name: 'Twilio',
    description: 'SMS and voice communication services',
    category: 'Communication',
    status: 'Pending',
    icon: '📱',
    features: ['SMS Messaging', 'Voice Calls', 'WhatsApp', 'Verification']
  },
  {
    id: '6',
    name: 'Google Drive',
    description: 'Cloud storage and file management',
    category: 'Storage',
    status: 'Connected',
    icon: '☁️',
    lastSync: '2024-01-18T11:45:00Z',
    features: ['File Storage', 'Document Sharing', 'Backup', 'Collaboration']
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-18T14:30:00Z',
    permissions: ['All Access', 'User Management', 'System Settings', 'Financial Data']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-18T13:15:00Z',
    permissions: ['Sales Management', 'Customer Data', 'Reporting', 'Team Management']
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@company.com',
    role: 'Sales',
    status: 'Active',
    lastLogin: '2024-01-18T12:45:00Z',
    permissions: ['Lead Management', 'Customer Contact', 'Quote Creation', 'Basic Reporting']
  },
  {
    id: '4',
    name: 'Lisa Brown',
    email: 'lisa@company.com',
    role: 'Support',
    status: 'Inactive',
    lastLogin: '2024-01-15T16:20:00Z',
    permissions: ['Customer Support', 'Ticket Management', 'Knowledge Base']
  }
];

const statusColors = {
  'Connected': 'bg-green-100 text-green-800',
  'Disconnected': 'bg-gray-100 text-gray-800',
  'Error': 'bg-red-100 text-red-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800'
};

const roleColors = {
  'Admin': 'bg-purple-100 text-purple-800',
  'Manager': 'bg-blue-100 text-blue-800',
  'Sales': 'bg-green-100 text-green-800',
  'Support': 'bg-orange-100 text-orange-800',
  'Installer': 'bg-gray-100 text-gray-800'
};

export function MorePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    desktop: false
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">More</h1>
          <p className="text-gray-600">System settings, integrations, and administration</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('settings')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">General Settings</h3>
                    <p className="text-sm text-gray-600">Configure app preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('users')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">User Management</h3>
                    <p className="text-sm text-gray-600">Manage team access</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('integrations')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Plug className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Integrations</h3>
                    <p className="text-sm text-gray-600">Connect external services</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('system')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Database className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">System Status</h3>
                    <p className="text-sm text-gray-600">Monitor system health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">API Status</span>
                    </div>
                    <span className="text-green-600 font-bold">Operational</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Database</span>
                    </div>
                    <span className="text-green-600 font-bold">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Backup Status</span>
                    </div>
                    <span className="text-yellow-600 font-bold">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Security</span>
                    </div>
                    <span className="text-green-600 font-bold">Secure</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <div className="p-2 bg-blue-100 rounded">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">New user added</p>
                      <p className="text-xs text-gray-600">Mike Wilson joined as Sales rep</p>
                    </div>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <div className="p-2 bg-green-100 rounded">
                      <Plug className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Integration updated</p>
                      <p className="text-xs text-gray-600">Stripe webhook configured</p>
                    </div>
                    <span className="text-xs text-gray-500">4h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <div className="p-2 bg-orange-100 rounded">
                      <Database className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Backup completed</p>
                      <p className="text-xs text-gray-600">Daily backup successful</p>
                    </div>
                    <span className="text-xs text-gray-500">6h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockIntegrations.map(integration => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Badge className={statusColors[integration.status]}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  
                  {integration.lastSync && (
                    <p className="text-xs text-gray-500 mb-4">
                      Last sync: {formatDate(integration.lastSync)}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {integration.status === 'Connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1">
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>

          <div className="space-y-4">
            {mockUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={roleColors[user.role]}>
                            {user.role}
                          </Badge>
                          <Badge className={statusColors[user.status]}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {user.lastLogin && (
                        <p className="text-sm text-gray-600 mb-2">
                          Last login: {formatDate(user.lastLogin)}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="EKO SOLAR" />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input id="companyEmail" type="email" defaultValue="info@ekosolar.com" />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input id="companyPhone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea id="companyAddress" defaultValue="123 Solar Street, Atlanta, GA 30309" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Browser notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Desktop Notifications</p>
                    <p className="text-sm text-gray-600">System notifications</p>
                  </div>
                  <Switch
                    checked={notifications.desktop}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxx"
                      readOnly
                    />
                    <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input id="webhookUrl" defaultValue="https://api.ekosolar.com/webhooks" />
                </div>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="8h">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Policy</p>
                    <p className="text-sm text-gray-600">Minimum password requirements</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-gray-600">Download complete database backup</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">Import Data</p>
                    <p className="text-sm text-gray-600">Upload data from backup file</p>
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-gray-600">Clear application cache and temp files</p>
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Application Version</span>
                  <span>v2.1.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Database Version</span>
                  <span>PostgreSQL 14.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Update</span>
                  <span>Jan 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Uptime</span>
                  <span>15 days, 4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Storage Used</span>
                  <span>2.3 GB / 10 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Active Users</span>
                  <span>4 / 10</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800">Scheduled Maintenance</p>
                  </div>
                  <p className="text-sm text-yellow-700">
                    System maintenance scheduled for Jan 25, 2024 at 2:00 AM EST.
                    Expected downtime: 2 hours.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run System Diagnostics
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700 mb-3">
                    These actions cannot be undone. Please proceed with caution.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Customer Data
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Factory Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 