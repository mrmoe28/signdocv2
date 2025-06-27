'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  Plus
} from 'lucide-react';

export function TaxRatesSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Rates</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Coming Soon Message */}
        <div className="text-center py-8">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Rate Management Coming Soon</h3>
          <p className="text-gray-600 mb-4">Configure and manage tax rates for your invoices</p>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Request Feature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 