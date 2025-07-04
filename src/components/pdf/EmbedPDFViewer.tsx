'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface EmbedPDFViewerProps {
    fileUrl: string;
    fileName?: string;
    height?: string;
}

export default function EmbedPDFViewer({
    fileUrl,
    fileName = 'Document',
    height = '600px'
}: EmbedPDFViewerProps) {
    const [error, setError] = useState<string | null>(null);
    const [fallbackToObject, setFallbackToObject] = useState(false);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    const handleOpenNew = () => {
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="embed-pdf-viewer">
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg">
                <div>
                    <h3 className="font-semibold">{fileName}</h3>
                    <p className="text-sm text-gray-600">Embed PDF Viewer</p>
                </div>

                <div className="flex items-center space-x-2">
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

            {/* PDF Embed */}
            <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ height }}>
                        <div className="text-red-500 text-xl mb-4">⚠️</div>
                        <p className="text-red-600 mb-4">Failed to load PDF</p>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <div className="flex space-x-2">
                            <Button onClick={() => setError(null)}>Retry</Button>
                            <Button variant="outline" onClick={handleOpenNew}>
                                Open in New Tab
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div style={{ height, width: '100%' }}>
                        {!fallbackToObject ? (
                            <embed
                                src={fileUrl}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                onError={() => {
                                    console.log('Embed failed, trying object tag');
                                    setFallbackToObject(true);
                                }}
                            />
                        ) : (
                            <object
                                data={fileUrl}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                onError={() => setError('PDF cannot be displayed in this browser')}
                            >
                                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                                    <p className="text-gray-600 mb-4">
                                        PDF cannot be displayed in this browser.
                                    </p>
                                    <Button onClick={handleOpenNew} className="mb-2">
                                        Open in New Tab
                                    </Button>
                                    <Button variant="outline" onClick={handleDownload}>
                                        Download PDF
                                    </Button>
                                </div>
                            </object>
                        )}
                    </div>
                )}
            </div>

            {/* Fallback Options */}
            <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 rounded-b-lg">
                <p>
                    If PDF doesn&apos;t display properly:
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