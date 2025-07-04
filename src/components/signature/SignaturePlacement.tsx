'use client';

import { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { X, Move, Check } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '@/lib/pdf-worker';

interface SignaturePlacementProps {
  documentName: string;
  documentUrl: string;
  signatureData: string;
  onConfirm: (position: { page: number; x: number; y: number }) => void;
  onCancel: () => void;
}

export default function SignaturePlacement({
  documentName,
  documentUrl,
  signatureData,
  onConfirm,
  onCancel
}: SignaturePlacementProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  const handleMouseDown = (e: React.MouseEvent) => {
    const signatureElement = e.currentTarget;
    const rect = signatureElement.getBoundingClientRect();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - container.left - 100; // Center signature
    const newY = e.clientY - container.top - 40;

    setSignaturePosition({
      x: Math.max(0, Math.min(newX, container.width - 200)),
      y: Math.max(0, Math.min(newY, container.height - 80))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Move className="h-6 w-6" />
              Place Your Signature
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Drag your signature to position it on the document
          </p>
        </div>
        <div
          ref={containerRef}
          className="p-6 bg-gray-50 overflow-auto relative"
          style={{ maxHeight: 'calc(90vh - 200px)' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* PDF Display */}
          <div className="bg-white shadow-lg mx-auto relative" style={{ width: 'fit-content' }}>
            <Document
              file={documentUrl}
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
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {/* Draggable Signature */}
            <div
              className="absolute border-2 border-blue-500 bg-white p-2 cursor-move shadow-lg"
              style={{
                left: `${signaturePosition.x}px`,
                top: `${signaturePosition.y}px`,
                width: '200px',
                height: '80px'
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                src={signatureData}
                alt="Signature"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm({
                  page: pageNumber,
                  x: signaturePosition.x,
                  y: signaturePosition.y
                })}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Confirm Position
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}