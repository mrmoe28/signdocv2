'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  DollarSign, 
  Users, 
  BarChart3,
  LogIn,
  UserPlus,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">JI</span>
            </div>
            <span className="font-bold text-xl text-gray-900">JOB INVOICER</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                <UserPlus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Get Started</span>
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Simplify Your <span className="text-green-600">Invoice Management</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create, send, and track invoices effortlessly. Perfect for service-based businesses looking to streamline their billing process.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Manage Invoices
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Create Invoices</CardTitle>
              <CardDescription>
                Professional invoice templates with your branding
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Manage Customers</CardTitle>
              <CardDescription>
                Keep track of client information and history
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Track Payments</CardTitle>
              <CardDescription>
                Monitor payment status and send reminders
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>
                Insights into your business performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose Job Invoicer?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Easy to Use</h3>
                  <p className="text-gray-600">Intuitive interface designed for non-technical users</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Professional Templates</h3>
                  <p className="text-gray-600">Beautiful, customizable invoice templates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Reliable</h3>
                  <p className="text-gray-600">Your data is protected with enterprise-grade security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Friendly</h3>
                  <p className="text-gray-600">Access your invoices from anywhere, any device</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="p-8">
            <CardHeader className="text-center p-0 mb-6">
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Join thousands of businesses streamlining their invoicing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                <Link href="/auth/signup">
                  <Button className="w-full" size="lg">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-600 text-center">
                  No credit card required • Get started in 2 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">JI</span>
            </div>
            <span className="font-semibold text-gray-900">JOB INVOICER</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2025 Job Invoicer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 