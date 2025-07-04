'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  DollarSign,
  Activity,
  RefreshCw,
  Settings,
  Plus,
  Download,
  Calendar,
  Users,
  FileTextIcon,
  Target,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import React from 'react';

interface ReportData {
  totalRevenue: number;
  totalCustomers: number;
  totalInvoices: number;
  totalDocuments: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: Array<{ month: string; revenue: number; invoices: number }>;
  customerTypes: Array<{ type: string; count: number; value: number }>;
  paymentStatus: Array<{ status: string; count: number; amount: number }>;
  recentActivity: Array<{ date: string; type: string; description: string; amount?: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = async () => {
    try {
      setRefreshing(true);
      const [customersRes, invoicesRes, documentsRes, paymentsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/invoices'),
        fetch('/api/documents'),
        fetch('/api/payments')
      ]);

      const [customers, invoices, documents, payments] = await Promise.all([
        customersRes.json(),
        invoicesRes.json(),
        documentsRes.json(),
        paymentsRes.json()
      ]);

      // Process data for analytics
      const safeCustomers = Array.isArray(customers.customers) ? customers.customers : [];
      const safeInvoices = Array.isArray(invoices.invoices) ? invoices.invoices : [];
      const safeDocuments = Array.isArray(documents.documents) ? documents.documents : [];
      const safePayments = Array.isArray(payments.payments) ? payments.payments : [];

      // Calculate metrics
      const totalRevenue = safeInvoices.reduce((sum: number, inv: any) =>
        sum + (inv.status === 'paid' ? (inv.total || 0) : 0), 0);

      const paidInvoices = safeInvoices.filter((inv: any) => inv.status === 'paid').length;
      const pendingInvoices = safeInvoices.filter((inv: any) => inv.status === 'pending').length;
      const overdueInvoices = safeInvoices.filter((inv: any) => inv.status === 'overdue').length;

      // Customer types breakdown
      const commercial = safeCustomers.filter((c: any) => c.customerType === 'commercial').length;
      const residential = safeCustomers.filter((c: any) => c.customerType === 'residential').length;

      // Monthly revenue data (mock data for demonstration)
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - 5 + i + 12) % 12;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month: monthNames[monthIndex],
          revenue: Math.floor(Math.random() * 50000) + 10000,
          invoices: Math.floor(Math.random() * 20) + 5
        };
      });

      const reportData: ReportData = {
        totalRevenue,
        totalCustomers: safeCustomers.length,
        totalInvoices: safeInvoices.length,
        totalDocuments: safeDocuments.length,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        monthlyRevenue,
        customerTypes: [
          { type: 'Commercial', count: commercial, value: commercial },
          { type: 'Residential', count: residential, value: residential }
        ],
        paymentStatus: [
          { status: 'Paid', count: paidInvoices, amount: totalRevenue },
          { status: 'Pending', count: pendingInvoices, amount: 0 },
          { status: 'Overdue', count: overdueInvoices, amount: 0 }
        ],
        recentActivity: [
          { date: new Date().toISOString(), type: 'invoice', description: 'New invoice created', amount: 2500 },
          { date: new Date().toISOString(), type: 'payment', description: 'Payment received', amount: 1800 },
          { date: new Date().toISOString(), type: 'customer', description: 'New customer added' },
          { date: new Date().toISOString(), type: 'document', description: 'Document signed' }
        ]
      };

      setData(reportData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = () => {
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', formatCurrency(data?.totalRevenue || 0)],
      ['Total Customers', data?.totalCustomers || 0],
      ['Total Invoices', data?.totalInvoices || 0],
      ['Paid Invoices', data?.paidInvoices || 0],
      ['Pending Invoices', data?.pendingInvoices || 0],
      ['Overdue Invoices', data?.overdueInvoices || 0]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchReportData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(data?.totalRevenue || 0)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">{data?.totalCustomers || 0}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-500">+{data?.totalCustomers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Invoices</p>
                    <p className="text-2xl font-bold">{data?.totalInvoices || 0}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileTextIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-500">+{data?.paidInvoices || 0} paid</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documents</p>
                    <p className="text-2xl font-bold">{data?.totalDocuments || 0}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-500">Total docs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.monthlyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Invoice Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.paymentStatus || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {(data?.paymentStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data?.recentActivity || []).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {activity.type === 'invoice' && <FileTextIcon className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                        {activity.type === 'customer' && <Users className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'document' && <FileText className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(activity.amount)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(data?.totalRevenue || 0)}</p>
                <p className="text-sm text-gray-500">Total revenue collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.pendingInvoices || 0}</p>
                <p className="text-sm text-gray-500">Invoices awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.overdueInvoices || 0}</p>
                <p className="text-sm text-gray-500">Overdue invoices</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.customerTypes || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {(data?.customerTypes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold">{data?.totalCustomers || 0}</p>
                  <p className="text-gray-600">Total Customers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-8">
            <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-4">Deep insights into your business performance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <p className="text-sm text-gray-600">Track KPIs and goals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Conversion Rates</h4>
                  <p className="text-sm text-gray-600">Lead to customer conversion</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Growth Trends</h4>
                  <p className="text-sm text-gray-600">Business growth analytics</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 