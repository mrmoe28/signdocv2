'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'configured' | 'not-set';
  active: boolean;
  color?: string;
}

export function OnlinePaymentsSettings() {
  const [providers, setProviders] = useState<PaymentProvider[]>([
    {
      id: 'wisetack',
      name: 'Wisetack',
      logo: '🏦',
      description: 'Offer consumer-friendly financing with Wisetack',
      status: 'not-set',
      active: false,
      color: 'text-blue-600'
    },
    {
      id: 'square',
      name: 'Square',
      logo: '⬛',
      description: 'Online Transaction Fees: as set by Square, Instant Deposit is available',
      status: 'configured',
      active: true,
      color: 'text-black'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      logo: '🅿️',
      description: 'Online Transaction Fees: as set by PayPal',
      status: 'configured',
      active: false,
      color: 'text-blue-600'
    },
    {
      id: 'stripe',
      name: 'stripe',
      logo: '💳',
      description: 'Online Transaction Fees: as set by Stripe',
      status: 'configured',
      active: false,
      color: 'text-purple-600'
    },
    {
      id: 'authorize',
      name: 'authorize.net',
      logo: '🔐',
      description: 'Online Transaction Fees: as set by Authorize.net',
      status: 'not-set',
      active: false,
      color: 'text-orange-600'
    }
  ]);

  const [setupDialog, setSetupDialog] = useState({ open: false, provider: '' });
  const [setupData, setSetupData] = useState({
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    merchantId: ''
  });

  const toggleProvider = (id: string) => {
    setProviders(providers.map(provider => 
      provider.id === id 
        ? { ...provider, active: !provider.active }
        : provider
    ));
  };

  const handleSetup = (id: string) => {
    const providerName = providers.find(p => p.id === id)?.name || id;
    console.log(`Setting up ${providerName}`);
    
    // Open setup dialog
    setSetupDialog({ open: true, provider: id });
    
    // Reset setup data
    setSetupData({
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      merchantId: ''
    });
  };

  const handleSetupComplete = () => {
    const providerId = setupDialog.provider;
    
    // Update provider status to configured
    setProviders(providers.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: 'configured' as const }
        : provider
    ));
    
    // Close dialog
    setSetupDialog({ open: false, provider: '' });
    
    // Show success message
    const providerName = providers.find(p => p.id === providerId)?.name || providerId;
    alert(`✅ ${providerName} has been successfully configured! You can now activate it using the toggle switch.`);
  };

  const getSetupFields = (providerId: string) => {
    switch (providerId) {
      case 'wisetack':
        return [
          { key: 'apiKey', label: 'API Key', placeholder: 'Enter your Wisetack API key' },
          { key: 'secretKey', label: 'Secret Key', placeholder: 'Enter your Wisetack secret key' }
        ];
      case 'square':
        return [
          { key: 'apiKey', label: 'Application ID', placeholder: 'Enter your Square Application ID' },
          { key: 'secretKey', label: 'Access Token', placeholder: 'Enter your Square Access token' },
          { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'Enter webhook URL (optional)' }
        ];
      case 'paypal':
        return [
          { key: 'apiKey', label: 'Client ID', placeholder: 'Enter your PayPal Client ID' },
          { key: 'secretKey', label: 'Client Secret', placeholder: 'Enter your PayPal Client Secret' }
        ];
      case 'stripe':
        return [
          { key: 'apiKey', label: 'Publishable Key', placeholder: 'Enter your Stripe Publishable Key' },
          { key: 'secretKey', label: 'Secret Key', placeholder: 'Enter your Stripe Secret Key' },
          { key: 'webhookUrl', label: 'Webhook Endpoint', placeholder: 'Enter webhook endpoint URL' }
        ];
      case 'authorize':
        return [
          { key: 'apiKey', label: 'API Login ID', placeholder: 'Enter your Authorize.net API Login ID' },
          { key: 'secretKey', label: 'Transaction Key', placeholder: 'Enter your Transaction Key' },
          { key: 'merchantId', label: 'Merchant ID', placeholder: 'Enter your Merchant ID' }
        ];
      default:
        return [];
    }
  };

  const currentProvider = providers.find(p => p.id === setupDialog.provider);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Setup Dialog */}
      <Dialog open={setupDialog.open} onOpenChange={(open) => setSetupDialog({ ...setupDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup {currentProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your {currentProvider?.name} credentials to connect your payment processor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {getSetupFields(setupDialog.provider).map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  placeholder={field.placeholder}
                  value={setupData[field.key as keyof typeof setupData]}
                  onChange={(e) => setSetupData({
                    ...setupData,
                    [field.key]: e.target.value
                  })}
                  type={field.key.includes('secret') || field.key.includes('key') ? 'password' : 'text'}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSetupDialog({ open: false, provider: '' })}>
              Cancel
            </Button>
            <Button onClick={handleSetupComplete} className="bg-green-600 hover:bg-green-700">
              Complete Setup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Online Payments</h1>
        <p className="text-gray-600">
          Please select the online preferred payment method. Once the setup is completed, your payment status will be tracked and updated automatically.
        </p>
      </div>

      {/* Financing Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financing</h2>
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🏦</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">Wisetack</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Offer consumer-friendly financing with Wisetack
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Setup</div>
                  <Badge variant="secondary" className="text-xs">
                    Not set
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Active</div>
                  <div className="mt-1">-</div>
                </div>
                <Button 
                  onClick={() => handleSetup('wisetack')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Card Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Card</h2>
        <div className="space-y-4">
          {providers.filter(p => p.id !== 'wisetack').map((provider) => (
            <Card key={provider.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{provider.logo}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${provider.color}`}>
                          {provider.name}
                        </span>
                        {provider.name === 'PayPal' && (
                          <span className="text-blue-600 font-medium">venmo</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Setup</div>
                      <Badge 
                        variant={provider.status === 'configured' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {provider.status === 'configured' ? 'Configured' : 'Not set'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Active</div>
                      <div className="mt-1">
                        {provider.status === 'configured' ? (
                          <Switch
                            checked={provider.active}
                            onCheckedChange={() => toggleProvider(provider.id)}
                          />
                        ) : (
                          <span className="text-sm text-gray-400">OFF</span>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSetup(provider.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Setup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 