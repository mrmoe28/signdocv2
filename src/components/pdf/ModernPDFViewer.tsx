'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, RotateCw } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Import our modern PDF worker configuration
import '../../lib/pdf-worker';

interface ModernPDFViewerProps {
    document: {
        id: string;
        name: string;
        fileUrl: string;
    };
    onClose: () => void;
}

interface DocumentLoadSuccess {
    numPages: number;
}

export default function ModernPDFViewer({ document, onClose }: ModernPDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [rotation, setRotation] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle document load success
    const onDocumentLoadSuccess = useCallback(({ numPages }: DocumentLoadSuccess) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }, []);

    // Handle document load error
    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('PDF load error:', error);
        setError('Failed to load PDF document. Please try again.');
        setLoading(false);
    }, []);

    // Handle page load success
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPageLoadSuccess = useCallback((page: any) => {
        // Page loaded successfully - could track page width here if needed
        console.log('Page loaded:', page.pageNumber);
    }, []);

    // Handle page load error
    const onPageLoadError = useCallback((error: Error) => {
        console.error('PDF page load error:', error);
        setError('Failed to load PDF page. Please try again.');
    }, []);

    // Navigation functions
    const goToPrevPage = useCallback(() => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber(prev => Math.min(prev + 1, numPages));
    }, [numPages]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= numPages) {
            setPageNumber(page);
        }
    }, [numPages]);

    // Zoom functions
    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.2);
    }, []);

    // Rotation function
    const rotateDocument = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    // Download function
    const downloadPDF = useCallback(() => {
        const link = window.document.createElement('a');
        link.href = document.fileUrl;
        link.download = document.name;
        link.click();
    }, [document]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowLeft':
                    goToPrevPage();
                    break;
                case 'ArrowRight':
                    goToNextPage();
                    break;
                case 'Escape':
                    onClose();
                    break;
                case '+':
                case '=':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        zoomOut();
                    }
                    break;
                case '0':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        resetZoom();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [goToPrevPage, goToNextPage, onClose, zoomIn, zoomOut, resetZoom]);

    // Handle page input change
    const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const page = parseInt(event.target.value, 10);
        if (!isNaN(page)) {
            goToPage(page);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
            {/* Header */}
            <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                        {document.name}
                    </h2>
                    {!loading && !error && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Page</span>
                            <input
                                type="number"
                                min="1"
                                max={numPages}
                                value={pageNumber}
                                onChange={handlePageInputChange}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                            <span>of {numPages}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Navigation Controls */}
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1 || loading}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous Page (←)"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages || loading}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Page (→)"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2" />

                    {/* Zoom Controls */}
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out (Ctrl+-)"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>

                    <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In (Ctrl++)"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    <button
                        onClick={resetZoom}
                        className="p-2 hover:bg-gray-100 rounded text-xs"
                        title="Reset Zoom (Ctrl+0)"
                    >
                        Reset
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2" />

                    {/* Rotation Control */}
                    <button
                        onClick={rotateDocument}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Rotate 90°"
                    >
                        <RotateCw className="h-5 w-5" />
                    </button>

                    {/* Download Control */}
                    <button
                        onClick={downloadPDF}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Download PDF"
                    >
                        <Download className="h-5 w-5" />
                    </button>

                    {/* Close Control */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Close (Esc)"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4"
            >
                {loading && (
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Loading PDF...</p>
                    </div>
                )}

                {error && (
                    <div className="text-white text-center">
                        <div className="text-red-400 text-6xl mb-4">⚠</div>
                        <p className="text-lg mb-2">Error Loading PDF</p>
                        <p className="text-gray-400">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white shadow-lg">
                        <Document
                            file={document.fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="text-gray-600 text-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                                    <p>Loading document...</p>
                                </div>
                            }
                            error={
                                <div className="text-red-600 text-center p-8">
                                    <p>Failed to load PDF file.</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotation}
                                onLoadSuccess={onPageLoadSuccess}
                                onLoadError={onPageLoadError}
                                loading={
                                    <div className="text-gray-600 text-center p-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                                        <p>Loading page...</p>
                                    </div>
                                }
                                error={
                                    <div className="text-red-600 text-center p-8">
                                        <p>Failed to load page.</p>
                                    </div>
                                }
                            />
                        </Document>
                    </div>
                )}
            </div>

            {/* Footer with quick help */}
            <div className="bg-gray-800 text-gray-300 px-6 py-2 text-xs">
                <div className="flex justify-center space-x-6">
                    <span>← → Navigate pages</span>
                    <span>Ctrl + / - Zoom</span>
                    <span>Esc Close</span>
                </div>
            </div>
        </div>
    );
} 