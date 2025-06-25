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
  Users,
  UserPlus,
  TrendingUp,
  Target,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Plus,
  Filter,
  Search,
  Edit,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Share2,
  BarChart3
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
  score: number; // 1-100
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

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Jennifer Wilson',
    email: 'jennifer@email.com',
    phone: '(555) 234-5678',
    company: 'Wilson Enterprises',
    location: 'Atlanta, GA',
    source: 'Website',
    status: 'Qualified',
    score: 85,
    estimatedValue: 35000,
    probability: 70,
    assignedTo: 'Edward Harrison',
    createdDate: '2024-01-10',
    lastContact: '2024-01-14',
    nextFollowUp: '2024-01-18',
    notes: 'Interested in commercial solar installation for office building',
    tags: ['commercial', 'solar', 'high-value'],
    interests: ['Commercial Solar', 'Energy Storage'],
    priority: 'High'
  },
  {
    id: '2',
    name: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '(555) 345-6789',
    location: 'Marietta, GA',
    source: 'Google Ads',
    status: 'Contacted',
    score: 65,
    estimatedValue: 22000,
    probability: 45,
    assignedTo: 'Edward Harrison',
    createdDate: '2024-01-12',
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-19',
    notes: 'Residential installation, needs financing options',
    tags: ['residential', 'financing'],
    interests: ['Residential Solar'],
    priority: 'Medium'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '(555) 456-7890',
    location: 'Decatur, GA',
    source: 'Referral',
    status: 'New',
    score: 40,
    estimatedValue: 18000,
    probability: 25,
    assignedTo: 'Edward Harrison',
    createdDate: '2024-01-16',
    tags: ['residential', 'referral'],
    interests: ['Residential Solar'],
    priority: 'Low'
  }
];

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Interested': 'bg-purple-100 text-purple-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'Converted': 'bg-green-100 text-green-800',
  'Lost': 'bg-gray-100 text-gray-800'
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

const priorityColors = {
  'High': 'bg-red-100 text-red-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800'
};

export function LeadsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    source: 'Website' as Lead['source'],
    estimatedValue: '',
    notes: '',
    interests: [] as string[]
  });

  // Calculate lead metrics
  const leadMetrics = useMemo(() => {
    const totalLeads = mockLeads.length;
    const qualifiedLeads = mockLeads.filter(lead => lead.status === 'Qualified').length;
    const convertedLeads = mockLeads.filter(lead => lead.status === 'Converted').length;
    const totalValue = mockLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
    const avgScore = mockLeads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    const leadsBySource = mockLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      totalValue,
      avgScore,
      conversionRate,
      qualificationRate,
      leadsBySource
    };
  }, []);

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateLead = () => {
    console.log('Creating new lead:', newLead);
    setShowNewLeadForm(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      source: 'Website',
      estimatedValue: '',
      notes: '',
      interests: []
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage and convert your sales leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Import Leads
          </Button>
          <Button onClick={() => setShowNewLeadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
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
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{leadMetrics.totalLeads}</p>
                    <p className="text-sm text-gray-500">Active prospects</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{leadMetrics.qualifiedLeads}</p>
                    <p className="text-sm text-green-600">
                      {leadMetrics.qualificationRate.toFixed(1)}% qualification rate
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(leadMetrics.totalValue)}
                    </p>
                    <p className="text-sm text-gray-500">Total potential</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Lead Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {leadMetrics.avgScore.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-500">Out of 100</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads and Top Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-600">{lead.company || lead.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[lead.status]} size="sm">
                              {lead.status}
                            </Badge>
                            <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(lead.estimatedValue)}</p>
                        <p className="text-sm text-gray-500">{lead.probability}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(leadMetrics.leadsBySource)
                    .sort(([,a], [,b]) => b - a)
                    .map(([source, count]) => {
                      const percentage = (count / leadMetrics.totalLeads) * 100;
                      
                      return (
                        <div key={source} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={sourceColors[source as keyof typeof sourceColors]}>
                                {source}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">{count} leads</span>
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

        {/* All Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
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
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
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

          {/* Leads List */}
          <div className="space-y-4">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                          <Badge className={priorityColors[lead.priority]}>
                            {lead.priority}
                          </Badge>
                          <Badge className={sourceColors[lead.source]}>
                            {lead.source}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          {lead.company && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{lead.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{lead.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(lead.createdDate)}</span>
                          </div>
                          {lead.nextFollowUp && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Follow up: {formatDate(lead.nextFollowUp)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className={`font-semibold ${getScoreColor(lead.score)}`}>
                              {lead.score}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Value:</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(lead.estimatedValue)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Probability:</span>
                            <span className="font-semibold">{lead.probability}%</span>
                          </div>
                        </div>

                        {lead.interests && lead.interests.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">Interests:</span>
                            <div className="flex gap-1">
                              {lead.interests.map(interest => (
                                <Badge key={interest} variant="outline" size="sm">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {lead.notes && (
                          <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(leadMetrics.leadsBySource).map(([source, count]) => {
              const percentage = (count / leadMetrics.totalLeads) * 100;
              const sourceLeads = mockLeads.filter(lead => lead.source === source);
              const avgValue = sourceLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / count;
              const conversionRate = sourceLeads.filter(lead => lead.status === 'Converted').length / count * 100;
              
              return (
                <Card key={source}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={sourceColors[source as keyof typeof sourceColors]}>
                        {source}
                      </Badge>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}% of leads</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Leads:</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Value:</span>
                        <span className="font-semibold">{formatCurrency(avgValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion:</span>
                        <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
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
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['New', 'Contacted', 'Qualified', 'Interested', 'Converted'].map((status, index) => {
                    const count = mockLeads.filter(lead => lead.status === status).length;
                    const percentage = mockLeads.length > 0 ? (count / mockLeads.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} leads ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
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
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Pipeline Value</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(leadMetrics.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Conversion Rate</span>
                    <span className="font-bold text-green-600">
                      {leadMetrics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Qualification Rate</span>
                    <span className="font-bold text-purple-600">
                      {leadMetrics.qualificationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Average Lead Score</span>
                    <span className="font-bold text-yellow-600">
                      {leadMetrics.avgScore.toFixed(0)}/100
                    </span>
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
                  <Label htmlFor="leadEmail">Email *</Label>
                  <Input
                    id="leadEmail"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadPhone">Phone</Label>
                  <Input
                    id="leadPhone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
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
                  <Select value={newLead.source} onValueChange={(value: Lead['source']) => setNewLead(prev => ({ ...prev, source: value }))}>
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
              </div>

              <div>
                <Label htmlFor="leadValue">Estimated Value ($)</Label>
                <Input
                  id="leadValue"
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="25000"
                />
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
                <Badge className={priorityColors[selectedLead.priority]}>
                  {selectedLead.priority}
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
              
              <div className="p-3 bg-blue-50 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className={`font-semibold ml-2 ${getScoreColor(selectedLead.score)}`}>
                      {selectedLead.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Probability:</span>
                    <span className="font-semibold ml-2">{selectedLead.probability}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Estimated Value:</span>
                    <span className="font-semibold text-green-600 ml-2">
                      {formatCurrency(selectedLead.estimatedValue)}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedLead.interests && selectedLead.interests.length > 0 && (
                <div>
                  <Label>Interests</Label>
                  <div className="flex gap-1 mt-1">
                    {selectedLead.interests.map(interest => (
                      <Badge key={interest} variant="outline" size="sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
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
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 