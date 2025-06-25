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
  Megaphone,
  Mail,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  Share2,
  Calendar,
  Target,
  BarChart3,
  Plus,
  Filter,
  Search,
  Edit,
  Play,
  Pause,
  Send,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'Social Media' | 'Google Ads' | 'Website' | 'Print' | 'Referral';
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  description?: string;
  targetAudience: string;
  objectives: string[];
}

interface EmailCampaign {
  id: string;
  subject: string;
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed';
  scheduledDate?: string;
  createdDate: string;
  template: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Solar Savings',
    type: 'Google Ads',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budget: 5000,
    spent: 3200,
    impressions: 45000,
    clicks: 1800,
    conversions: 45,
    leads: 28,
    description: 'Promote solar installation discounts during summer months',
    targetAudience: 'Homeowners aged 35-65 in Atlanta metro area',
    objectives: ['Lead Generation', 'Brand Awareness']
  },
  {
    id: '2',
    name: 'Residential Solar Email Series',
    type: 'Email',
    status: 'Active',
    startDate: '2024-01-15',
    budget: 500,
    spent: 120,
    impressions: 8500,
    clicks: 340,
    conversions: 12,
    leads: 8,
    description: 'Educational email series about residential solar benefits',
    targetAudience: 'Website visitors and newsletter subscribers',
    objectives: ['Lead Nurturing', 'Education']
  },
  {
    id: '3',
    name: 'Social Media Awareness',
    type: 'Social Media',
    status: 'Active',
    startDate: '2024-01-01',
    budget: 1200,
    spent: 890,
    impressions: 25000,
    clicks: 750,
    conversions: 18,
    leads: 12,
    description: 'Build brand awareness through social media content',
    targetAudience: 'Local homeowners and businesses',
    objectives: ['Brand Awareness', 'Engagement']
  }
];

const mockEmailCampaigns: EmailCampaign[] = [
  {
    id: '1',
    subject: 'Your Solar Savings Await - Free Consultation',
    recipients: 2500,
    sent: 2500,
    delivered: 2475,
    opened: 865,
    clicked: 127,
    unsubscribed: 8,
    bounced: 25,
    status: 'Sent',
    createdDate: '2024-01-15',
    template: 'Solar Consultation'
  },
  {
    id: '2',
    subject: 'How Solar Can Cut Your Energy Bills by 80%',
    recipients: 1800,
    sent: 1800,
    delivered: 1785,
    opened: 623,
    clicked: 94,
    unsubscribed: 5,
    bounced: 15,
    status: 'Sent',
    createdDate: '2024-01-10',
    template: 'Educational Series'
  },
  {
    id: '3',
    subject: 'Welcome to the Solar Revolution!',
    recipients: 3200,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
    status: 'Draft',
    scheduledDate: '2024-01-25',
    createdDate: '2024-01-18',
    template: 'Welcome Series'
  }
];

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Active': 'bg-green-100 text-green-800',
  'Paused': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'Scheduled': 'bg-purple-100 text-purple-800',
  'Sending': 'bg-orange-100 text-orange-800',
  'Sent': 'bg-green-100 text-green-800',
  'Failed': 'bg-red-100 text-red-800'
};

const typeColors = {
  'Email': 'bg-blue-100 text-blue-800',
  'Social Media': 'bg-purple-100 text-purple-800',
  'Google Ads': 'bg-red-100 text-red-800',
  'Website': 'bg-green-100 text-green-800',
  'Print': 'bg-gray-100 text-gray-800',
  'Referral': 'bg-orange-100 text-orange-800'
};

