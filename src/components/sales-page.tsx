'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle,

} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  location: string;
  source: 'Website' | 'Referral' | 'Cold Call' | 'Social Media' | 'Advertisement' | 'Trade Show' | 'Google Ads';
  status: 'New' | 'Contacted' | 'Qualified' | 'Interested' | 'Not Interested' | 'Converted' | 'Lost';
  score: number;
  estimatedValue: number;
  probability: number;
  assignedTo: string;
  createdDate: string;
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
  tags?: string[];
  interests?: string[];
  priority: 'High' | 'Medium' | 'Low';
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  contactPerson?: string;
  customerType: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
}

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Interested': 'bg-purple-100 text-purple-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'Converted': 'bg-green-100 text-green-800',
  'Lost': 'bg-gray-100 text-gray-800',
  'Proposal': 'bg-purple-100 text-purple-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Won': 'bg-green-100 text-green-800',
  'Draft': 'bg-gray-100 text-gray-800',
  'Sent': 'bg-blue-100 text-blue-800',
  'Paid': 'bg-green-100 text-green-800',
  'Pending': 'bg-yellow-100 text-yellow-800'
};

const sourceColors = {
  'Website': 'bg-blue-100 text-blue-800',
  'Referral': 'bg-green-100 text-green-800',
  'Cold Call': 'bg-orange-100 text-orange-800',
  'Social Media': 'bg-purple-100 text-purple-800',
  'Advertisement': 'bg-pink-100 text-pink-800',
  'Trade Show': 'bg-teal-100 text-teal-800',
  'Google Ads': 'bg-red-100 text-red-800'
};

export function SalesPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    source: 'Website' as Lead['source'],
    estimatedValue: '',
    probability: '50',
    notes: ''
  });

  // Fetch all data from APIs
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads
      const leadsResponse = await fetch('/api/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        const leadsWithParsedFields = leadsData.map((lead: Lead & { tags: string; interests: string }) => ({
          ...lead,
          tags: typeof lead.tags === 'string' ? JSON.parse(lead.tags || '[]') : lead.tags || [],
          interests: typeof lead.interests === 'string' ? JSON.parse(lead.interests || '[]') : lead.interests || []
        }));
        setLeads(leadsWithParsedFields);
      }

      // Fetch customers
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
      }

      // Fetch invoices
      const invoicesResponse = await fetch('/api/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate sales metrics from real data
  const salesMetrics = useMemo(() => {
    const totalPipelineValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
    const weightedPipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue * lead.probability / 100), 0);
    const wonDeals = leads.filter(lead => lead.status === 'Converted');
    const totalWonValue = wonDeals.reduce((sum, lead) => sum + lead.estimatedValue, 0);
    const conversionRate = leads.length > 0 ? (wonDeals.length / leads.length) * 100 : 0;
    const avgDealSize = leads.length > 0 ? totalPipelineValue / leads.length : 0;
    
    // Calculate revenue from invoices
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid');
    const totalPaidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      totalPipelineValue,
      weightedPipelineValue,
      totalWonValue,
      totalRevenue,
      totalPaidRevenue,
      conversionRate,
      avgDealSize,
      totalLeads: leads.length,
      wonDeals: wonDeals.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length
    };
  }, [leads, customers, invoices]);

  const filteredLeads = leads.filter(lead => {
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

  const handleCreateLead = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          estimatedValue: parseFloat(newLead.estimatedValue) || 0,
          probability: parseInt(newLead.probability) || 50
        }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        setShowNewLeadForm(false);
        setNewLead({
          name: '',
          company: '',
          email: '',
          phone: '',
          location: '',
          source: 'Website',
          estimatedValue: '',
          probability: '50',
          notes: ''
        });
      } else {
        console.error('Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading sales data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Manage your sales pipeline, leads, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowNewLeadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
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
                    <p className="text-sm font-medium text-gray-600">Revenue (Paid)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesMetrics.totalPaidRevenue)}
                    </p>
                    <p className="text-sm text-gray-500">{salesMetrics.totalInvoices} invoices</p>
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
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.company || lead.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(lead.estimatedValue)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No leads yet</p>
                  )}
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
                    leads.reduce((acc, lead) => {
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / leads.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{lead.name}</h3>
                      {lead.company && (
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      )}
                    </div>
                    <Badge className={statusColors[lead.status]}>
                      {lead.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {lead.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Value</p>
                      <p className="font-semibold">{formatCurrency(lead.estimatedValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Probability</p>
                      <p className="font-semibold">{lead.probability}%</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredLeads.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No leads found matching your criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    leads.reduce((acc, lead) => {
                      acc[lead.status] = (acc[lead.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[status as keyof typeof statusColors]}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / leads.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">
                          {leads.length > 0 ? Math.round((count / leads.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Leads</span>
                    <span className="font-bold text-blue-600">{salesMetrics.totalLeads}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Converted Leads</span>
                    <span className="font-bold text-green-600">{salesMetrics.wonDeals}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Conversion Rate</span>
                    <span className="font-bold text-purple-600">{salesMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="font-medium">Avg Deal Size</span>
                    <span className="font-bold text-orange-600">{formatCurrency(salesMetrics.avgDealSize)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Total Customers</span>
                    <span className="font-bold text-gray-600">{salesMetrics.totalCustomers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Lead</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Lead name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="lead@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newLead.location}
                  onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value as Lead['source'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowNewLeadForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLead}>
                Create Lead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{selectedLead.name}</h2>
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedLead.location}</span>
                  </div>
                  {selectedLead.company && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{selectedLead.company}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Lead Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={statusColors[selectedLead.status]}>
                      {selectedLead.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <Badge className={sourceColors[selectedLead.source]}>
                      {selectedLead.source}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Value:</span>
                    <span className="font-medium">{formatCurrency(selectedLead.estimatedValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Probability:</span>
                    <span className="font-medium">{selectedLead.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(selectedLead.createdDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            {selectedLead.notes && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedLead.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 