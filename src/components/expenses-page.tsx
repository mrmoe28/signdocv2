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
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  FileText,
  Car,
  Wrench,
  Zap,
  Home,
  ShoppingCart,
  Coffee,
  Briefcase,
  CreditCard,
  PieChart,
  BarChart3,
  Tag
} from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Check' | 'Bank Transfer';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';
  receiptUrl?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  projectId?: string;
  isBusinessExpense: boolean;
  taxDeductible: boolean;
}

const expenseCategories = [
  { id: 'fuel', name: 'Fuel & Transportation', icon: Car, color: 'bg-blue-100 text-blue-800' },
  { id: 'tools', name: 'Tools & Equipment', icon: Wrench, color: 'bg-green-100 text-green-800' },
  { id: 'materials', name: 'Materials & Supplies', icon: ShoppingCart, color: 'bg-purple-100 text-purple-800' },
  { id: 'utilities', name: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'office', name: 'Office Expenses', icon: Briefcase, color: 'bg-gray-100 text-gray-800' },
  { id: 'meals', name: 'Meals & Entertainment', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
  { id: 'maintenance', name: 'Maintenance & Repairs', icon: Home, color: 'bg-red-100 text-red-800' },
  { id: 'other', name: 'Other', icon: FileText, color: 'bg-indigo-100 text-indigo-800' }
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Solar panel materials for Johnson project',
    amount: 2500.00,
    category: 'materials',
    date: '2024-01-15',
    vendor: 'Solar Supply Co.',
    paymentMethod: 'Credit Card',
    status: 'Approved',
    isBusinessExpense: true,
    taxDeductible: true,
    projectId: 'proj-001',
    tags: ['solar', 'installation'],
    notes: 'High-efficiency panels for commercial installation'
  },
  {
    id: '2',
    description: 'Fuel for service calls',
    amount: 85.50,
    category: 'fuel',
    date: '2024-01-14',
    vendor: 'Shell Gas Station',
    paymentMethod: 'Credit Card',
    status: 'Approved',
    isBusinessExpense: true,
    taxDeductible: true,
    tags: ['fuel', 'vehicle']
  },
  {
    id: '3',
    description: 'New drill set',
    amount: 245.99,
    category: 'tools',
    date: '2024-01-12',
    vendor: 'Home Depot',
    paymentMethod: 'Debit Card',
    status: 'Approved',
    isBusinessExpense: true,
    taxDeductible: true,
    tags: ['tools', 'equipment']
  },
  {
    id: '4',
    description: 'Office supplies',
    amount: 67.45,
    category: 'office',
    date: '2024-01-10',
    vendor: 'Staples',
    paymentMethod: 'Credit Card',
    status: 'Pending',
    isBusinessExpense: true,
    taxDeductible: true,
    tags: ['office', 'supplies']
  },
  {
    id: '5',
    description: 'Client lunch meeting',
    amount: 125.30,
    category: 'meals',
    date: '2024-01-08',
    vendor: 'The Bistro',
    paymentMethod: 'Credit Card',
    status: 'Approved',
    isBusinessExpense: true,
    taxDeductible: true,
    tags: ['meals', 'client'],
    notes: 'Meeting with potential client for large commercial project'
  }
];

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Reimbursed': 'bg-blue-100 text-blue-800'
};

