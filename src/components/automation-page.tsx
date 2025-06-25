'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  Play,
  Pause,
  Settings,
  Clock,
  Mail,
  MessageSquare,
  Target,
  Plus,
  Filter,
  Search,
  Edit,
  Eye,
  BarChart3,
  ArrowRight,
  GitBranch,
  Timer,
  Bell,
  FileText
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  type: 'Email Sequence' | 'Lead Nurturing' | 'Follow-up' | 'Task Assignment' | 'Notification' | 'Workflow';
  status: 'Active' | 'Paused' | 'Draft' | 'Completed';
  trigger: string;
  actions: Array<{
    type: 'Email' | 'SMS' | 'Task' | 'Notification' | 'Wait' | 'Condition';
    description: string;
    delay?: string;
  }>;
  createdDate: string;
  lastRun?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  description?: string;
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'New Lead Welcome Sequence',
    type: 'Email Sequence',
    status: 'Active',
    trigger: 'New lead created',
    actions: [
      { type: 'Email', description: 'Send welcome email immediately' },
      { type: 'Wait', description: 'Wait 1 day', delay: '1 day' },
      { type: 'Email', description: 'Send educational content about solar benefits' },
      { type: 'Wait', description: 'Wait 3 days', delay: '3 days' },
      { type: 'Task', description: 'Create follow-up call task for sales team' }
    ],
    createdDate: '2024-01-01',
    lastRun: '2024-01-18',
    totalRuns: 156,
    successfulRuns: 148,
    failedRuns: 8,
    description: 'Automated welcome sequence for new leads to nurture and educate them about solar energy benefits'
  },
  {
    id: '2',
    name: 'Quote Follow-up Automation',
    type: 'Follow-up',
    status: 'Active',
    trigger: 'Quote sent to customer',
    actions: [
      { type: 'Wait', description: 'Wait 2 days', delay: '2 days' },
      { type: 'Email', description: 'Send quote follow-up email' },
      { type: 'Wait', description: 'Wait 1 week', delay: '1 week' },
      { type: 'Task', description: 'Create follow-up call task' }
    ],
    createdDate: '2024-01-05',
    lastRun: '2024-01-17',
    totalRuns: 89,
    successfulRuns: 85,
    failedRuns: 4,
    description: 'Automated follow-up sequence for quotes to increase conversion rates'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Paused': 'bg-yellow-100 text-yellow-800',
  'Draft': 'bg-gray-100 text-gray-800',
  'Completed': 'bg-blue-100 text-blue-800'
};

const typeColors = {
  'Email Sequence': 'bg-blue-100 text-blue-800',
  'Lead Nurturing': 'bg-purple-100 text-purple-800',
  'Follow-up': 'bg-orange-100 text-orange-800',
  'Task Assignment': 'bg-green-100 text-green-800',
  'Notification': 'bg-yellow-100 text-yellow-800',
  'Workflow': 'bg-indigo-100 text-indigo-800'
};

