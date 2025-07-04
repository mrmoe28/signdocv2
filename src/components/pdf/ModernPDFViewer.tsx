'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { configurePdfJs } from '@/lib/pdf-worker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    RefreshCw,
    FileText,
    Eye,
    EyeOff,
    Printer,
    Info,
    AlertCircle,
    X
} from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
configurePdfJs();

interface ModernPDFViewerProps {
    fileUrl: string;
    fileName?: string;
    onClose?: () => void;
}

interface PDFError {
    message: string;
    name?: string;
}

interface DocumentInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
}

interface DocumentLoadSuccess {
    numPages: number;
    info?: DocumentInfo;
}

const ModernPDFViewer: React.FC<ModernPDFViewerProps> = ({
    fileUrl,
    fileName = 'Document',
    onClose
}) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [showToolbar, setShowToolbar] = useState(true);
    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        // Ensure PDF.js is configured when component mounts
        configurePdfJs();
    }, []);

    const onDocumentLoadSuccess = ({ numPages, info }: DocumentLoadSuccess) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
        setDocumentInfo(info || null);
    };

    const onDocumentLoadError = (error: PDFError) => {
        console.error('PDF loading error:', error);
        setError(error.message || 'Failed to load PDF document');
        setLoading(false);
    };

    const onPageLoadError = (error: PDFError) => {
        console.error('PDF page loading error:', error);
        setError(error.message || 'Failed to load PDF page');
    };

    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(numPages || 1, prev + 1));
    };

    const zoomIn = () => {
        setScale(prev => Math.min(3, prev + 0.2));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(0.5, prev - 0.2));
    };

    const rotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const resetView = () => {
        setScale(1.2);
        setRotation(0);
        setPageNumber(1);
    };

    const downloadPDF = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    const printPDF = () => {
        window.open(fileUrl, '_blank');
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= (numPages || 1)) {
            setPageNumber(page);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '=':
                    case '+':
                        e.preventDefault();
                        zoomIn();
                        break;
                    case '-':
                        e.preventDefault();
                        zoomOut();
                        break;
                    case '0':
                        e.preventDefault();
                        resetView();
                        break;
                    case 'f':
                        e.preventDefault();
                        toggleFullscreen();
                        break;
                    case 'p':
                        e.preventDefault();
                        printPDF();
                        break;
                    case 's':
                        e.preventDefault();
                        downloadPDF();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        goToPrevPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        goToNextPage();
                        break;
                    case 'Home':
                        e.preventDefault();
                        setPageNumber(1);
                        break;
                    case 'End':
                        e.preventDefault();
                        setPageNumber(numPages || 1);
                        break;
                    case 'Escape':
                        if (isFullscreen) {
                            setIsFullscreen(false);
                        } else if (onClose) {
                            onClose();
                        }
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [numPages, isFullscreen, onClose]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading PDF document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">Error loading PDF</p>
                    <p className="text-sm text-red-500">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                        variant="outline"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`pdf-viewer ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
            {/* Toolbar */}
            {showToolbar && (
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                {fileName}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowInfo(!showInfo)}
                                >
                                    <Info className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowToolbar(false)}
                                >
                                    <EyeOff className="w-4 h-4" />
                                </Button>
                                {onClose && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Page Navigation */}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm min-w-0 flex items-center">
                                    <input
                                        type="number"
                                        value={pageNumber}
                                        onChange={(e) => goToPage(parseInt(e.target.value))}
                                        className="w-16 text-center border rounded px-2 py-1"
                                        min="1"
                                        max={numPages || 1}
                                    />
                                    <span className="mx-2">of {numPages}</span>
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= (numPages || 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={zoomOut}>
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-sm min-w-0">
                                    {Math.round(scale * 100)}%
                                </span>
                                <Button variant="outline" size="sm" onClick={zoomIn}>
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Tools */}
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={rotate}>
                                    <RotateCw className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={resetView}>
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={printPDF}>
                                    <Printer className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={downloadPDF}>
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show/Hide Toolbar Button */}
            {!showToolbar && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowToolbar(true)}
                    className="absolute top-4 left-4 z-10"
                >
                    <Eye className="w-4 h-4" />
                </Button>
            )}

            {/* Document Info Panel */}
            {showInfo && documentInfo && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-base">Document Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Title:</strong> {documentInfo.Title || 'N/A'}
                            </div>
                            <div>
                                <strong>Author:</strong> {documentInfo.Author || 'N/A'}
                            </div>
                            <div>
                                <strong>Subject:</strong> {documentInfo.Subject || 'N/A'}
                            </div>
                            <div>
                                <strong>Keywords:</strong> {documentInfo.Keywords || 'N/A'}
                            </div>
                            <div>
                                <strong>Creator:</strong> {documentInfo.Creator || 'N/A'}
                            </div>
                            <div>
                                <strong>Producer:</strong> {documentInfo.Producer || 'N/A'}
                            </div>
                            <div>
                                <strong>Creation Date:</strong> {documentInfo.CreationDate ? new Date(documentInfo.CreationDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div>
                                <strong>Modification Date:</strong> {documentInfo.ModDate ? new Date(documentInfo.ModDate).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* PDF Document */}
            <Card className="pdf-document-container">
                <CardContent className="p-4">
                    <div className="flex justify-center">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="text-center">
                                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                                    <p>Loading document...</p>
                                </div>
                            }
                            error={
                                <div className="text-center text-red-500">
                                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                    <p>Error loading document</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotation}
                                onLoadError={onPageLoadError}
                                loading={
                                    <div className="text-center">
                                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                                        <p>Loading page...</p>
                                    </div>
                                }
                                error={
                                    <div className="text-center text-red-500">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                        <p>Error loading page</p>
                                    </div>
                                }
                            />
                        </Document>
                    </div>
                </CardContent>
            </Card>

            {/* Keyboard Shortcuts Help */}
            <Card className="mt-4">
                <CardContent className="p-4">
                    <details className="text-sm">
                        <summary className="cursor-pointer font-medium mb-2">Keyboard Shortcuts</summary>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><kbd>←/→</kbd> Previous/Next page</div>
                            <div><kbd>Ctrl/Cmd + +/-</kbd> Zoom in/out</div>
                            <div><kbd>Ctrl/Cmd + 0</kbd> Reset view</div>
                            <div><kbd>Ctrl/Cmd + F</kbd> Fullscreen</div>
                            <div><kbd>Ctrl/Cmd + P</kbd> Print</div>
                            <div><kbd>Ctrl/Cmd + S</kbd> Download</div>
                            <div><kbd>Home/End</kbd> First/Last page</div>
                            <div><kbd>Esc</kbd> Close/Exit fullscreen</div>
                        </div>
                    </details>
                </CardContent>
            </Card>
        </div>
    );
};

export default ModernPDFViewer; 