'use client';

import { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '@/lib/pdf-worker';

interface DocumentViewerProps {
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
  onAddSignature?: (page: number, x: number, y: number) => void;
  signatureMode?: boolean;
}

export default function DocumentViewer({
  document,
  onClose,
  onAddSignature,
  signatureMode = false
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  function onPageLoadSuccess({ width, height }: { width: number; height: number }) {
    setPdfDimensions({ width, height });
  }

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!signatureMode || !onAddSignature || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    onAddSignature(pageNumber, x, y);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeScale = (delta: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.0));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{document.name}</h2>
          {signatureMode && (
            <span className="text-sm bg-blue-600 px-3 py-1 rounded">
              Click to place signature
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
        <div
          ref={containerRef}
          className={`bg-white shadow-2xl ${signatureMode ? 'cursor-crosshair' : ''}`}
          onClick={handlePageClick}
        >
          <Document
            file={document.fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
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
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={!signatureMode}
              renderAnnotationLayer={!signatureMode}
            />
          </Document>
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