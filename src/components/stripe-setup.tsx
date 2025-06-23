'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface StripeSetupProps {
  onBack: () => void;
}

export function StripeSetup({ onBack }: StripeSetupProps) {
  const [isConnected] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  const config = {
    accountName: 'EKO SOLAR LLC',
    email: 'ekosolarize@gmail.com',
    phone: '+14045516532'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-teal-600">
          <ArrowLeft className="h-4 w-4" />
          Return to Online Payments
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Left Panel - Configuration */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-2xl font-bold">Stripe</h1>
          </div>

          <div className="space-y-6">
            {/* Payment Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Stripe Payment Status</h3>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"} className="bg-green-100 text-green-800">
                  {isConnected ? "Configured and connected" : "Not connected"}
                </Badge>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Account</Label>
                <div className="mt-1 text-sm text-gray-900">{config.accountName}, {config.email}, {config.phone}</div>
              </div>
            </div>

            {/* Disable Button */}
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-20">
                Disable
              </Button>
            </div>

            {/* Active Toggle */}
            <div className="pt-4 border-t">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Active</Label>
                <div className="text-sm text-gray-600 mb-3">Activate or disable this payment method.</div>
                
                <div className="flex items-center gap-3">
                  <Switch
                    id="make-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="make-active" className="text-sm">Make active</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Information */}
        <div className="w-80">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-semibold text-purple-600">stripe</span>
              </div>

              <div className="space-y-6 text-sm">
                {/* Transaction Charges */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Charges</h4>
                  <div className="text-gray-700 space-y-1">
                    <div>Transaction charges are applicable as on your Stripe plan.</div>
                    <div>Stripe reference fees 2.9% + $0.30</div>
                    <div>No additional fee will be charged by Markate.</div>
                  </div>
                </div>

                {/* Accepted Credit Cards */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accepted Credit Cards</h4>
                  <div className="text-gray-700 space-y-1">
                    <div>All major cards are accepted.</div>
                    <div>Payment status will be updated in Markate automatically.</div>
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