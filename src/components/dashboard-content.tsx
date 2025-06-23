'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  FileText,
  ExternalLink
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: 'green' | 'teal' | 'red' | 'orange';
  icon?: React.ReactNode;
}

function KPICard({ title, value, subtitle, color, icon }: KPICardProps) {
  const colorClasses = {
    green: 'bg-green-400 text-white',
    teal: 'bg-teal-400 text-white',
    red: 'bg-red-400 text-white',
    orange: 'bg-orange-400 text-white'
  };

  return (
    <Card className={`${colorClasses[color]} border-0`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xl md:text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs md:text-sm opacity-90 truncate">{title}</div>
            {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
          </div>
          {icon && <div className="opacity-80 ml-2 flex-shrink-0">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

interface ReportCardProps {
  title: string;
  value: string;
  count?: string;
}

function ReportCard({ title, value, count }: ReportCardProps) {
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-900">
        {value} {count && <span className="text-sm font-normal text-gray-500">({count})</span>}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const [dateRange, setDateRange] = useState('This Year');
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [isDashboardEnabled, setIsDashboardEnabled] = useState(true);

  const handleCustomizeClick = () => {
    setIsCustomizeMode(!isCustomizeMode);
    // You can add more customization logic here
    console.log('Customize mode:', !isCustomizeMode);
  };

  const handleToggleEnabled = () => {
    setIsDashboardEnabled(!isDashboardEnabled);
    console.log('Dashboard enabled:', !isDashboardEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard for EKO SOLAR.LLC</h1>
          </div>
          <Button variant="link" className="text-blue-600 text-sm self-start sm:self-auto">
            <ExternalLink className="h-4 w-4 mr-1" />
            News and Updates
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <KPICard
            title="Earned This Month"
            value="$650.00"
            color="green"
            icon={<DollarSign className="h-8 w-8" />}
          />
          <KPICard
            title="Jobs Completed Month To Date"
            value="0/0"
            subtitle="(Avg. $0.00)"
            color="teal"
            icon={<Calendar className="h-8 w-8" />}
          />
          <KPICard
            title="Total Invoice Due"
            value="$0.00"
            subtitle="(0)"
            color="red"
            icon={<FileText className="h-8 w-8" />}
          />
          <KPICard
            title="Total Estimate Pending"
            value="$11,021.00"
            subtitle="(3)"
            color="green"
            icon={<TrendingUp className="h-8 w-8" />}
          />
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="This Year">This Year</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="This Week">This Week</SelectItem>
                  <SelectItem value="Today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-gray-600">For 01 Jan 2025 to 31 Dec 2025</span>
          </div>
          <div className="flex gap-2 lg:ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-blue-600 min-h-[44px] ${isCustomizeMode ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={handleCustomizeClick}
            >
              {isCustomizeMode ? 'Done' : 'customize'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`min-h-[44px] ${isDashboardEnabled ? 'bg-green-50 text-green-600 border-green-300' : 'bg-gray-50 text-gray-600'}`}
              onClick={handleToggleEnabled}
            >
              {isDashboardEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Today's Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReportCard title="Today's Jobs" value="$0.00" count="0" />
              <ReportCard title="Earned Today" value="$650.00" />
              <ReportCard title="Tomorrow Job Earnings" value="$0.00" count="0" />
              <ReportCard title="Jobs Booked Today" value="$0.00" count="0" />
              <ReportCard title="Today's Estimates" value="$0.00" count="0" />
              <ReportCard title="Today's Leads" value="0" />
            </CardContent>
          </Card>

          {/* Profit and Loss */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profit and Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-semibold">$13355.63</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses:</span>
                  <span className="font-semibold">$900.00</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Net Profit:</span>
                  <span className="font-semibold">$12753.63</span>
                </div>
              </div>
              <div className="mt-4 h-32 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Net Profit</span>
              </div>
            </CardContent>
          </Card>

          {/* Job Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Forecast</CardTitle>
              <p className="text-sm text-gray-600">From today to 4 weeks from now</p>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-end gap-2">
                <div className="bg-gray-200 h-8 w-16 rounded"></div>
                <div className="bg-teal-400 h-32 w-16 rounded"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Scheduled</span>
                <span>Unscheduled</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-center gap-4">
                <div className="text-center">
                  <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Due</span>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 h-12 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Overdue</span>
                </div>
                <div className="text-center">
                  <div className="bg-teal-400 h-32 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Paid</span>
                </div>
                <div className="text-center">
                  <div className="bg-blue-400 h-24 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Invoiced</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Aging */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span>Current</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>1-15 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>16-30 Days</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>31-45 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  <span>46+ Days</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>&gt;45 Days</span>
                </div>
              </div>
              <div className="h-24 bg-gray-100 rounded mt-4"></div>
            </CardContent>
          </Card>

          {/* Estimate Aging */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estimate Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span>Current</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>1-3 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>4-7 Days</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>8-15 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  <span>16+ Days</span>
                  <div className="flex-1 border-b border-dashed"></div>
                  <span>30+ Days</span>
                </div>
              </div>
              <div className="h-16 flex items-end justify-end">
                <div className="bg-teal-400 h-full w-full rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Business Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Business Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-green-100 rounded opacity-50"></div>
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Revenue • Expenses • Net Profit</div>
                    <div className="h-24 bg-gradient-to-r from-teal-400 to-green-400 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Won */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jobs Won</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-32 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">$4845</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-32 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-red-400 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 