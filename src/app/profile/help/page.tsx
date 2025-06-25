'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video,
  Mail,
  Phone,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });

  const faqItems = [
    {
      id: '1',
      question: 'How do I create my first invoice?',
      answer: 'To create your first invoice, navigate to the Invoices section from the sidebar, then click "Create New Invoice". Fill in the customer details, add line items, and click Save.'
    },
    {
      id: '2',
      question: 'How can I accept online payments?',
      answer: 'You can accept online payments by connecting your Stripe account in the Settings > Online Payments section. Once connected, your invoices will include a "Pay Now" button for customers.'
    },
    {
      id: '3',
      question: 'Can I customize my invoice templates?',
      answer: 'Yes! Go to Settings > Invoice Templates to customize colors, logos, and layout. Professional and Enterprise plans include advanced customization options.'
    },
    {
      id: '4',
      question: 'How do I track overdue invoices?',
      answer: 'The Dashboard shows overdue invoices in red. You can also set up automatic reminders in Settings > Notifications to send follow-up emails to customers.'
    },
    {
      id: '5',
      question: 'What payment methods are supported?',
      answer: 'We support all major credit cards, bank transfers, and digital wallets through our Stripe integration. PayPal support is coming soon.'
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of creating invoices and managing customers',
      type: 'guide',
      icon: Book,
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      type: 'video',
      icon: Video,
      link: '#'
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      type: 'docs',
      icon: Book,
      link: '#'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and get help',
      type: 'community',
      icon: MessageSquare,
      link: '#'
    }
  ];

  const handleFaqToggle = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSupportFormChange = (field: string, value: string) => {
    setSupportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitSupport = () => {
    console.log('Submitting support request:', supportForm);
    alert('Support request submitted successfully! We\'ll get back to you within 24 hours.');
    setSupportForm({
      subject: '',
      category: '',
      message: '',
      priority: 'medium'
    });
  };

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Find answers, get help, and learn how to make the most of your account</p>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-gray-500">Get instant help from our support team</p>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-500">Send us a detailed message</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Help Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for help articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFaq.map((item) => (
                  <div key={item.id} className="border rounded-lg">
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                      onClick={() => handleFaqToggle(item.id)}
                    >
                      <span className="font-medium">{item.question}</span>
                      {expandedFaq === item.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedFaq === item.id && (
                      <div className="px-4 pb-4 text-gray-600">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Help Resources</CardTitle>
              <CardDescription>
                Guides, tutorials, and documentation to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{resource.title}</h3>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can&apos;t find what you&apos;re looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={supportForm.subject}
                    onChange={(e) => handleSupportFormChange('subject', e.target.value)}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={supportForm.category}
                    onChange={(e) => handleSupportFormChange('category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="technical">Technical Issues</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <div className="flex gap-2 mt-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <Button
                      key={priority}
                      variant={supportForm.priority === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSupportFormChange('priority', priority)}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      {priority === 'urgent' && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          24h
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={supportForm.message}
                  onChange={(e) => handleSupportFormChange('message', e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                />
              </div>

              <Button onClick={handleSubmitSupport} className="w-full sm:w-auto">
                Submit Support Request
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-500">support@jobinvoicer.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-500">1-800-INVOICE (Mon-Fri 9AM-6PM EST)</p>
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