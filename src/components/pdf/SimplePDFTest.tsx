'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { configurePdfJs } from '@/lib/pdf-worker';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
configurePdfJs();

interface SimplePDFTestProps {
    fileUrl: string;
    fileName?: string;
}

export default function SimplePDFTest({ fileUrl, fileName = 'Document' }: SimplePDFTestProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1.0);
    const [fileAccessible, setFileAccessible] = useState<boolean | null>(null);
    const [documentLoading, setDocumentLoading] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('✅ PDF loaded successfully:', { numPages, fileUrl });
        setNumPages(numPages);
        setLoading(false);
        setDocumentLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('❌ PDF loading error:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        setError(`PDF Load Error: ${error.message}`);
        setLoading(false);
        setDocumentLoading(false);
    };

    const onPageLoadError = (error: Error) => {
        console.error('❌ PDF page loading error:', error);
        setError(`Page Load Error: ${error.message}`);
    };

    const onDocumentLoadProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        console.log('📄 PDF loading progress:', `${loaded}/${total} bytes`);
    };

    // Test file accessibility
    useEffect(() => {
        const testFileAccess = async () => {
            try {
                console.log('🔍 Testing file accessibility:', fileUrl);
                const response = await fetch(fileUrl, { method: 'HEAD' });
                const isAccessible = response.ok;
                setFileAccessible(isAccessible);

                console.log('📄 File test result:', {
                    url: fileUrl,
                    status: response.status,
                    accessible: isAccessible,
                    contentType: response.headers.get('content-type'),
                    contentLength: response.headers.get('content-length')
                });

                if (!isAccessible) {
                    setError(`File not accessible: ${response.status} ${response.statusText}`);
                    setLoading(false);
                } else {
                    // File is accessible, now try to load the PDF
                    setDocumentLoading(true);
                }
            } catch (error) {
                console.error('❌ File accessibility test failed:', error);
                setFileAccessible(false);
                setError('Failed to access PDF file');
                setLoading(false);
            }
        };

        if (fileUrl) {
            testFileAccess();
        }
    }, [fileUrl]);

    // Enhanced logging
    console.log('🔍 SimplePDFTest render state:', {
        fileUrl,
        fileName,
        loading,
        documentLoading,
        error,
        numPages,
        pageNumber,
        fileAccessible
    });

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading PDF: {fileName}</p>
                <p className="text-sm text-gray-500 mt-2">File: {fileUrl}</p>
                <p className="text-xs text-gray-400 mt-1">
                    Accessibility: {fileAccessible === null ? 'Testing...' : fileAccessible ? 'OK' : 'Failed'}
                </p>
                {documentLoading && (
                    <p className="text-xs text-blue-600 mt-1">Document loading...</p>
                )}
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg">
                <div className="text-red-500 text-2xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium mb-2">Error loading PDF</p>
                <p className="text-sm text-red-500 mb-4 text-center max-w-md">{error}</p>

                {/* Debug info */}
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded max-w-md">
                    <p><strong>File:</strong> {fileUrl}</p>
                    <p><strong>Name:</strong> {fileName}</p>
                    <p><strong>Accessible:</strong> {fileAccessible ? 'Yes' : 'No'}</p>
                    <p><strong>Worker:</strong> {typeof window !== 'undefined' ? 'Browser' : 'Server'}</p>
                </div>

                <button
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        setFileAccessible(null);
                        setDocumentLoading(false);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Show PDF document
    return (
        <div className="pdf-viewer-container">
            {/* Header with controls */}
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{fileName}</h3>
                        <p className="text-sm text-gray-600">
                            Page {pageNumber} of {numPages} • Scale: {Math.round(scale * 100)}%
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        >
                            Zoom Out
                        </button>
                        <button
                            onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        >
                            Zoom In
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Document */}
            <div className="flex justify-center border rounded-lg p-4 bg-white">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    onLoadProgress={onDocumentLoadProgress}
                    loading={
                        <div className="flex flex-col items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-gray-600">Loading document...</p>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center py-8 text-red-500">
                            <div className="text-xl mb-2">⚠️</div>
                            <p>Error loading document</p>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        onLoadError={onPageLoadError}
                        loading={
                            <div className="flex flex-col items-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                                <p className="text-gray-600">Loading page...</p>
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center py-8 text-red-500">
                                <div className="text-xl mb-2">⚠️</div>
                                <p>Error loading page</p>
                            </div>
                        }
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                    />
                </Document>
            </div>

            {/* Navigation */}
            {numPages && numPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    <span className="text-sm">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        disabled={pageNumber >= numPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
} 