const paymentMethodColors = {
  'Cash': 'bg-green-100 text-green-800',
  'Credit Card': 'bg-blue-100 text-blue-800',
  'Debit Card': 'bg-purple-100 text-purple-800',
  'Check': 'bg-orange-100 text-orange-800',
  'Bank Transfer': 'bg-gray-100 text-gray-800'
};

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'Credit Card' as Expense['paymentMethod'],
    notes: '',
    isBusinessExpense: true,
    taxDeductible: true,
    tags: ''
  });

  // Calculate expense metrics
  const expenseMetrics = useMemo(() => {
    const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const businessExpenses = mockExpenses.filter(e => e.isBusinessExpense).reduce((sum, expense) => sum + expense.amount, 0);
    const taxDeductibleExpenses = mockExpenses.filter(e => e.taxDeductible).reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = mockExpenses.filter(e => e.status === 'Pending').reduce((sum, expense) => sum + expense.amount, 0);
    const thisMonthExpenses = mockExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const expensesByCategory = mockExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      businessExpenses,
      taxDeductibleExpenses,
      pendingExpenses,
      thisMonthExpenses,
      expensesByCategory,
      totalCount: mockExpenses.length
    };
  }, []);

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find(cat => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1];
  };

  const handleCreateExpense = () => {
    console.log('Creating new expense:', newExpense);
    setShowNewExpenseForm(false);
    setNewExpense({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      paymentMethod: 'Credit Card',
      notes: '',
      isBusinessExpense: true,
      taxDeductible: true,
      tags: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage your business expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewExpenseForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(expenseMetrics.totalExpenses)}
                    </p>
                    <p className="text-sm text-gray-500">{expenseMetrics.totalCount} expenses</p>
                  </div>
                  <Receipt className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(expenseMetrics.thisMonthExpenses)}
                    </p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      12% vs last month
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax Deductible</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(expenseMetrics.taxDeductibleExpenses)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {((expenseMetrics.taxDeductibleExpenses / expenseMetrics.totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(expenseMetrics.pendingExpenses)}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {mockExpenses.filter(e => e.status === 'Pending').length} expenses
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Expenses and Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExpenses.slice(0, 5).map(expense => {
                    const categoryInfo = getCategoryInfo(expense.category);
                    const CategoryIcon = categoryInfo.icon;
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{expense.description}</p>
                            <p className="text-xs text-gray-600">{expense.vendor} • {formatDate(expense.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                          <Badge className={statusColors[expense.status]} size="sm">
                            {expense.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expenseMetrics.expensesByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([categoryId, amount]) => {
                      const categoryInfo = getCategoryInfo(categoryId);
                      const CategoryIcon = categoryInfo.icon;
                      const percentage = (amount / expenseMetrics.totalExpenses) * 100;
                      
                      return (
                        <div key={categoryId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium">{categoryInfo.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">{formatCurrency(amount)}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Reimbursed">Reimbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expenses List */}
          <div className="space-y-4">
            {filteredExpenses.map(expense => {
              const categoryInfo = getCategoryInfo(expense.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${categoryInfo.color}`}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{expense.description}</h3>
                            <Badge className={statusColors[expense.status]}>
                              {expense.status}
                            </Badge>
                            {expense.taxDeductible && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Tax Deductible
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                            <div>
                              <span className="font-medium">Vendor:</span> {expense.vendor}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(expense.date)}
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span>
                              <Badge className={paymentMethodColors[expense.paymentMethod]} size="sm" variant="outline">
                                {expense.paymentMethod}
                              </Badge>
                            </div>
                          </div>

                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="h-3 w-3 text-gray-500" />
                              <div className="flex gap-1">
                                {expense.tags.map(tag => (
                                  <Badge key={tag} variant="outline" size="sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {expense.notes && (
                            <p className="text-sm text-gray-600 mt-2">{expense.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                          <p className="text-sm text-gray-500">{categoryInfo.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedExpense(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenseCategories.map(category => {
              const CategoryIcon = category.icon;
              const categoryExpenses = mockExpenses.filter(e => e.category === category.id);
              const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
              const avgAmount = categoryExpenses.length > 0 ? totalAmount / categoryExpenses.length : 0;
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600">{categoryExpenses.length} expenses</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average:</span>
                        <span className="font-semibold">{formatCurrency(avgAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">% of Total:</span>
                        <span className="font-semibold">
                          {expenseMetrics.totalExpenses > 0 ? ((totalAmount / expenseMetrics.totalExpenses) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Monthly trend chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Total Tax Deductible</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(expenseMetrics.taxDeductibleExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Non-Deductible</span>
                    <span className="font-bold">
                      {formatCurrency(expenseMetrics.totalExpenses - expenseMetrics.taxDeductibleExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Estimated Tax Savings</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(expenseMetrics.taxDeductibleExpenses * 0.25)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Expense Form Modal */}
      {showNewExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Office supplies"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="e.g., Home Depot"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(value: Expense['paymentMethod']) => setNewExpense(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newExpense.tags}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., tools, equipment, project-001"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this expense"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newExpense.isBusinessExpense}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, isBusinessExpense: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Business Expense</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newExpense.taxDeductible}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, taxDeductible: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Tax Deductible</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewExpenseForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense}>
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Details Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedExpense.description}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedExpense(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedExpense.status]}>
                  {selectedExpense.status}
                </Badge>
                <Badge className={paymentMethodColors[selectedExpense.paymentMethod]}>
                  {selectedExpense.paymentMethod}
                </Badge>
                {selectedExpense.taxDeductible && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Tax Deductible
                  </Badge>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-center">
                  {formatCurrency(selectedExpense.amount)}
                </div>
                <div className="text-center text-gray-600 mt-1">
                  {getCategoryInfo(selectedExpense.category).name}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{selectedExpense.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedExpense.date)}</span>
                </div>
                {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600">Tags:</span>
                    <div className="flex gap-1 mt-1">
                      {selectedExpense.tags.map(tag => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedExpense.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedExpense.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 