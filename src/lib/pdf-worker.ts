// PDF.js worker configuration for modern browsers
// This uses CDN-based workers to avoid build issues with Next.js 15

import { pdfjs } from 'react-pdf';

// Export configuration for use in components
export const pdfConfig = {
  workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  version: '3.11.174'
};

// Configure PDF.js worker for better performance
export function configurePdfJs() {
  // Only configure once
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    console.log('✅ PDF.js already configured:', pdfjs.GlobalWorkerOptions.workerSrc);
    return;
  }

  try {
    // Use CDN worker for better performance and reliability
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

    // Configure additional options for better performance
    pdfjs.GlobalWorkerOptions.workerPort = null;

    console.log('✅ PDF.js worker configured:', {
      version: pdfjs.version,
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc
    });
  } catch (error) {
    console.error('❌ Failed to configure PDF.js worker:', error);

    // Fallback configuration
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log('✅ PDF.js fallback worker configured');
    } catch (fallbackError) {
      console.error('❌ PDF.js fallback configuration failed:', fallbackError);
    }
  }
}

// Initialize PDF.js if in browser environment
if (typeof window !== 'undefined') {
  configurePdfJs();
}

export default pdfConfig;
