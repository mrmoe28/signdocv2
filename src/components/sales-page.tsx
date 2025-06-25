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
  TrendingUp,
  DollarSign,
  Target,
  Users,
  FileText,
  Plus,
  Filter,
  Search,
  Edit,
  Eye,
  Send,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react';

interface SalesLead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  location: string;
  source: 'Website' | 'Referral' | 'Cold Call' | 'Social Media' | 'Advertisement';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  value: number;
  probability: number;
  createdDate: string;
  lastContact: string;
  nextFollowUp?: string;
  notes?: string;
  assignedTo: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  customer: string;
  title: string;
  value: number;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired';
  createdDate: string;
  validUntil: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const mockLeads: SalesLead[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Smith Residence',
    email: 'john@email.com',
    phone: '(555) 123-4567',
    location: 'Atlanta, GA',
    source: 'Website',
    status: 'Qualified',
    value: 25000,
    probability: 75,
    createdDate: '2024-01-10',
    lastContact: '2024-01-14',
    nextFollowUp: '2024-01-18',
    notes: 'Interested in 30-panel residential installation',
    assignedTo: 'Edward Harrison'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Johnson Corp',
    email: 'sarah@johnsoncorp.com',
    phone: '(555) 987-6543',
    location: 'Marietta, GA',
    source: 'Referral',
    status: 'Proposal',
    value: 45000,
    probability: 60,
    createdDate: '2024-01-08',
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-20',
    notes: 'Commercial installation, needs detailed proposal',
    assignedTo: 'Edward Harrison'
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike@email.com',
    phone: '(555) 456-7890',
    location: 'Decatur, GA',
    source: 'Cold Call',
    status: 'Contacted',
    value: 18000,
    probability: 30,
    createdDate: '2024-01-12',
    lastContact: '2024-01-13',
    nextFollowUp: '2024-01-19',
    assignedTo: 'Edward Harrison'
  }
];

const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QUO-2024-001',
    customer: 'John Smith',
    title: 'Residential Solar Installation - 30 Panels',
    value: 25000,
    status: 'Sent',
    createdDate: '2024-01-15',
    validUntil: '2024-02-15',
    items: [
      { description: 'Solar Panels (30x)', quantity: 30, rate: 400, amount: 12000 },
      { description: 'Inverter System', quantity: 1, rate: 3000, amount: 3000 },
      { description: 'Installation & Labor', quantity: 1, rate: 8000, amount: 8000 },
      { description: 'Permits & Inspections', quantity: 1, rate: 2000, amount: 2000 }
    ]
  },
  {
    id: '2',
    quoteNumber: 'QUO-2024-002',
    customer: 'Sarah Johnson',
    title: 'Commercial Solar Installation - 100 Panels',
    value: 45000,
    status: 'Draft',
    createdDate: '2024-01-16',
    validUntil: '2024-02-16',
    items: [
      { description: 'Commercial Solar Panels (100x)', quantity: 100, rate: 350, amount: 35000 },
      { description: 'Commercial Inverter System', quantity: 2, rate: 3000, amount: 6000 },
      { description: 'Installation & Labor', quantity: 1, rate: 4000, amount: 4000 }
    ]
  }
];

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Proposal': 'bg-purple-100 text-purple-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Won': 'bg-green-100 text-green-800',
  'Lost': 'bg-red-100 text-red-800',
  'Draft': 'bg-gray-100 text-gray-800',
  'Sent': 'bg-blue-100 text-blue-800',
  'Viewed': 'bg-yellow-100 text-yellow-800',
  'Accepted': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Expired': 'bg-red-100 text-red-800'
};

const sourceColors = {
  'Website': 'bg-blue-100 text-blue-800',
  'Referral': 'bg-green-100 text-green-800',
  'Cold Call': 'bg-orange-100 text-orange-800',
  'Social Media': 'bg-purple-100 text-purple-800',
  'Advertisement': 'bg-pink-100 text-pink-800'
};

