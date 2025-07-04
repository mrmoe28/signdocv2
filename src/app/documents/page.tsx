'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Upload, FileText, Plus, Eye, PenTool, Download, Trash2 } from 'lucide-react';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import AddSignersModal from '@/components/signature/AddSignersModal';

// Dynamically import PDF components to avoid SSR issues
const SignaturePlacement = dynamic(() => import('@/components/signature/SignaturePlacement'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading...</div>
});

const ModernPDFViewer = dynamic(() => import('@/components/pdf/ModernPDFViewer'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading document viewer...</div>
});

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  signers: unknown[];
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showAddSigners, setShowAddSigners] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>('');
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
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchDocuments();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
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
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Document Signing</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Drag and drop your PDF here, or click to browse</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Select PDF'}
          </label>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>
      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className="text-sm text-gray-500">Uploaded {doc.uploadedAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium capitalize">{doc.status}</span>
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowViewer(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="View Document"
                  >
                    <Eye className="h-5 w-5 text-gray-500" />
                  </button>
                  {doc.status === 'draft' && (
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowSignature(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Sign Document"
                    >
                      <PenTool className="h-5 w-5 text-blue-500" />
                    </button>
                  )}
                  {doc.status === 'completed' && (
                    <button
                      onClick={() => {
                        window.open(`/api/documents/${doc.id}/download`, '_blank');
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Download Signed PDF"
                    >
                      <Download className="h-5 w-5 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowAddSigners(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Add Signers"
                  >
                    <Plus className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm({ show: true, document: doc });
                    }}
                    className="p-2 hover:bg-red-100 rounded"
                    title="Delete Document"
                    disabled={deleting === doc.id}
                  >
                    <Trash2 className={`h-5 w-5 ${deleting === doc.id ? 'text-gray-400' : 'text-red-500'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Signature Canvas Modal */}
      {showSignature && (
        <SignatureCanvas
          onSave={(signature) => {
            setCurrentSignature(signature);
            setShowSignature(false);
            setShowPlacement(true);
          }}
          onClose={() => {
            setShowSignature(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Signature Placement Modal */}
      {showPlacement && selectedDocument && (
        <SignaturePlacement
          documentName={selectedDocument.name}
          documentUrl={selectedDocument.fileUrl}
          signatureData={currentSignature}
          onConfirm={async (position) => {
            try {
              // Save signature to document
              const response = await fetch(`/api/documents/${selectedDocument.id}/signatures`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  signatureData: currentSignature,
                  position,
                  signerName: 'Test User',
                  signerEmail: 'user@example.com'
                }),
              });

              if (response.ok) {
                const data = await response.json();
                alert(data.documentCompleted
                  ? 'Document signing completed!'
                  : 'Signature placed successfully!');
              } else {
                alert('Failed to save signature');
              }
            } catch (error) {
              console.error('Error saving signature:', error);
              alert('Failed to save signature');
            }

            setShowPlacement(false);
            setSelectedDocument(null);
            setCurrentSignature('');
            // Refresh documents
            fetchDocuments();
          }}
          onCancel={() => {
            setShowPlacement(false);
            setShowSignature(true);
          }}
        />
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <ModernPDFViewer
          document={selectedDocument}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Add Signers Modal */}
      {showAddSigners && selectedDocument && (
        <AddSignersModal
          documentId={selectedDocument.id}
          documentName={selectedDocument.name}
          onClose={() => {
            setShowAddSigners(false);
            setSelectedDocument(null);
          }}
          onSuccess={() => {
            fetchDocuments();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.document && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{deleteConfirm.document.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, document: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deleting === deleteConfirm.document.id}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteConfirm.document!.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleting === deleteConfirm.document.id}
              >
                {deleting === deleteConfirm.document.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}