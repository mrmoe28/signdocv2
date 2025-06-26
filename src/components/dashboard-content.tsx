'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  Move,
  RotateCcw,
  Minimize2,
  Maximize2,
  Eye,
  Users,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Dynamically import react-grid-layout to avoid SSR issues
const GridLayout = dynamic(() => import('react-grid-layout'), { ssr: false });

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: 'green' | 'teal' | 'red' | 'orange' | 'blue' | 'purple';
  icon?: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

function KPICard({ title, value, subtitle, color, icon, trend }: KPICardProps) {
  const colorClasses = {
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    teal: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
  };

  return (
    <Card className={`${colorClasses[color]} border-0 h-full shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-3xl font-bold mb-2">{value}</div>
            <div className="text-sm opacity-90 font-medium">{title}</div>
            {subtitle && <div className="text-xs opacity-80 mt-1">{subtitle}</div>}
            {trend && (
              <div className="flex items-center mt-2 text-xs opacity-90">
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                )}
                <span>{trend.value} from last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="opacity-80 ml-4 flex-shrink-0 bg-white bg-opacity-20 rounded-lg p-3">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ReportCardProps {
  title: string;
  value: string;
  count?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

function ReportCard({ title, value, count, trend, icon }: ReportCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {value} {count && <span className="text-sm font-normal text-gray-500">({count})</span>}
      </div>
      {trend && (
        <div className={`flex items-center text-xs ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          )}
          <span>{trend.value} from last period</span>
        </div>
      )}
    </div>
  );
}

// Widget wrapper component with drag handle and minimize
function DashboardWidget({ 
  children, 
  isDraggable = false, 
  widgetId, 
  onMinimize, 
  isMinimized = false 
}: { 
  children: React.ReactNode;
  isDraggable?: boolean;
  widgetId: string;
  onMinimize?: (id: string) => void;
  isMinimized?: boolean;
}) {
  return (
    <div className="h-full relative group">
      {isDraggable && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <div 
            className="bg-gray-800 text-white p-1 rounded cursor-pointer hover:bg-gray-700"
            onClick={() => onMinimize?.(widgetId)}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </div>
          <div className="bg-gray-800 text-white p-1 rounded cursor-move drag-handle">
            <Move className="h-3 w-3" />
          </div>
        </div>
      )}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}

const defaultLayouts = [
  { i: 'kpi-1', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'kpi-2', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'kpi-3', x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'kpi-4', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 3 },
  { i: 'today-reports', x: 0, y: 3, w: 4, h: 10, minW: 3, minH: 8 },
  { i: 'profit-loss', x: 4, y: 3, w: 4, h: 10, minW: 3, minH: 8 },
  { i: 'job-forecast', x: 8, y: 3, w: 4, h: 10, minW: 3, minH: 8 },
  { i: 'business-performance', x: 0, y: 13, w: 6, h: 10, minW: 4, minH: 8 },
  { i: 'recent-activity', x: 6, y: 13, w: 6, h: 10, minW: 4, minH: 8 },
  { i: 'total-sales', x: 0, y: 23, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'invoice-aging', x: 4, y: 23, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'estimate-aging', x: 8, y: 23, w: 4, h: 8, minW: 3, minH: 6 },
];

