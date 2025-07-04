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
  ArrowRight,
  Download,
  Zap,
  TrendingUp,
  Activity,
  Star,
  Send,
  Shield,
  Sparkles
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

function HeroStatsCard({ title, value, icon: Icon, gradient, description }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-8 w-8" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-90">{description}</div>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 opacity-75" />
          <span className="text-sm opacity-90">Active</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ModernDocumentCard({ document, onView }: { document: Document; onView: (doc: Document) => void }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700',
          icon: 'text-emerald-600',
          dot: 'bg-emerald-500'
        };
      case 'sent':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          dot: 'bg-blue-500'
        };
      case 'draft':
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          dot: 'bg-gray-500'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          dot: 'bg-gray-500'
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
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

  const styles = getStatusStyles(document.status);

  return (
    <Card className="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${styles.dot} rounded-full border-2 border-white`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {document.name}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span>{formatDate(document.uploadedAt)}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{document.signers.length} signers</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text} border`}>
              {getStatusIcon(document.status)}
              <span className="ml-1 capitalize">{document.status}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(document);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-3"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Remove /uploads/ prefix from fileUrl since API route adds it
                  const cleanPath = document.fileUrl.replace('/uploads/', '');
                  window.open(`/api/uploads/${cleanPath}`, '_blank');
                }}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 h-8 px-3"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              {document.status === 'completed' && document.completedAt && (
                <span>Completed {formatDate(document.completedAt)}</span>
              )}
              {document.status === 'sent' && document.sentAt && (
                <span>Sent {formatDate(document.sentAt)}</span>
              )}
              {document.status === 'draft' && (
                <span>Draft</span>
              )}
            </div>
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

        // Reset file input (client-side only)
        if (typeof window !== 'undefined') {
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Professional Document Signing</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Welcome to Your
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
                  Digital Signature Hub
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Transform your document workflow with secure, legally binding digital signatures.
                Fast, professional, and trusted by thousands.
              </p>

              {/* Main CTA */}
              <div className="max-w-lg mx-auto">
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
                  className={`group cursor-pointer inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                      <span>Uploading Document...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <span>Upload & Send Document</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </label>
                <p className="text-blue-100 text-sm mt-4">
                  PDF files up to 50MB • Secure • Lightning Fast
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <HeroStatsCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={FileText}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            description="All time"
          />
          <HeroStatsCard
            title="Pending Signatures"
            value={stats.awaitingSignature}
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            description="Action needed"
          />
          <HeroStatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-emerald-500 to-green-500"
            description="Signed & sealed"
          />
          <HeroStatsCard
            title="Drafts"
            value={stats.drafts}
            icon={AlertTriangle}
            gradient="bg-gradient-to-br from-gray-500 to-gray-600"
            description="Ready to send"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Send</h3>
              <p className="text-sm text-gray-600 mb-4">Upload and send a document for signature in seconds</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    document.getElementById('file-upload')?.click();
                  }
                }}
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Start Now
              </Button>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View Activity</h3>
              <p className="text-sm text-gray-600 mb-4">Track all your document signing activity and status</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/documents')}
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                View All
              </Button>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Legal</h3>
              <p className="text-sm text-gray-600 mb-4">Bank-level security with legally binding signatures</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="bg-white border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Recent Documents
                </CardTitle>
                <p className="text-gray-600">
                  Your latest document activity and signatures
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/documents')}
                className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <span>View All Documents</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentDocuments.map((doc) => (
                  <ModernDocumentCard
                    key={doc.id}
                    document={doc}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6 shadow-xl">
                  <FileText className="h-12 w-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="h-3 w-3 text-yellow-800" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Upload your first document and experience the power of digital signatures.
                  It&apos;s fast, secure, and legally binding.
                </p>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your First Document
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}