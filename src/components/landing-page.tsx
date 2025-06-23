'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  FileText, 
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  color: string;
}

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl md:text-3xl font-bold ${color} mb-1 md:mb-2`}>{value}</div>
      <div className="text-xs md:text-sm text-gray-600">{label}</div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation Header */}
      <nav className="px-4 md:px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">JI</span>
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900">JOB INVOICER</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600 min-h-[44px]">
                <LogIn className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white min-h-[44px]">
                <UserPlus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign Up</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">JI</span>
            </div>
            <span className="font-bold text-xl md:text-2xl text-gray-900">JOB INVOICER</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight px-4">
            Professional Invoice Management
            <span className="text-green-600"> Made Simple</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Streamline your business operations with our comprehensive invoicing solution. 
            Track earnings, manage customers, and grow your business with confidence.
          </p>
          
          <div className="flex justify-center px-4">
            <Link href="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 w-full sm:w-auto min-h-[48px]">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 md:px-6 py-8 md:py-12 bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard value="$13,355" label="Total Revenue" color="text-green-600" />
            <StatCard value="$12,753" label="Net Profit" color="text-blue-600" />
            <StatCard value="3" label="Pending Estimates" color="text-orange-600" />
            <StatCard value="100%" label="Client Satisfaction" color="text-teal-600" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Our comprehensive suite of tools helps you stay organized, professional, and profitable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-white" />}
              title="Smart Invoicing"
              description="Create professional invoices in minutes with customizable templates and automated calculations."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              title="Payment Tracking"
              description="Monitor payments, track overdue invoices, and maintain healthy cash flow."
              color="bg-green-500"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-white" />}
              title="Job Scheduling"
              description="Organize your work schedule and never miss an important appointment or deadline."
              color="bg-purple-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              title="Business Analytics"
              description="Get insights into your business performance with detailed reports and analytics."
              color="bg-teal-500"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-white" />}
              title="Customer Management"
              description="Keep track of customer information, history, and communication in one place."
              color="bg-orange-500"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-white" />}
              title="Automation"
              description="Automate recurring tasks and workflows to save time and reduce errors."
              color="bg-red-500"
            />
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 md:px-6 py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
              Why Choose Job Invoicer?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Easy to Use</h3>
                  <p className="text-gray-600 text-sm">Intuitive interface designed for business owners, not tech experts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure & Reliable</h3>
                  <p className="text-gray-600 text-sm">Your data is protected with enterprise-grade security measures.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Save Time</h3>
                  <p className="text-gray-600 text-sm">Automate repetitive tasks and focus on growing your business.</p>
                </div>
              </div>
            </div>
            
            <Card className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="mb-6 opacity-90">
                  Join thousands of business owners who trust Job Invoicer for their invoicing needs.
                </p>
                <Link href="/auth">
                  <Button variant="secondary" size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    Start Your Free Trial
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 