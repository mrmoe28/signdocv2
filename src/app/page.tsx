'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, PenTool, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Sign Docs</span>
            </div>
            <Link href="/documents">
              <Button>
                Go to Documents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Signing Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload, sign, and manage your PDF documents with ease
          </p>
          <Link href="/documents">
            <Button size="lg" className="mb-8">
              Start Signing Documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Upload PDFs</CardTitle>
              <CardDescription>
                Drag and drop your PDF files for instant upload
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <PenTool className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Add Signatures</CardTitle>
              <CardDescription>
                Draw or place signatures directly on your documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Manage Documents</CardTitle>
              <CardDescription>
                Organize and track all your signed documents
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Access your document management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/documents">
                <Button className="w-full" size="lg">
                  Open Documents Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
