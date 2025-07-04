'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';

// Configure PDF.js to use a CDN worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

interface SimplePDFViewerProps {
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

export default function SimplePDFViewer({ document, onClose }: SimplePDFViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPDF();
    fetchSignatures();
  }, [document.fileUrl]);

  useEffect(() => {
    if (pdf) {
      renderPage();
    }
  }, [pdf, currentPage, scale]);

  const fetchSignatures = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/signatures`);
      if (response.ok) {
        const data = await response.json();
        setSignatures(data.signatures);
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }
  };

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loadingTask = pdfjsLib.getDocument(document.fileUrl);
      const pdfDoc = await loadingTask.promise;
      
      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to load PDF');
      setLoading(false);
      console.error('Error loading PDF:', err);
    }
  };

  const renderPage = async () => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const changePage = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  const changeScale = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2.0, scale + delta));
    setScale(newScale);
  };

  // Get signatures for current page
  const currentPageSignatures = signatures.filter(sig => sig.page === currentPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{document.name}</h2>
          <span className={`text-sm px-3 py-1 rounded ${
            document.status === 'completed' 
              ? 'bg-green-600' 
              : document.status === 'pending'
              ? 'bg-yellow-600'
              : 'bg-gray-600'
          }`}>
            {document.status}
          </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
        <div ref={containerRef} className="relative bg-white shadow-2xl">
          {loading && (
            <div className="p-20 text-gray-500">Loading PDF...</div>
          )}
          {error && (
            <div className="p-20 text-red-500">{error}</div>
          )}
          {!loading && !error && (
            <>
              <canvas ref={canvasRef} className="max-w-full h-auto" />
              
              {/* Render signatures */}
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
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {/* Page Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
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
