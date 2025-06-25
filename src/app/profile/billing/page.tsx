'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Download, 
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';

export default function BillingPage() {
  const [currentPlan] = useState({
    name: 'Professional',
    price: '$29',
    billing: 'monthly',
    status: 'active',
    nextBilling: '2024-02-15',
    features: [
      'Unlimited invoices',
      'Advanced reporting',
      'Priority support',
      'Custom branding',
      'API access'
    ]
  });

  const paymentMethods = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '09/25',
      isDefault: false
    }
  ];

  const billingHistory = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Professional Plan - Monthly',
      amount: '$29.00',
      status: 'paid',
      invoice: 'INV-2024-001'
    },
    {
      id: '2',
      date: '2023-12-15',
      description: 'Professional Plan - Monthly',
      amount: '$29.00',
      status: 'paid',
      invoice: 'INV-2023-012'
    },
    {
      id: '3',
      date: '2023-11-15',
      description: 'Professional Plan - Monthly',
      amount: '$29.00',
      status: 'paid',
      invoice: 'INV-2023-011'
    }
  ];

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId);
    alert(`Downloading ${invoiceId}...`);
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      console.log('Deleting payment method:', methodId);
      alert('Payment method deleted successfully!');
    }
  };

  const handleUpgradePlan = () => {
    alert('Upgrade plan functionality would be implemented here.');
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      alert('Subscription cancellation initiated. You will receive a confirmation email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    {currentPlan.price}/{currentPlan.billing} • Next billing: {currentPlan.nextBilling}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{currentPlan.price}</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Plan Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpgradePlan}>
                  Upgrade Plan
                </Button>
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {method.type} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiry}
                        </p>
                      </div>
                    </div>
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.description}</span>
                          <Badge 
                            variant={item.status === 'paid' ? 'default' : 'destructive'}
                            className={item.status === 'paid' ? 'bg-green-500' : ''}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.date} • {item.invoice}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.amount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(item.invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage & Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>
                Track your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Invoices Created</span>
                    <span className="text-sm text-gray-500">127 / Unlimited</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">API Calls</span>
                    <span className="text-sm text-gray-500">2,340 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-gray-500">1.2 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '12%' }}></div>
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