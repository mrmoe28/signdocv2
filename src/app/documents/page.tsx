'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Upload, FileText, Eye, PenTool, Download, Trash2, Send, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SendDocumentModal, { SendDocumentData } from '@/components/signature/SendDocumentModal';

// Dynamically import PDF components to avoid SSR issues
const SignaturePlacement = dynamic(() => import('@/components/signature/SignaturePlacement'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading signature placement...</div>
});

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
  const [savedSignatures, setSavedSignatures] = useState<Set<string>>(new Set());
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);

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
        await fetchDocuments(); // Refresh the list
        setSelectedFile(null);

        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
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

  const handleSendDocument = async (data: SendDocumentData) => {
    if (!selectedDocument) return;

    setSending(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Document sent successfully to both sender and recipient!');
        setShowSendModal(false);
        await fetchDocuments(); // Refresh documents to show updated status
      } else {
        const error = await response.json();
        alert(`Failed to send document: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Failed to send document. Please try again.');
    } finally {
      setSending(false);
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
                  <button
                    onClick={() => router.push(`/documents/send/${doc.id}`)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Send Envelope (DocuSign Style)"
                  >
                    <Mail className="h-5 w-5 text-orange-500" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowSendModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Send Document (Simple)"
                  >
                    <Send className="h-5 w-5 text-blue-500" />
                  </button>
                  {doc.status === 'draft' && (
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowViewer(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Add Signatures"
                    >
                      <PenTool className="h-5 w-5 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5 text-purple-500" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ show: true, document: doc })}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Delete Document"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal with Enhanced Signature Functionality */}
      {showViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full h-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">PDF Viewer - {selectedDocument.name}</h2>
              <button
                onClick={() => {
                  setShowViewer(false);
                  setSelectedDocument(null);
                  setSavedSignatures(new Set()); // Reset saved signatures
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <SignaturePlacement
                fileUrl={selectedDocument.fileUrl}
                onSignatureUpdate={async (signatures) => {
                  // Save any new fields to database
                  for (const signature of signatures) {
                    // Skip if already saved
                    if (savedSignatures.has(signature.id)) continue;

                    // Check if field has required data
                    const hasRequiredData = signature.type === 'signature'
                      ? signature.signatureData
                      : signature.textValue !== undefined;

                    if (hasRequiredData) {
                      try {
                        const response = await fetch('/api/signatures', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            documentId: selectedDocument.id,
                            signerName: 'Current User',
                            signerEmail: 'user@example.com',
                            fieldType: signature.type,
                            signatureData: signature.signatureData || null,
                            textValue: signature.textValue || null,
                            fontFamily: signature.fontFamily || 'Arial',
                            fontSize: signature.fontSize || 14,
                            positionX: signature.x,
                            positionY: signature.y,
                            width: signature.width,
                            height: signature.height,
                            pageNumber: signature.pageNumber
                          })
                        });

                        if (response.ok) {
                          setSavedSignatures(prev => new Set(prev).add(signature.id));
                          console.log(`✅ ${signature.type} field saved successfully`);
                        } else {
                          console.error('❌ Failed to save field:', await response.text());
                        }
                      } catch (error) {
                        console.error('❌ Failed to save field:', error);
                      }
                    }
                  }
                }}
                readOnly={false}
                existingSignatures={[]}
              />
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

      {/* Send Document Modal */}
      {selectedDocument && (
        <SendDocumentModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendDocument}
          documentName={selectedDocument.name}
          isLoading={sending}
        />
      )}
    </div>
  );
}