export function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [showNewEmailForm, setShowNewEmailForm] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'Email' as Campaign['type'],
    budget: '',
    startDate: '',
    endDate: '',
    description: '',
    targetAudience: '',
    objectives: [] as string[]
  });

  // Calculate marketing metrics
  const marketingMetrics = useMemo(() => {
    const totalBudget = mockCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
    const totalSpent = mockCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
    const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
    const totalClicks = mockCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const totalConversions = mockCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const totalLeads = mockCampaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const costPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;
    const roi = totalSpent > 0 ? ((totalLeads * 1000 - totalSpent) / totalSpent) * 100 : 0; // Assuming $1000 avg lead value

    // Email metrics
    const totalEmailsSent = mockEmailCampaigns.reduce((sum, email) => sum + email.sent, 0);
    const totalEmailsOpened = mockEmailCampaigns.reduce((sum, email) => sum + email.opened, 0);
    const totalEmailsClicked = mockEmailCampaigns.reduce((sum, email) => sum + email.clicked, 0);
    const emailOpenRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0;
    const emailClickRate = totalEmailsSent > 0 ? (totalEmailsClicked / totalEmailsSent) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalLeads,
      ctr,
      conversionRate,
      costPerLead,
      roi,
      emailOpenRate,
      emailClickRate,
      activeCampaigns: mockCampaigns.filter(c => c.status === 'Active').length
    };
  }, []);

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateCampaign = () => {
    console.log('Creating new campaign:', newCampaign);
    setShowNewCampaignForm(false);
    setNewCampaign({
      name: '',
      type: 'Email',
      budget: '',
      startDate: '',
      endDate: '',
      description: '',
      targetAudience: '',
      objectives: []
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-600">Manage your marketing campaigns and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowNewEmailForm(true)}>
            <Mail className="h-4 w-4 mr-2" />
            New Email Campaign
          </Button>
          <Button onClick={() => setShowNewCampaignForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
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
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(marketingMetrics.totalBudget)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(marketingMetrics.totalSpent)} spent
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
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{marketingMetrics.totalLeads}</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(marketingMetrics.costPerLead)} cost per lead
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(marketingMetrics.conversionRate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(marketingMetrics.totalConversions)} conversions
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(marketingMetrics.roi)}
                    </p>
                    <p className="text-sm text-gray-500">Return on investment</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Impressions</span>
                    <span className="font-bold">{formatNumber(marketingMetrics.totalImpressions)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Total Clicks</span>
                    <span className="font-bold">{formatNumber(marketingMetrics.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Click-Through Rate</span>
                    <span className="font-bold">{formatPercentage(marketingMetrics.ctr)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="font-medium">Active Campaigns</span>
                    <span className="font-bold">{marketingMetrics.activeCampaigns}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Marketing Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Open Rate</span>
                    <span className="font-bold">{formatPercentage(marketingMetrics.emailOpenRate)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Click Rate</span>
                    <span className="font-bold">{formatPercentage(marketingMetrics.emailClickRate)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Total Sent</span>
                    <span className="font-bold">
                      {formatNumber(mockEmailCampaigns.reduce((sum, email) => sum + email.sent, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Active Campaigns</span>
                    <span className="font-bold">
                      {mockEmailCampaigns.filter(e => e.status === 'Sent' || e.status === 'Sending').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search campaigns..."
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
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Print">Print</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => {
              const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
              const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
              const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;
              
              return (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <Badge className={statusColors[campaign.status]}>
                            {campaign.status}
                          </Badge>
                          <Badge className={typeColors[campaign.type]}>
                            {campaign.type}
                          </Badge>
                        </div>
                        
                        {campaign.description && (
                          <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Start Date:</span> {formatDate(campaign.startDate)}
                          </div>
                          {campaign.endDate && (
                            <div>
                              <span className="font-medium">End Date:</span> {formatDate(campaign.endDate)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Target:</span> {campaign.targetAudience}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <p className="text-lg font-bold text-blue-600">{formatNumber(campaign.impressions)}</p>
                            <p className="text-xs text-gray-600">Impressions</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <p className="text-lg font-bold text-green-600">{formatNumber(campaign.clicks)}</p>
                            <p className="text-xs text-gray-600">Clicks ({formatPercentage(ctr)})</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <p className="text-lg font-bold text-purple-600">{campaign.conversions}</p>
                            <p className="text-xs text-gray-600">Conversions ({formatPercentage(conversionRate)})</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded">
                            <p className="text-lg font-bold text-orange-600">{campaign.leads}</p>
                            <p className="text-xs text-gray-600">Leads Generated</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Used</span>
                              <span>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'Active' ? (
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

        {/* Email Marketing Tab */}
        <TabsContent value="email" className="space-y-6">
          <div className="space-y-4">
            {mockEmailCampaigns.map(email => {
              const openRate = email.sent > 0 ? (email.opened / email.sent) * 100 : 0;
              const clickRate = email.sent > 0 ? (email.clicked / email.sent) * 100 : 0;
              const deliveryRate = email.sent > 0 ? (email.delivered / email.sent) * 100 : 0;
              
              return (
                <Card key={email.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{email.subject}</h3>
                          <Badge className={statusColors[email.status]}>
                            {email.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Template:</span> {email.template}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(email.createdDate)}
                          </div>
                          {email.scheduledDate && (
                            <div>
                              <span className="font-medium">Scheduled:</span> {formatDate(email.scheduledDate)}
                            </div>
                          )}
                        </div>

                        {email.status === 'Sent' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <p className="text-lg font-bold text-blue-600">{formatNumber(email.delivered)}</p>
                              <p className="text-xs text-gray-600">Delivered ({formatPercentage(deliveryRate)})</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded">
                              <p className="text-lg font-bold text-green-600">{formatNumber(email.opened)}</p>
                              <p className="text-xs text-gray-600">Opened ({formatPercentage(openRate)})</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded">
                              <p className="text-lg font-bold text-purple-600">{formatNumber(email.clicked)}</p>
                              <p className="text-xs text-gray-600">Clicked ({formatPercentage(clickRate)})</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded">
                              <p className="text-lg font-bold text-orange-600">{email.unsubscribed}</p>
                              <p className="text-xs text-gray-600">Unsubscribed</p>
                            </div>
                          </div>
                        )}

                        {email.status === 'Draft' && (
                          <div className="text-center p-4 bg-gray-50 rounded">
                            <p className="text-gray-600">Ready to send to {formatNumber(email.recipients)} recipients</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {email.status === 'Draft' && (
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Send
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

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Facebook className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Facebook</h3>
                    <p className="text-sm text-gray-600">1,234 followers</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reach:</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Clicks:</span>
                    <span className="font-medium">245</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Instagram className="h-8 w-8 text-pink-600" />
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    <p className="text-sm text-gray-600">856 followers</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reach:</span>
                    <span className="font-medium">8,920</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className="font-medium">4.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profile visits:</span>
                    <span className="font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Linkedin className="h-8 w-8 text-blue-700" />
                  <div>
                    <h3 className="font-semibold">LinkedIn</h3>
                    <p className="text-sm text-gray-600">567 connections</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Impressions:</span>
                    <span className="font-medium">5,670</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Clicks:</span>
                    <span className="font-medium">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Twitter className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Twitter</h3>
                    <p className="text-sm text-gray-600">432 followers</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Impressions:</span>
                    <span className="font-medium">3,240</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className="font-medium">1.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Retweets:</span>
                    <span className="font-medium">23</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Trends</CardTitle>
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
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.map(campaign => {
                    const percentage = (campaign.leads / marketingMetrics.totalLeads) * 100;
                    
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{campaign.name}</span>
                          <span>{campaign.leads} leads ({percentage.toFixed(1)}%)</span>
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
      </Tabs>

      {/* New Campaign Form Modal */}
      {showNewCampaignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Solar Promotion"
                  />
                </div>
                <div>
                  <Label htmlFor="campaignType">Type *</Label>
                  <Select value={newCampaign.type} onValueChange={(value: Campaign['type']) => setNewCampaign(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Print">Print</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget">Budget ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Homeowners aged 35-65 in Atlanta metro area"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the campaign goals and strategy"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewCampaignForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Email Campaign Placeholder */}
      {showNewEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Email Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Email campaign builder will be implemented here.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewEmailForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewEmailForm(false)}>
                  Create Email Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 