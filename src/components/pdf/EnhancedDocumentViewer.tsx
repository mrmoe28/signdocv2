'use client';

import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '@/lib/pdf-worker';

interface Signature {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
}

interface EnhancedDocumentViewerProps {
  document: {
    id: string;
    name: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    signers: any[];
  };
  onClose: () => void;
}

export default function EnhancedDocumentViewer({
  document,
  onClose
}: EnhancedDocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    fetchSignatures();
  }, [document.id]);

  const fetchSignatures = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/signatures`);
      if (response.ok) {
        const data = await response.json();
        setSignatures(data.signatures);
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    } finally {
      setLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF document');
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeScale = (delta: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.0));
  };

  // Get signatures for current page
  const currentPageSignatures = signatures.filter(sig => sig.page === pageNumber);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{document.name}</h2>
          <span className={`text-sm px-3 py-1 rounded ${document.status === 'completed'
            ? 'bg-green-600'
            : document.status === 'pending'
              ? 'bg-yellow-600'
              : 'bg-gray-600'
            }`}>
            {document.status}
          </span>
          {signatures.length > 0 && (
            <span className="text-sm text-gray-300">
              {signatures.length} signature{signatures.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center">
        <div className="relative bg-white shadow-2xl">
          {pdfError ? (
            <div className="p-20 text-red-500">{pdfError}</div>
          ) : (
            <Document
              file={document.fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-20 text-gray-500">Loading PDF...</div>
              }
              error={
                <div className="p-20 text-red-500">Error loading PDF</div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          )}

          {/* Render signatures on current page */}
          {currentPageSignatures.map((signature) => (
            <div
              key={signature.id}
              className="absolute border-2 border-green-500 bg-white bg-opacity-90 p-1"
              style={{
                left: `${signature.x * scale}px`,
                top: `${signature.y * scale}px`,
                width: `${signature.width * scale}px`,
                height: `${signature.height * scale}px`,
              }}
            >
              <img
                src={signature.value}
                alt={`Signature by ${signature.signerName}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-6 left-0 text-xs bg-green-600 text-white px-2 py-1 rounded whitespace-nowrap">
                {signature.signerName} • {new Date(signature.signedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {/* Page Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changeScale(-0.1)}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => changeScale(0.1)}
              disabled={scale >= 2.0}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
