'use client';

import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import PDFViewer from '@/components/pdf/PDFViewer';

interface SignaturePreviewProps {
  documentName: string;
  documentUrl: string;
  signatureData: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SignaturePreview({ 
  documentName,
  documentUrl, 
  signatureData, 
  onConfirm, 
  onCancel 
}: SignaturePreviewProps) {
  const [signatureFields] = useState([
    {
      page: 1,
      x: 100,
      y: 500,
      width: 200,
      height: 80,
      signatureData: signatureData
    }
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Preview Signature Placement
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Review how your signature will appear on {documentName}
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PDFViewer 
            url={documentUrl}
            signatureFields={signatureFields}
          />
        </div>
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Your signature will be placed at the indicated position
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Change Signature
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm & Sign Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}