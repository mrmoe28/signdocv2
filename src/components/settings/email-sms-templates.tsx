'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  MessageSquare,
  Plus
} from 'lucide-react';

export function EmailSmsTemplates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email & SMS Templates</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Coming Soon Message */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-12 w-12 text-gray-400" />
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Management Coming Soon</h3>
          <p className="text-gray-600 mb-4">Create and manage email and SMS templates for your communications</p>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Request Feature
          </Button>
        </div>

        {/* Placeholder Tabs */}
        <Tabs defaultValue="email" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Templates</TabsTrigger>
            <TabsTrigger value="sms">SMS Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Templates Coming Soon</h3>
              <p className="text-gray-600">Create professional email templates for your business</p>
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS Templates Coming Soon</h3>
              <p className="text-gray-600">Create SMS templates for quick customer communications</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}