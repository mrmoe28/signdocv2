// PDF.js Worker configuration
import { pdfjs } from 'react-pdf';

// Modern PDF.js worker configuration using CDN approach
// This is the recommended approach for 2024+ based on current best practices
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // Use CDN-based worker URL for better reliability and performance
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

// Polyfill for Promise.withResolvers if not available (React 18+ compatibility)
if (typeof Promise.withResolvers === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Promise as any).withResolvers = function () {
    let resolve: (value: unknown) => void;
    let reject: (reason?: unknown) => void;
    const promise = new Promise<unknown>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

// PDF.js configuration options for optimal performance
const PDF_CONFIG = {
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/',
  cMapUrl: 'https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/',
  cMapPacked: true,
  maxImageSize: 1024 * 1024, // 1MB limit for images
  verbosity: 0, // Reduce console noise in production
} as const;

// Apply configuration
Object.assign(pdfjs.GlobalWorkerOptions, PDF_CONFIG);

// Export configured pdfjs for use in components
export { pdfjs };

// Export helper functions for PDF operations
export const loadPDF = async (url: string) => {
  try {
    return await pdfjs.getDocument({
      url,
      ...PDF_CONFIG,
    }).promise;
  } catch (error) {
    console.error('Failed to load PDF:', error);
    throw new Error('Unable to load PDF document');
  }
};

export const renderPDFPage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
) => {
  try {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context not available');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error('Failed to render PDF page:', error);
    throw new Error('Unable to render PDF page');
  }
};
