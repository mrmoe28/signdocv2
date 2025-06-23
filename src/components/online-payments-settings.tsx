'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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

  const toggleProvider = (id: string) => {
    setProviders(providers.map(provider => 
      provider.id === id 
        ? { ...provider, active: !provider.active }
        : provider
    ));
  };

  const handleSetup = (id: string) => {
    console.log(`Setting up ${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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