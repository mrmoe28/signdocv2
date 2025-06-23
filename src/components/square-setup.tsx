'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface SquareSetupProps {
  onBack: () => void;
}

export function SquareSetup({ onBack }: SquareSetupProps) {
  const [isConnected] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  const config = {
    merchantId: 'ML22NXSRQ12AP',
    locationId: 'LYZ1NSXHSL9KR3',
    locationName: 'EKO SOLAR LLC',
    address: '1018 Ferndale St, STONE MOUNTAIN, 30083-2904'
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
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">□</span>
            </div>
            <h1 className="text-2xl font-bold">Square</h1>
          </div>

          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <div className="px-4 py-2 border-b-2 border-green-500 font-medium text-green-600">
                Setup
              </div>
              <div className="px-4 py-2 text-gray-500">
                ACH Payments Log
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Square Payment Status</h3>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"} className="bg-green-100 text-green-800">
                  {isConnected ? "Configured and connected" : "Not connected"}
                </Badge>
              </div>
            </div>

            {/* Merchant Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Square Merchant Id</Label>
                <div className="mt-1 text-sm text-gray-900">{config.merchantId}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Location Id</Label>
                <div className="mt-1 text-sm text-gray-900">{config.locationId}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Location Details</Label>
                <div className="mt-1 text-sm text-gray-900">{config.locationName}</div>
                <div className="text-sm text-gray-600">{config.address}</div>
                <Button variant="link" className="text-teal-600 p-0 h-auto text-sm mt-1">
                  Update Location
                </Button>
              </div>
            </div>

            {/* ACH Bank Transfer */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">ACH Bank Transfer/Payments</Label>
                <div className="mt-1 text-sm text-gray-600">Off</div>
                <Button variant="link" className="text-teal-600 p-0 h-auto text-sm mt-1">
                  Update Settings
                </Button>
              </div>
            </div>

            {/* Save Customer Cards */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Save customers cards on file</Label>
                <div className="mt-1 text-sm text-gray-600">Off</div>
                <div className="text-xs text-gray-500 mt-1">(to enable requires reconnect)</div>
              </div>
              
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
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">□</span>
                </div>
                <span className="font-semibold">Square</span>
              </div>

              <div className="space-y-6 text-sm">
                {/* Transaction Charges */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Charges</h4>
                  <div className="text-gray-700 space-y-1">
                    <div>Transaction charges are applicable as on your Square plan.</div>
                    <div>Square reference fees 2.6% + 15¢</div>
                    <div>ACH Bank Transfer fees: 1% per ACH transaction (min fee $1)</div>
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

                {/* Locations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Locations</h4>
                  <div className="text-gray-700">
                    If your business has multiple locations, you can manage everything right from your online Square Dashboard. You can create unique business profiles for each location.
                  </div>
                </div>

                {/* Instant Deposit */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instant Deposit</h4>
                  <div className="text-gray-700 space-y-2">
                    <div>For faster access to your money, initiate an instant deposit from the Square app or from your online Square Dashboard. You can instantly send up to $10,000 per deposit</div>
                    <div className="font-medium">24 hours a day, 7 days a week.</div>
                    <div>There is no limit to the number of instant deposits you can initiate in a given day. <Button variant="link" className="text-teal-600 p-0 h-auto text-sm">Setup on Square</Button></div>
                  </div>
                </div>

                {/* Download App */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Download the Square App</h4>
                  <div className="text-gray-700 space-y-2">
                    <div>If you want to accept payments in Markate App your will need the Square Point of Sale App.</div>
                    <div>Install from <Button variant="link" className="text-teal-600 p-0 h-auto text-sm">App Store</Button> - iOS or <Button variant="link" className="text-teal-600 p-0 h-auto text-sm">Google Play</Button> - Android</div>
                  </div>
                </div>

                {/* Don't have account */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Don&apos;t have a Square account?</h4>
                  <div className="text-gray-700 space-y-2">
                    <div>Sign up for Square and get free processing up to $2,000 in credit card transactions for the first 180 days (this applies only to new Square users).</div>
                    <Button variant="link" className="text-teal-600 p-0 h-auto text-sm">Sign up for Square</Button>
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