const actionIcons = {
  'Email': Mail,
  'SMS': MessageSquare,
  'Task': FileText,
  'Notification': Bell,
  'Wait': Timer,
  'Condition': GitBranch
};

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewAutomationForm, setShowNewAutomationForm] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const [newAutomation, setNewAutomation] = useState({
    name: '',
    type: 'Email Sequence' as Automation['type'],
    trigger: '',
    description: ''
  });

  // Calculate automation metrics
  const automationMetrics = useMemo(() => {
    const totalAutomations = mockAutomations.length;
    const activeAutomations = mockAutomations.filter(a => a.status === 'Active').length;
    const totalRuns = mockAutomations.reduce((sum, automation) => sum + automation.totalRuns, 0);
    const successfulRuns = mockAutomations.reduce((sum, automation) => sum + automation.successfulRuns, 0);
    const failedRuns = mockAutomations.reduce((sum, automation) => sum + automation.failedRuns, 0);
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    return {
      totalAutomations,
      activeAutomations,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate
    };
  }, []);

  const filteredAutomations = mockAutomations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateAutomation = () => {
    console.log('Creating new automation:', newAutomation);
    setShowNewAutomationForm(false);
    setNewAutomation({
      name: '',
      type: 'Email Sequence',
      trigger: '',
      description: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-600">Automate your business processes and workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowNewAutomationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Automations</p>
                    <p className="text-2xl font-bold text-gray-900">{automationMetrics.activeAutomations}</p>
                    <p className="text-sm text-gray-500">
                      of {automationMetrics.totalAutomations} total
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(automationMetrics.totalRuns)}
                    </p>
                    <p className="text-sm text-green-600">
                      {formatPercentage(automationMetrics.successRate)} success rate
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-gray-900">45 hrs</p>
                    <p className="text-sm text-gray-500">Per week</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(automationMetrics.successRate)}
                    </p>
                    <p className="text-sm text-gray-500">Overall performance</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Automation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAutomations.map(automation => (
                    <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeColors[automation.type]}`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{automation.name}</p>
                          <p className="text-xs text-gray-600">
                            {automation.lastRun ? `Last run: ${formatDate(automation.lastRun)}` : 'Never run'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[automation.status]}>
                          {automation.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {automation.totalRuns} runs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Successful Runs</span>
                    <span className="font-bold text-green-600">
                      {formatNumber(automationMetrics.successfulRuns)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="font-medium">Failed Runs</span>
                    <span className="font-bold text-red-600">
                      {formatNumber(automationMetrics.failedRuns)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Success Rate</span>
                    <span className="font-bold text-blue-600">
                      {formatPercentage(automationMetrics.successRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Cost Savings</span>
                    <span className="font-bold text-purple-600">$4,500/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Automations List */}
          <div className="space-y-4">
            {filteredAutomations.map(automation => {
              const successRate = automation.totalRuns > 0 ? (automation.successfulRuns / automation.totalRuns) * 100 : 0;
              
              return (
                <Card key={automation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{automation.name}</h3>
                          <Badge className={statusColors[automation.status]}>
                            {automation.status}
                          </Badge>
                          <Badge className={typeColors[automation.type]}>
                            {automation.type}
                          </Badge>
                        </div>
                        
                        {automation.description && (
                          <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Trigger:</span> {automation.trigger}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(automation.createdDate)}
                          </div>
                          {automation.lastRun && (
                            <div>
                              <span className="font-medium">Last Run:</span> {formatDate(automation.lastRun)}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <p className="text-lg font-bold text-blue-600">{automation.totalRuns}</p>
                            <p className="text-xs text-gray-600">Total Runs</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <p className="text-lg font-bold text-green-600">{automation.successfulRuns}</p>
                            <p className="text-xs text-gray-600">Successful</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded">
                            <p className="text-lg font-bold text-red-600">{automation.failedRuns}</p>
                            <p className="text-xs text-gray-600">Failed</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <p className="text-lg font-bold text-purple-600">{formatPercentage(successRate)}</p>
                            <p className="text-xs text-gray-600">Success Rate</p>
                          </div>
                        </div>

                        {/* Action Flow Preview */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Action Flow:</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {automation.actions.slice(0, 4).map((action, index) => {
                              const ActionIcon = actionIcons[action.type];
                              return (
                                <div key={index} className="flex items-center gap-1">
                                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                    <ActionIcon className="h-3 w-3" />
                                    <span>{action.type}</span>
                                  </div>
                                  {index < Math.min(automation.actions.length - 1, 3) && (
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              );
                            })}
                            {automation.actions.length > 4 && (
                              <span className="text-xs text-gray-500">+{automation.actions.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedAutomation(automation)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {automation.status === 'Active' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Performance analytics chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Savings Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Hours Saved This Month</span>
                    <span className="font-bold text-green-600">180 hrs</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Tasks Automated</span>
                    <span className="font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Cost Savings</span>
                    <span className="font-bold text-purple-600">$4,500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="font-medium">Efficiency Gain</span>
                    <span className="font-bold text-orange-600">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Automation Form Modal */}
      {showNewAutomationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Automation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="automationName">Automation Name *</Label>
                  <Input
                    id="automationName"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., New Lead Welcome Sequence"
                  />
                </div>
                <div>
                  <Label htmlFor="automationType">Type *</Label>
                  <Select value={newAutomation.type} onValueChange={(value: Automation['type']) => setNewAutomation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email Sequence">Email Sequence</SelectItem>
                      <SelectItem value="Lead Nurturing">Lead Nurturing</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Task Assignment">Task Assignment</SelectItem>
                      <SelectItem value="Notification">Notification</SelectItem>
                      <SelectItem value="Workflow">Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="trigger">Trigger Event *</Label>
                <Input
                  id="trigger"
                  value={newAutomation.trigger}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, trigger: e.target.value }))}
                  placeholder="e.g., New lead created, Quote sent, Contract signed"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this automation does and its purpose"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewAutomationForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAutomation}>
                  Create Automation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automation Details Modal */}
      {selectedAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedAutomation.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedAutomation(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedAutomation.status]}>
                  {selectedAutomation.status}
                </Badge>
                <Badge className={typeColors[selectedAutomation.type]}>
                  {selectedAutomation.type}
                </Badge>
              </div>
              
              {selectedAutomation.description && (
                <p className="text-gray-600">{selectedAutomation.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger</Label>
                  <p className="text-sm mt-1">{selectedAutomation.trigger}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm mt-1">{formatDate(selectedAutomation.createdDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-xl font-bold text-blue-600">{selectedAutomation.totalRuns}</p>
                  <p className="text-sm text-gray-600">Total Runs</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-xl font-bold text-green-600">{selectedAutomation.successfulRuns}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <p className="text-xl font-bold text-red-600">{selectedAutomation.failedRuns}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>

              <div>
                <Label>Action Flow</Label>
                <div className="space-y-3 mt-2">
                  {selectedAutomation.actions.map((action, index) => {
                    const ActionIcon = actionIcons[action.type];
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{index + 1}</span>
                          <ActionIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.description}</p>
                          {action.delay && (
                            <p className="text-xs text-gray-600">Delay: {action.delay}</p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {action.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 