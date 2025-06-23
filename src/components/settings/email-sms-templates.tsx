'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Send, MessageSquare } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  isDefault: boolean;
  lastUsed?: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Invoice Reminder',
    type: 'email',
    subject: 'Payment Reminder for Invoice #{invoiceNumber}',
    content: 'Dear {customerName},\n\nThis is a friendly reminder that your invoice #{invoiceNumber} for ${amount} is due on {dueDate}.\n\nPlease process your payment at your earliest convenience.\n\nThank you!',
    isDefault: true,
    lastUsed: '2024-01-15'
  },
  {
    id: '2',
    name: 'Payment Confirmation',
    type: 'sms',
    content: 'Payment received for invoice #{invoiceNumber}. Thank you! - {businessName}',
    isDefault: false,
    lastUsed: '2024-01-10'
  },
  {
    id: '3',
    name: 'Quote Follow-up',
    type: 'email',
    subject: 'Following up on your quote - {businessName}',
    content: 'Hi {customerName},\n\nI wanted to follow up on the quote we provided for your project.\n\nDo you have any questions or would you like to proceed?\n\nBest regards,\n{businessName}',
    isDefault: false
  }
];

export function EmailSmsTemplates() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    subject: '',
    content: ''
  });

  const handleCreate = () => {
    setFormData({ name: '', type: 'email', subject: '', content: '' });
    setSelectedTemplate(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content
    });
    setSelectedTemplate(template);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = () => {
    const newTemplate: Template = {
      id: selectedTemplate?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      subject: formData.type === 'email' ? formData.subject : undefined,
      content: formData.content,
      isDefault: false
    };

    if (isEditing && selectedTemplate) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? newTemplate : t));
    } else {
      setTemplates(prev => [...prev, newTemplate]);
    }

    setShowForm(false);
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleSetDefault = (templateId: string) => {
    setTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === templateId })));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email/SMS Templates</h1>
          <p className="text-gray-600">Manage your email and SMS templates for invoices and notifications</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit' : 'Create'} Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'email' | 'sms' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            {formData.type === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-2">Subject Line</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Message Content
                <span className="text-xs text-gray-500 ml-2">
                  Use {'{customerName}'}, {'{invoiceNumber}'}, {'{amount}'}, {'{businessName}'} for dynamic content
                </span>
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your message content..."
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isEditing ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject/Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                      {template.type === 'email' ? (
                        <><Send className="h-3 w-3 mr-1" /> Email</>
                      ) : (
                        <><MessageSquare className="h-3 w-3 mr-1" /> SMS</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.subject || template.content}
                  </TableCell>
                  <TableCell>
                    {template.isDefault && (
                      <Badge variant="outline" className="text-green-600">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!template.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(template.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Customer Info</h4>
              <div className="space-y-1 text-gray-600">
                <div>{'{customerName}'}</div>
                <div>{'{customerEmail}'}</div>
                <div>{'{customerPhone}'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Invoice Details</h4>
              <div className="space-y-1 text-gray-600">
                <div>{'{invoiceNumber}'}</div>
                <div>{'{amount}'}</div>
                <div>{'{dueDate}'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Business Info</h4>
              <div className="space-y-1 text-gray-600">
                <div>{'{businessName}'}</div>
                <div>{'{businessEmail}'}</div>
                <div>{'{businessPhone}'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Dates</h4>
              <div className="space-y-1 text-gray-600">
                <div>{'{todayDate}'}</div>
                <div>{'{issueDate}'}</div>
                <div>{'{paymentDate}'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 