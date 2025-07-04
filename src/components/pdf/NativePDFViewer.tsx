'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface NativePDFViewerProps {
    fileUrl: string;
    fileName?: string;
    height?: string;
}

export default function NativePDFViewer({
    fileUrl,
    fileName = 'Document',
    height = '600px'
}: NativePDFViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    const handleOpenNew = () => {
        window.open(fileUrl, '_blank');
    };

    const zoomIn = () => setZoom(prev => Math.min(200, prev + 25));
    const zoomOut = () => setZoom(prev => Math.max(50, prev - 25));

    // Construct PDF URL with zoom parameter
    const pdfUrl = `${fileUrl}#zoom=${zoom}`;

    return (
        <div className="pdf-native-viewer">
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg">
                <div>
                    <h3 className="font-semibold">{fileName}</h3>
                    <p className="text-sm text-gray-600">Native Browser Viewer • {zoom}%</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={zoom <= 50}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={zoom >= 200}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenNew}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* PDF Iframe */}
            <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ height }}>
                        <div className="text-red-500 text-xl mb-4">⚠️</div>
                        <p className="text-red-600 mb-4">Failed to load PDF</p>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => setError(null)}>Retry</Button>
                    </div>
                ) : (
                    <iframe
                        src={pdfUrl}
                        style={{ height, width: '100%' }}
                        onError={() => setError('PDF failed to load in browser')}
                        title={`PDF Viewer - ${fileName}`}
                        className="border-0"
                    />
                )}
            </div>

            {/* Fallback Options */}
            <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 rounded-b-lg">
                <p>
                    If PDF doesn&apos;t display, try:
                    <button
                        onClick={handleOpenNew}
                        className="text-blue-600 hover:underline mx-1"
                    >
                        Open in new tab
                    </button>
                    or
                    <button
                        onClick={handleDownload}
                        className="text-blue-600 hover:underline mx-1"
                    >
                        Download
                    </button>
                </p>
            </div>
        </div>
    );
} 