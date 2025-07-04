'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Eye, Download, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  senderEmail?: string;
  recipientEmail?: string;
  sentAt?: string;
  signers: unknown[];
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; document: Document | null }>({
    show: false,
    document: null
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type first
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }

      // Check file size (optional - set reasonable limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);
      console.log('📁 File selected:', { name: file.name, size: file.size, type: file.type });
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Starting upload:', { name: file.name, size: file.size });

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const uploadTime = Date.now() - startTime;
      console.log('⏱️ Upload completed in:', uploadTime + 'ms');

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
      setSelectedFile(null);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setDeleting(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDocuments();
        setDeleteConfirm({ show: false, document: null });
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Upload and manage your documents for digital signatures</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Drag and drop your PDF here, or click to browse</p>
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
            className={`cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Select PDF File'
            )}
          </label>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            PDF files up to 50MB • Automatically starts signature workflow
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Documents</h2>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500">Upload your first PDF to get started with digital signatures</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-500">
                          Uploaded {formatDate(doc.uploadedAt)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        {doc.signers && doc.signers.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {doc.signers.length} signer{doc.signers.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Edit/Prepare button for drafts */}
                    {doc.status === 'draft' && (
                      <button
                        onClick={() => router.push(`/documents/send/${doc.id}`)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        title="Prepare for signature"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Prepare
                      </button>
                    )}

                    {/* View button */}
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowViewer(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="View document"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Download button */}
                    <button
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download document"
                    >
                      <Download className="h-5 w-5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirm({ show: true, document: doc })}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full h-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Document Viewer - {selectedDocument.name}</h2>
              <button
                onClick={() => {
                  setShowViewer(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="bg-white rounded-lg">
                <embed
                  src={`/api/uploads/${selectedDocument.fileUrl.replace('/uploads/', '')}`}
                  type="application/pdf"
                  className="w-full h-[600px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deleteConfirm.document?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, document: null })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={deleting !== null}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.document && handleDeleteDocument(deleteConfirm.document.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={deleting !== null}
              >
                {deleting === deleteConfirm.document?.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}