export function DashboardContent() {
  const [dateRange, setDateRange] = useState('This Year');
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [isDashboardEnabled] = useState(true);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [isDraggable, setIsDraggable] = useState(false);
  const [minimizedCards, setMinimizedCards] = useState<Set<string>>(new Set());

  const handleCustomizeClick = () => {
    const newCustomizeMode = !isCustomizeMode;
    setIsCustomizeMode(newCustomizeMode);
    setIsDraggable(newCustomizeMode);
    console.log('Customize mode:', newCustomizeMode);
  };



  const handleLayoutChange = (layout: Array<{i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number}>) => {
    setLayouts(layout.map(item => ({
      ...item,
      minW: item.minW || 2,
      minH: item.minH || 2
    })));
  };

  const resetLayout = () => {
    setLayouts([...defaultLayouts]);
  };

  const handleMinimize = (widgetId: string) => {
    setMinimizedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const showAllCards = () => {
    setMinimizedCards(new Set());
  };

  // Memoize the grid layout to avoid re-renders
  const gridContent = useMemo(() => (
    <GridLayout
      className="layout"
      layout={layouts}
      cols={12}
      rowHeight={30}
      width={1400}
      margin={[20, 20]}
      containerPadding={[0, 0]}
      isDraggable={isDraggable}
      isResizable={isCustomizeMode}
      onLayoutChange={handleLayoutChange}
      useCSSTransforms={true}
    >
      {/* Enhanced KPI Cards */}
      <div key="kpi-1" style={{ display: minimizedCards.has('kpi-1') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="kpi-1"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('kpi-1')}
        >
          <KPICard
            title="Monthly Revenue"
            value="$650.00"
            color="green"
            icon={<DollarSign className="h-8 w-8" />}
            trend={{ value: "+12.5%", direction: "up" }}
          />
        </DashboardWidget>
      </div>
      
      <div key="kpi-2" style={{ display: minimizedCards.has('kpi-2') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="kpi-2"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('kpi-2')}
        >
          <KPICard
            title="Jobs Completed"
            value="0/0"
            subtitle="This Month"
            color="blue"
            icon={<CheckCircle className="h-8 w-8" />}
            trend={{ value: "0%", direction: "up" }}
          />
        </DashboardWidget>
      </div>
      
      <div key="kpi-3" style={{ display: minimizedCards.has('kpi-3') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="kpi-3"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('kpi-3')}
        >
          <KPICard
            title="Outstanding Invoices"
            value="$0.00"
            subtitle="0 invoices"
            color="red"
            icon={<AlertTriangle className="h-8 w-8" />}
          />
        </DashboardWidget>
      </div>
      
      <div key="kpi-4" style={{ display: minimizedCards.has('kpi-4') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="kpi-4"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('kpi-4')}
        >
          <KPICard
            title="Pipeline Value"
            value="$11,021.00"
            subtitle="3 estimates"
            color="purple"
            icon={<Target className="h-8 w-8" />}
            trend={{ value: "+8.3%", direction: "up" }}
          />
        </DashboardWidget>
      </div>

      {/* Enhanced Dashboard Cards */}
      <div key="today-reports" style={{ display: minimizedCards.has('today-reports') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="today-reports"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('today-reports')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Today&apos;s Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <ReportCard 
                title="Today's Jobs" 
                value="$0.00" 
                count="0" 
                icon={<Calendar className="h-4 w-4" />}
                trend={{ value: "0%", direction: "up" }}
              />
              <ReportCard 
                title="Revenue Earned" 
                value="$650.00" 
                icon={<DollarSign className="h-4 w-4" />}
                trend={{ value: "+15%", direction: "up" }}
              />
              <ReportCard 
                title="Tomorrow's Schedule" 
                value="$0.00" 
                count="0 jobs" 
                icon={<Calendar className="h-4 w-4" />}
              />
              <ReportCard 
                title="New Leads" 
                value="0" 
                icon={<Users className="h-4 w-4" />}
              />
              <ReportCard 
                title="Estimates Created" 
                value="$0.00" 
                count="0" 
                icon={<FileText className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="profit-loss" style={{ display: minimizedCards.has('profit-loss') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="profit-loss"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('profit-loss')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Profit & Loss Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="space-y-4 text-base mb-6">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600 text-lg">$13,355.63</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="font-bold text-red-600 text-lg">$900.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                  <span className="font-bold text-lg">Net Profit:</span>
                  <span className="font-bold text-2xl">$12,753.63</span>
                </div>
              </div>
              <div className="flex-1 min-h-[120px] bg-gradient-to-br from-green-400 via-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-inner">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">95.2%</div>
                  <div className="text-sm opacity-90">Profit Margin</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="job-forecast" style={{ display: minimizedCards.has('job-forecast') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="job-forecast"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('job-forecast')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                4-Week Job Forecast
              </CardTitle>
              <p className="text-sm text-gray-600">Upcoming scheduled work</p>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">0</div>
                  <div className="text-sm text-gray-500">Scheduled Jobs</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">3</div>
                  <div className="text-sm text-gray-500">Pending Estimates</div>
                </div>
              </div>
              <div className="flex-1 flex items-end justify-center gap-4 min-h-[140px] p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-300 h-12 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Week 1</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-300 h-8 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Week 2</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-teal-400 h-32 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Week 3</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-teal-500 h-24 w-16 rounded mb-2"></div>
                  <span className="text-xs text-gray-600">Week 4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      {/* New Enhanced Business Performance Card */}
      <div key="business-performance" style={{ display: minimizedCards.has('business-performance') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="business-performance"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('business-performance')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Business Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-gray-600">Total Invoices</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Project Completion Rate</span>
                  <span className="text-sm font-bold text-blue-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className="text-sm font-bold text-purple-600">+15.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      {/* New Recent Activity Card */}
      <div key="recent-activity" style={{ display: minimizedCards.has('recent-activity') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="recent-activity"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('recent-activity')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Invoice Created</div>
                  <div className="text-xs text-gray-600">INV-842129 for $450.00</div>
                </div>
                <div className="text-xs text-gray-500">2h ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">New Customer Added</div>
                  <div className="text-xs text-gray-600">Norma Cook</div>
                </div>
                <div className="text-xs text-gray-500">3h ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Estimate Sent</div>
                  <div className="text-xs text-gray-600">Solar installation quote</div>
                </div>
                <div className="text-xs text-gray-500">1d ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Appointment Scheduled</div>
                  <div className="text-xs text-gray-600">Site inspection next week</div>
                </div>
                <div className="text-xs text-gray-500">2d ago</div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="total-sales" style={{ display: minimizedCards.has('total-sales') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="total-sales"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('total-sales')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Total Sales</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 flex items-end justify-center gap-2 min-h-[100px] p-4 bg-gray-50 rounded-lg">
                <div className="bg-teal-400 h-24 w-12 rounded"></div>
                <div className="bg-blue-500 h-16 w-12 rounded"></div>
                <div className="bg-green-500 h-20 w-12 rounded"></div>
                <div className="bg-purple-500 h-12 w-12 rounded"></div>
              </div>
              <div className="text-center mt-4">
                <div className="text-2xl font-bold text-gray-900">$13,355.63</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="invoice-aging" style={{ display: minimizedCards.has('invoice-aging') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="invoice-aging"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('invoice-aging')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Aging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current (1-15 Days)</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>16-30 Days</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>31-45 Days</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>46+ Days</span>
                  <span className="font-medium text-red-600">$0.00</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">All Current</div>
                <div className="text-sm text-gray-600">No overdue invoices</div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="estimate-aging" style={{ display: minimizedCards.has('estimate-aging') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="estimate-aging"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('estimate-aging')}
        >
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Estimate Aging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>1-3 Days</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>4-7 Days</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>8-15 Days</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>16+ Days</span>
                  <span className="font-medium">$11,021.00</span>
                </div>
              </div>
              <div className="mt-4 h-32 bg-gradient-to-t from-teal-500 to-teal-400 rounded-lg flex items-end justify-center pb-4">
                <span className="text-white font-semibold">$11,021.00</span>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>
    </GridLayout>
  ), [layouts, isDraggable, isCustomizeMode, minimizedCards]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard for EKO SOLAR.LLC</h1>
            <p className="text-gray-600 mt-1">Comprehensive business overview and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              News and Updates
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Year">This Year</SelectItem>
                <SelectItem value="Last Year">Last Year</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
                <SelectItem value="Last Quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleCustomizeClick}
              variant={isCustomizeMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Move className="h-4 w-4" />
              {isCustomizeMode ? 'Done Customizing' : 'Customize'}
            </Button>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDashboardEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isDashboardEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
        
        {isCustomizeMode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Customize Mode Active</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={showAllCards}>
                  Show All Cards
                </Button>
                <Button size="sm" variant="outline" onClick={resetLayout}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Layout
                </Button>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Drag cards to rearrange, resize by dragging corners, or minimize cards using the controls.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Dashboard Grid */}
      <div className="p-6">
        <div style={{ minHeight: '800px' }}>
          {gridContent}
        </div>
      </div>
    </div>
  );
}