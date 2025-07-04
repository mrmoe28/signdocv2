'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Upload, FileText, Plus, Eye, PenTool, Download, Trash2, Send, CheckCircle } from 'lucide-react';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import AddSignersModal from '@/components/signature/AddSignersModal';
import { Badge } from '@/components/ui/badge';

// Dynamically import PDF components to avoid SSR issues
const SignaturePlacement = dynamic(() => import('@/components/signature/SignaturePlacement'), {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading...</div>
});

const ModernPDFViewer = dynamic(() => import('@/components/pdf/ModernPDFViewer'), {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading document viewer...</div>
});

const DocuSealViewer = dynamic(() => import('@/components/pdf/DocuSealViewer'), {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading DocuSeal...</div>
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

export default function DocumentsPageWithDocuSeal() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showSignature, setShowSignature] = useState(false);
    const [showPlacement, setShowPlacement] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [showAddSigners, setShowAddSigners] = useState(false);
    const [showDocuSeal, setShowDocuSeal] = useState(false);
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'signed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Signed</Badge>;
            case 'pending_signature':
                return <Badge className="bg-yellow-100 text-yellow-800"><Send className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
        }
    };

    const handleDocuSealComplete = async () => {
        // Refresh documents when DocuSeal signing is complete
        await fetchDocuments();
        setShowDocuSeal(false);
        setSelectedDocument(null);
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
                            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <h3 className="font-semibold">{doc.name}</h3>
                                        <p className="text-sm text-gray-500">Uploaded {doc.uploadedAt}</p>
                                        <div className="mt-1">
                                            {getStatusBadge(doc.status)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDocument(doc);
                                            setShowViewer(true);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                        title="View Document"
                                    >
                                        <Eye className="h-5 w-5 text-gray-500" />
                                    </button>

                                    {/* DocuSeal E-Signature Option */}
                                    {(doc.status === 'draft' || doc.status === 'pending_signature') && (
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setShowDocuSeal(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                            title="Send for E-Signature with DocuSeal"
                                        >
                                            <Send className="h-4 w-4" />
                                            E-Sign
                                        </button>
                                    )}

                                    {/* Traditional Canvas Signature Option */}
                                    {doc.status === 'draft' && (
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setShowSignature(true);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Canvas Sign Document"
                                        >
                                            <PenTool className="h-5 w-5 text-orange-500" />
                                        </button>
                                    )}

                                    {doc.status === 'signed' && (
                                        <button
                                            onClick={() => {
                                                window.open(`/api/documents/${doc.id}/download`, '_blank');
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
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
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                        title="Add Signers"
                                    >
                                        <Plus className="h-5 w-5 text-gray-500" />
                                    </button>

                                    <button
                                        onClick={() => setDeleteConfirm({ show: true, document: doc })}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                        title="Delete Document"
                                        disabled={deleting === doc.id}
                                    >
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DocuSeal Modal */}
            {showDocuSeal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
                        <DocuSealViewer
                            documentId={selectedDocument.id}
                            documentName={selectedDocument.name}
                            documentUrl={selectedDocument.fileUrl}
                            onComplete={handleDocuSealComplete}
                            onClose={() => {
                                setShowDocuSeal(false);
                                setSelectedDocument(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showViewer && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
                        <ModernPDFViewer
                            fileUrl={selectedDocument.fileUrl}
                            fileName={selectedDocument.name}
                            onClose={() => {
                                setShowViewer(false);
                                setSelectedDocument(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Signature Canvas Modal */}
            {showSignature && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-semibold mb-4">Create Your Signature</h2>
                        <SignatureCanvas
                            onSignatureComplete={(signature) => {
                                setCurrentSignature(signature);
                                setShowSignature(false);
                                setShowPlacement(true);
                            }}
                            onCancel={() => setShowSignature(false)}
                        />
                    </div>
                </div>
            )}

            {/* Signature Placement Modal */}
            {showPlacement && selectedDocument && currentSignature && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
                        <SignaturePlacement
                            documentUrl={selectedDocument.fileUrl}
                            documentId={selectedDocument.id}
                            signatureData={currentSignature}
                            onComplete={() => {
                                setShowPlacement(false);
                                setSelectedDocument(null);
                                setCurrentSignature('');
                                fetchDocuments();
                            }}
                            onCancel={() => {
                                setShowPlacement(false);
                                setCurrentSignature('');
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Add Signers Modal */}
            {showAddSigners && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <AddSignersModal
                            documentId={selectedDocument.id}
                            onClose={() => {
                                setShowAddSigners(false);
                                setSelectedDocument(null);
                            }}
                            onSignersAdded={() => {
                                setShowAddSigners(false);
                                setSelectedDocument(null);
                                fetchDocuments();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && deleteConfirm.document && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Delete Document</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{deleteConfirm.document.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, document: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                disabled={deleting === deleteConfirm.document.id}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteDocument(deleteConfirm.document!.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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