export function SalesPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    source: 'Website' as SalesLead['source'],
    value: '',
    probability: '50',
    notes: ''
  });

  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    const totalPipelineValue = mockLeads.reduce((sum, lead) => sum + lead.value, 0);
    const weightedPipelineValue = mockLeads.reduce((sum, lead) => sum + (lead.value * lead.probability / 100), 0);
    const wonDeals = mockLeads.filter(lead => lead.status === 'Won');
    const totalWonValue = wonDeals.reduce((sum, lead) => sum + lead.value, 0);
    const conversionRate = mockLeads.length > 0 ? (wonDeals.length / mockLeads.length) * 100 : 0;
    const avgDealSize = mockLeads.length > 0 ? totalPipelineValue / mockLeads.length : 0;

    return {
      totalPipelineValue,
      weightedPipelineValue,
      totalWonValue,
      conversionRate,
      avgDealSize,
      totalLeads: mockLeads.length,
      wonDeals: wonDeals.length
    };
  }, []);

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const handleCreateLead = () => {
    console.log('Creating new lead:', newLead);
    setShowNewLeadForm(false);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      location: '',
      source: 'Website',
      value: '',
      probability: '50',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Manage your sales pipeline, leads, and quotes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowNewQuoteForm(true)}>
            <FileText className="h-4 w-4 mr-2" />
            New Quote
          </Button>
          <Button onClick={() => setShowNewLeadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Sales Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesMetrics.totalPipelineValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weighted Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesMetrics.weightedPipelineValue)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Won Deals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesMetrics.totalWonValue)}
                    </p>
                    <p className="text-sm text-gray-500">{salesMetrics.wonDeals} deals</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesMetrics.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {salesMetrics.wonDeals}/{salesMetrics.totalLeads} leads
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(lead.value)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    mockLeads.reduce((acc, lead) => {
                      acc[lead.source] = (acc[lead.source] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={sourceColors[source as keyof typeof sourceColors]}>
                          {source}
                        </Badge>
                      </div>
                      <span className="font-medium">{count} leads</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Management */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
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
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Won">Won</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {['New', 'Qualified', 'Proposal', 'Won'].map(status => {
              const statusLeads = filteredLeads.filter(lead => lead.status === status);
              const statusValue = statusLeads.reduce((sum, lead) => sum + lead.value, 0);
              
              return (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{status}</CardTitle>
                      <Badge variant="secondary">{statusLeads.length}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(statusValue)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statusLeads.map(lead => (
                        <div
                          key={lead.id}
                          className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{lead.name}</h4>
                            <span className="text-xs text-gray-500">
                              {lead.probability}%
                            </span>
                          </div>
                          {lead.company && (
                            <p className="text-xs text-gray-600 mb-1">{lead.company}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(lead.value)}
                            </span>
                            <Badge className={sourceColors[lead.source]}>
                              {lead.source}
                            </Badge>
                          </div>
                          {lead.nextFollowUp && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              Follow up: {formatDate(lead.nextFollowUp)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Quotes */}
        <TabsContent value="quotes" className="space-y-6">
          <div className="space-y-4">
            {mockQuotes.map(quote => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{quote.title}</h3>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Quote #:</span> {quote.quoteNumber}
                        </div>
                        <div>
                          <span className="font-medium">Customer:</span> {quote.customer}
                        </div>
                        <div>
                          <span className="font-medium">Value:</span> 
                          <span className="font-semibold text-green-600 ml-1">
                            {formatCurrency(quote.value)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(quote.createdDate)}
                        </div>
                        <div>
                          <span className="font-medium">Valid Until:</span> {formatDate(quote.validUntil)}
                        </div>
                      </div>

                      {/* Quote Items Preview */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                        <div className="space-y-1">
                          {quote.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {item.description} - {item.quantity}x {formatCurrency(item.rate)}
                            </div>
                          ))}
                          {quote.items.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{quote.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['New', 'Contacted', 'Qualified', 'Proposal', 'Won'].map((status, index) => {
                    const count = mockLeads.filter(lead => lead.status === status).length;
                    const percentage = mockLeads.length > 0 ? (count / mockLeads.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} leads ({percentage.toFixed(1)}%)</span>
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

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Average Deal Size</span>
                    <span className="font-bold">{formatCurrency(salesMetrics.avgDealSize)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="font-bold">{salesMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Total Leads</span>
                    <span className="font-bold">{salesMetrics.totalLeads}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Active Quotes</span>
                    <span className="font-bold">{mockQuotes.filter(q => q.status === 'Sent').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadName">Name *</Label>
                  <Input
                    id="leadName"
                    value={newLead.name}
                    onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Lead name"
                  />
                </div>
                <div>
                  <Label htmlFor="leadCompany">Company</Label>
                  <Input
                    id="leadCompany"
                    value={newLead.company}
                    onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadEmail">Email *</Label>
                  <Input
                    id="leadEmail"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="leadPhone">Phone</Label>
                  <Input
                    id="leadPhone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadLocation">Location</Label>
                  <Input
                    id="leadLocation"
                    value={newLead.location}
                    onChange={(e) => setNewLead(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <Label htmlFor="leadSource">Source</Label>
                  <Select value={newLead.source} onValueChange={(value: SalesLead['source']) => setNewLead(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Advertisement">Advertisement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadValue">Estimated Value ($)</Label>
                  <Input
                    id="leadValue"
                    type="number"
                    value={newLead.value}
                    onChange={(e) => setNewLead(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="leadProbability">Probability (%)</Label>
                  <Input
                    id="leadProbability"
                    type="number"
                    min="0"
                    max="100"
                    value={newLead.probability}
                    onChange={(e) => setNewLead(prev => ({ ...prev, probability: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="leadNotes">Notes</Label>
                <Textarea
                  id="leadNotes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the lead"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewLeadForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLead}>
                  Add Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedLead.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedLead.status]}>
                  {selectedLead.status}
                </Badge>
                <Badge className={sourceColors[selectedLead.source]}>
                  {selectedLead.source}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {selectedLead.company && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{selectedLead.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{selectedLead.location}</span>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Value:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(selectedLead.value)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Probability:</span>
                  <span className="font-semibold">{selectedLead.probability}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Created:</span> {formatDate(selectedLead.createdDate)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last Contact:</span> {formatDate(selectedLead.lastContact)}
                </div>
                {selectedLead.nextFollowUp && (
                  <div className="text-sm">
                    <span className="font-medium">Next Follow-up:</span> {formatDate(selectedLead.nextFollowUp)}
                  </div>
                )}
              </div>
              
              {selectedLead.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedLead.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Quote Form Placeholder */}
      {showNewQuoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Quote creation form will be implemented here.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewQuoteForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewQuoteForm(false)}>
                  Create Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 