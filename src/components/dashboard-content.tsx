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
  Eye
} from 'lucide-react';

// Dynamically import react-grid-layout to avoid SSR issues
const GridLayout = dynamic(() => import('react-grid-layout'), { ssr: false });

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
    <Card className={`${colorClasses[color]} border-0 h-full`}>
      <CardContent className="p-4 md:p-6 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
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
  { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-3', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-4', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'today-reports', x: 0, y: 2, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'profit-loss', x: 4, y: 2, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'job-forecast', x: 8, y: 2, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'total-sales', x: 0, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'invoice-aging', x: 4, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'estimate-aging', x: 8, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'business-performance', x: 0, y: 18, w: 8, h: 8, minW: 6, minH: 6 },
  { i: 'jobs-won', x: 8, y: 18, w: 2, h: 4, minW: 2, minH: 4 },
  { i: 'expenses', x: 10, y: 18, w: 2, h: 4, minW: 2, minH: 4 },
];

export function DashboardContent() {
  const [dateRange, setDateRange] = useState('This Year');
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [isDashboardEnabled, setIsDashboardEnabled] = useState(true);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [isDraggable, setIsDraggable] = useState(false);
  const [minimizedCards, setMinimizedCards] = useState<Set<string>>(new Set());

  const handleCustomizeClick = () => {
    const newCustomizeMode = !isCustomizeMode;
    setIsCustomizeMode(newCustomizeMode);
    setIsDraggable(newCustomizeMode);
    console.log('Customize mode:', newCustomizeMode);
  };

  const handleToggleEnabled = () => {
    setIsDashboardEnabled(!isDashboardEnabled);
    console.log('Dashboard enabled:', !isDashboardEnabled);
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
      width={1200}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isDraggable={isDraggable}
      isResizable={isCustomizeMode}
      onLayoutChange={handleLayoutChange}
      useCSSTransforms={true}
    >
      {/* KPI Cards */}
      <div key="kpi-1" style={{ display: minimizedCards.has('kpi-1') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="kpi-1"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('kpi-1')}
        >
          <KPICard
            title="Earned This Month"
            value="$650.00"
            color="green"
            icon={<DollarSign className="h-8 w-8" />}
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
            title="Jobs Completed Month To Date"
            value="0/0"
            subtitle="(Avg. $0.00)"
            color="teal"
            icon={<Calendar className="h-8 w-8" />}
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
            title="Total Invoice Due"
            value="$0.00"
            subtitle="(0)"
            color="red"
            icon={<FileText className="h-8 w-8" />}
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
            title="Total Estimate Pending"
            value="$11,021.00"
            subtitle="(3)"
            color="green"
            icon={<TrendingUp className="h-8 w-8" />}
          />
        </DashboardWidget>
      </div>

      {/* Dashboard Cards */}
      <div key="today-reports" style={{ display: minimizedCards.has('today-reports') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="today-reports"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('today-reports')}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <ReportCard title="Today's Jobs" value="$0.00" count="0" />
              <ReportCard title="Earned Today" value="$650.00" />
              <ReportCard title="Tomorrow Job Earnings" value="$0.00" count="0" />
              <ReportCard title="Jobs Booked Today" value="$0.00" count="0" />
              <ReportCard title="Today's Estimates" value="$0.00" count="0" />
              <ReportCard title="Today's Leads" value="0" />
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Profit and Loss</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
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
              <div className="mt-4 flex-1 min-h-[100px] bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Net Profit</span>
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Job Forecast</CardTitle>
              <p className="text-sm text-gray-600">From today to 4 weeks from now</p>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 flex items-end justify-end gap-2 min-h-[120px]">
                <div className="bg-gray-200 h-8 w-16 rounded"></div>
                <div className="bg-teal-400 h-32 w-16 rounded"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Scheduled</span>
                <span>Unscheduled</span>
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Total Sales</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 flex items-end justify-center gap-4 min-h-[120px]">
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
        </DashboardWidget>
      </div>

      <div key="invoice-aging" style={{ display: minimizedCards.has('invoice-aging') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="invoice-aging"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('invoice-aging')}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Aging</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
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
              <div className="flex-1 bg-gray-100 rounded mt-4 min-h-[60px]"></div>
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Estimate Aging</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
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
              <div className="flex-1 flex items-end justify-end min-h-[60px]">
                <div className="bg-teal-400 h-full w-full rounded"></div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="business-performance" style={{ display: minimizedCards.has('business-performance') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="business-performance"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('business-performance')}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Business Performance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 relative min-h-[120px]">
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
        </DashboardWidget>
      </div>

      <div key="jobs-won" style={{ display: minimizedCards.has('jobs-won') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="jobs-won"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('jobs-won')}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Jobs Won</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="relative flex-1 flex items-center justify-center min-h-[80px]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">$4845</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>

      <div key="expenses" style={{ display: minimizedCards.has('expenses') ? 'none' : 'block' }}>
        <DashboardWidget 
          widgetId="expenses"
          isDraggable={isDraggable}
          onMinimize={handleMinimize}
          isMinimized={minimizedCards.has('expenses')}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="relative flex-1 flex items-center justify-center min-h-[80px]">
                <div className="w-24 h-24 rounded-full bg-red-400 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardWidget>
      </div>
    </GridLayout>
  ), [layouts, isDraggable, isCustomizeMode, minimizedCards, handleMinimize]);

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
              {isCustomizeMode ? 'Done' : 'Customize'}
            </Button>
            {isCustomizeMode && (
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[44px] text-gray-600"
                onClick={resetLayout}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            {minimizedCards.size > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[44px] text-green-600"
                onClick={showAllCards}
              >
                <Eye className="h-4 w-4 mr-1" />
                Show All ({minimizedCards.size})
              </Button>
            )}
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

        {/* Customize Mode Instructions */}
        {isCustomizeMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800">
              <Move className="h-4 w-4" />
              <span className="font-medium">Customize Mode Active</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Use the minimize button (-) to hide cards temporarily, drag the handle to move cards, or resize by dragging the edges. Click "Done" when finished.
            </p>
          </div>
        )}

        {/* Minimized Cards Notice */}
        {minimizedCards.size > 0 && !isCustomizeMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <Minimize2 className="h-4 w-4" />
                <span className="font-medium">
                  {minimizedCards.size} card{minimizedCards.size > 1 ? 's' : ''} minimized
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-yellow-700 hover:text-yellow-900"
                onClick={showAllCards}
              >
                Show All
              </Button>
            </div>
          </div>
        )}

        {/* Resizable Dashboard Grid */}
        <div className="dashboard-grid">
          {gridContent}
        </div>
      </div>
    </div>
  );
} 