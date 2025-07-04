'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Eye,
  Plus,
  ArrowRight,
  Download
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  status: 'draft' | 'sent' | 'completed' | 'cancelled';
  uploadedAt: string;
  sentAt?: string;
  completedAt?: string;
  signers: Array<{ id: string; name: string; email: string; }>;
}

interface DashboardStats {
  totalDocuments: number;
  awaitingSignature: number;
  completed: number;
  drafts: number;
}

function QuickStatsCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentCard({ document, onView }: { document: Document; onView: (doc: Document) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {document.name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(document.uploadedAt)}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {getStatusIcon(document.status)}
            <span className="ml-1 capitalize">{document.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{document.signers.length} signers</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(document);
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/api/uploads${document.fileUrl}`, '_blank');
              }}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    awaitingSignature: 0,
    completed: 0,
    drafts: 0
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      const docs = data.documents || [];
      setDocuments(docs);

      // Calculate stats
      const stats = docs.reduce((acc: DashboardStats, doc: Document) => {
        acc.totalDocuments++;
        switch (doc.status) {
          case 'sent':
            acc.awaitingSignature++;
            break;
          case 'completed':
            acc.completed++;
            break;
          case 'draft':
            acc.drafts++;
            break;
        }
        return acc;
      }, { totalDocuments: 0, awaitingSignature: 0, completed: 0, drafts: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful:', result);

        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Automatically redirect to envelope preparation
        router.push(`/documents/send/${result.document.id}`);
      } else {
        const error = await response.json();
        console.error('❌ Upload failed:', error);
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload failed: Network error');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (document: Document) => {
    if (document.status === 'draft') {
      router.push(`/documents/send/${document.id}`);
    } else {
      // For sent/completed documents, go to documents page
      router.push('/documents');
    }
  };

  const recentDocuments = documents.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                <p className="text-gray-600 mt-1">Let&apos;s get your documents signed</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/documents')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  All Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Upload Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center text-white">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Send a Document for Signature</h2>
                  <p className="text-blue-100 mb-6">
                    Upload your PDF and we&apos;ll guide you through adding recipients and signature fields
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Upload & Send Document
                      </>
                    )}
                  </label>
                  <p className="text-blue-100 text-sm mt-3">
                    PDF files up to 50MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <QuickStatsCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={FileText}
            color="bg-blue-500"
          />
          <QuickStatsCard
            title="Awaiting Signature"
            value={stats.awaitingSignature}
            icon={Clock}
            color="bg-orange-500"
          />
          <QuickStatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <QuickStatsCard
            title="Drafts"
            value={stats.drafts}
            icon={AlertTriangle}
            color="bg-gray-500"
          />
        </div>

        {/* Recent Documents */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Recent Documents
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => router.push('/documents')}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-6">
                  Upload your first document to get started with digital signatures
                </p>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Upload Document
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}