'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Target,
  Clock,
  Filter,
  Search,
  Eye,
  Share,
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';

interface ReportData {
  id: string;
  name: string;
  type: 'Financial' | 'Sales' | 'Marketing' | 'Operations' | 'Customer';
  description: string;
  lastGenerated: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'On-demand';
  status: 'Ready' | 'Generating' | 'Scheduled' | 'Error';
  fileSize?: string;
  insights?: string[];
}

interface FinancialMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  profit: {
    current: number;
    previous: number;
    growth: number;
  };
  expenses: {
    current: number;
    previous: number;
    growth: number;
  };
  cashFlow: {
    current: number;
    previous: number;
    growth: number;
  };
}

const mockReports: ReportData[] = [
  {
    id: '1',
    name: 'Monthly Financial Summary',
    type: 'Financial',
    description: 'Comprehensive overview of revenue, expenses, and profit margins',
    lastGenerated: '2024-01-18',
    frequency: 'Monthly',
    status: 'Ready',
    fileSize: '2.3 MB',
    insights: [
      'Revenue increased by 23% compared to last month',
      'Operating expenses remained stable',
      'Profit margin improved to 18.5%'
    ]
  },
  {
    id: '2',
    name: 'Sales Performance Report',
    type: 'Sales',
    description: 'Detailed analysis of sales metrics, conversion rates, and team performance',
    lastGenerated: '2024-01-17',
    frequency: 'Weekly',
    status: 'Ready',
    fileSize: '1.8 MB',
    insights: [
      'Conversion rate improved by 12%',
      'Average deal size increased to $8,450',
      'Sales cycle reduced by 3 days'
    ]
  },
  {
    id: '3',
    name: 'Marketing ROI Analysis',
    type: 'Marketing',
    description: 'Campaign performance, lead generation, and marketing spend effectiveness',
    lastGenerated: '2024-01-16',
    frequency: 'Monthly',
    status: 'Ready',
    fileSize: '3.1 MB',
    insights: [
      'Google Ads generated 45% of qualified leads',
      'Email campaigns showed 34% open rate',
      'Social media engagement up 67%'
    ]
  },
  {
    id: '4',
    name: 'Customer Satisfaction Survey',
    type: 'Customer',
    description: 'Customer feedback, satisfaction scores, and service quality metrics',
    lastGenerated: '2024-01-15',
    frequency: 'Quarterly',
    status: 'Generating',
    insights: [
      'Overall satisfaction score: 4.7/5',
      'Installation quality rated highest',
      'Response time needs improvement'
    ]
  },
  {
    id: '5',
    name: 'Operational Efficiency Report',
    type: 'Operations',
    description: 'Project timelines, resource utilization, and operational KPIs',
    lastGenerated: '2024-01-14',
    frequency: 'Weekly',
    status: 'Ready',
    fileSize: '1.5 MB',
    insights: [
      'Average project completion: 14 days',
      'Resource utilization at 87%',
      'Quality score improved to 96%'
    ]
  }
];

const mockFinancialMetrics: FinancialMetrics = {
  revenue: {
    current: 245000,
    previous: 198000,
    growth: 23.7
  },
  profit: {
    current: 45300,
    previous: 35600,
    growth: 27.2
  },
  expenses: {
    current: 199700,
    previous: 162400,
    growth: 23.0
  },
  cashFlow: {
    current: 67800,
    previous: 52100,
    growth: 30.1
  }
};

const statusColors = {
  'Ready': 'bg-green-100 text-green-800',
  'Generating': 'bg-yellow-100 text-yellow-800',
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Error': 'bg-red-100 text-red-800'
};

const typeColors = {
  'Financial': 'bg-green-100 text-green-800',
  'Sales': 'bg-blue-100 text-blue-800',
  'Marketing': 'bg-purple-100 text-purple-800',
  'Operations': 'bg-orange-100 text-orange-800',
  'Customer': 'bg-pink-100 text-pink-800'
};

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Reports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="reports">All Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="period">Time Period:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockFinancialMetrics.revenue.current)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {React.createElement(getGrowthIcon(mockFinancialMetrics.revenue.growth), {
                        className: `h-4 w-4 ${getGrowthColor(mockFinancialMetrics.revenue.growth)}`
                      })}
                      <span className={`text-sm ${getGrowthColor(mockFinancialMetrics.revenue.growth)}`}>
                        {formatPercentage(mockFinancialMetrics.revenue.growth)}
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockFinancialMetrics.profit.current)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {React.createElement(getGrowthIcon(mockFinancialMetrics.profit.growth), {
                        className: `h-4 w-4 ${getGrowthColor(mockFinancialMetrics.profit.growth)}`
                      })}
                      <span className={`text-sm ${getGrowthColor(mockFinancialMetrics.profit.growth)}`}>
                        {formatPercentage(mockFinancialMetrics.profit.growth)}
                      </span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockFinancialMetrics.expenses.current)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {React.createElement(getGrowthIcon(mockFinancialMetrics.expenses.growth), {
                        className: `h-4 w-4 ${getGrowthColor(-mockFinancialMetrics.expenses.growth)}`
                      })}
                      <span className={`text-sm ${getGrowthColor(-mockFinancialMetrics.expenses.growth)}`}>
                        {formatPercentage(mockFinancialMetrics.expenses.growth)}
                      </span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockFinancialMetrics.cashFlow.current)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {React.createElement(getGrowthIcon(mockFinancialMetrics.cashFlow.growth), {
                        className: `h-4 w-4 ${getGrowthColor(mockFinancialMetrics.cashFlow.growth)}`
                      })}
                      <span className={`text-sm ${getGrowthColor(mockFinancialMetrics.cashFlow.growth)}`}>
                        {formatPercentage(mockFinancialMetrics.cashFlow.growth)}
                      </span>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Revenue trend chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReports.slice(0, 4).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeColors[report.type]}`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{report.name}</p>
                          <p className="text-xs text-gray-600">
                            Generated: {formatDate(report.lastGenerated)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[report.status]}>
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Revenue Growth</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(mockFinancialMetrics.revenue.growth)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Profit Margin</p>
                      <p className="text-2xl font-bold text-blue-600">18.5%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Operating Efficiency</p>
                      <p className="text-2xl font-bold text-purple-600">87%</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Expense breakdown chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.filter(report => report.type === 'Financial').map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{report.name}</h3>
                        <Badge className={statusColors[report.status]}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Generated: {formatDate(report.lastGenerated)}</span>
                        <span>Frequency: {report.frequency}</span>
                        {report.fileSize && <span>Size: {report.fileSize}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Generating">Generating</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{report.name}</h3>
                        <Badge className={statusColors[report.status]}>
                          {report.status}
                        </Badge>
                        <Badge className={typeColors[report.type]}>
                          {report.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Last Generated:</span> {formatDate(report.lastGenerated)}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {report.frequency}
                        </div>
                        {report.fileSize && (
                          <div>
                            <span className="font-medium">File Size:</span> {report.fileSize}
                          </div>
                        )}
                      </div>

                      {report.insights && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Key Insights:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.insights.map((insight, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      {report.status === 'Ready' && (
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Performance trends chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Customer Acquisition Cost</span>
                    <span className="font-bold text-green-600">$245</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Customer Lifetime Value</span>
                    <span className="font-bold text-blue-600">$12,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Monthly Recurring Revenue</span>
                    <span className="font-bold text-purple-600">$45,200</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="font-medium">Churn Rate</span>
                    <span className="font-bold text-orange-600">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Sales funnel visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Customer segmentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Growth rate analysis</p>
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