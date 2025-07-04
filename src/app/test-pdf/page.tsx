'use client';

import { useState } from 'react';
import EmbedPDFViewer from '@/components/pdf/EmbedPDFViewer';

export default function TestPDFPage() {
    const [testUrl, setTestUrl] = useState('/uploads/sample-document.pdf');

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">PDF Loading Debug Test</h1>

            {/* URL Input */}
            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="font-semibold mb-2">Test URL:</h2>
                <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter PDF URL to test"
                />
                <p className="text-sm text-gray-600 mt-2">
                    Try: /uploads/sample-document.pdf or any uploaded PDF URL
                </p>
            </div>

            {/* Console Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded">
                <h2 className="font-semibold mb-2">Debug Instructions:</h2>
                <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Open browser DevTools (F12)</li>
                    <li>Go to Console tab</li>
                    <li>Look for PDF loading messages starting with 🔍, ✅, or ❌</li>
                    <li>Check for any errors or worker configuration issues</li>
                </ol>
            </div>

            {/* PDF Test */}
            <div className="border rounded-lg p-4">
                <h2 className="font-semibold mb-4">PDF Viewer Test:</h2>
                <EmbedPDFViewer
                    fileUrl={testUrl}
                    fileName={`Test: ${testUrl.split('/').pop()}`}
                />
            </div>

            {/* Direct Link Test */}
            <div className="mt-6 p-4 bg-gray-50 rounded">
                <h2 className="font-semibold mb-2">Direct File Access Test:</h2>
                <a
                    href={testUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    Open {testUrl} directly in browser
                </a>
                <p className="text-sm text-gray-600 mt-1">
                    This should open the PDF in the browser&apos;s built-in viewer if the file exists
                </p>
            </div>
        </div>
    );
} 