import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { documents, signatureFields, signers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { readFile } from 'fs/promises';
import path from 'path';

type SignatureField = {
    id: string;
    fieldType: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    value: string | null;
    signerName: string;
    signerEmail: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: documentId } = await params;

        // Get document details
        const [document] = await db
            .select()
            .from(documents)
            .where(eq(documents.id, documentId))
            .limit(1);

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Get all signature fields for this document
        const fields = await db
            .select({
                id: signatureFields.id,
                fieldType: signatureFields.fieldType,
                page: signatureFields.page,
                x: signatureFields.x,
                y: signatureFields.y,
                width: signatureFields.width,
                height: signatureFields.height,
                value: signatureFields.value,
                signerName: signers.name,
                signerEmail: signers.email
            })
            .from(signatureFields)
            .innerJoin(signers, eq(signatureFields.signerId, signers.id))
            .where(eq(signatureFields.documentId, documentId));

        // Load the original PDF
        const pdfPath = path.join(process.cwd(), 'public', document.fileUrl);
        const existingPdfBytes = await readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Only process fields that have values (signed/filled)
        const filledFields = fields.filter(field => field.value);

        if (filledFields.length > 0) {
            // Embed fonts for text fields
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Process each filled signature field
            for (const field of filledFields) {
                const pages = pdfDoc.getPages();
                const page = pages[Math.floor(field.page) - 1]; // Pages are 0-indexed

                if (!page) continue;

                // Convert screen coordinates to PDF coordinates
                const pdfY = page.getHeight() - field.y - field.height;

                try {
                    switch (field.fieldType) {
                        case 'signature':
                            await embedSignature(pdfDoc, page, field, pdfY);
                            break;

                        case 'text':
                        case 'initials':
                            await embedText(page, field, pdfY, helveticaFont);
                            break;

                        case 'date':
                            await embedDate(page, field, pdfY, helveticaFont);
                            break;

                        default:
                            console.warn(`Unsupported field type: ${field.fieldType}`);
                    }
                } catch (error) {
                    console.error(`Error embedding field ${field.id}:`, error);
                    // Continue with other fields if one fails
                }
            }
        }

        // Generate the PDF with embedded content
        const pdfBytes = await pdfDoc.save();

        // Return the PDF as a blob for viewing
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="document-preview.pdf"',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Error generating PDF preview:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF preview' },
            { status: 500 }
        );
    }
}

// Helper function to embed signature images
async function embedSignature(pdfDoc: PDFDocument, page: PDFPage, field: SignatureField, pdfY: number) {
    try {
        let signatureData = field.value;

        if (!signatureData) {
            throw new Error('No signature data provided');
        }

        // Remove data URL prefix if present
        if (signatureData.startsWith('data:image/')) {
            signatureData = signatureData.split(',')[1];
        }

        // Convert base64 to buffer
        const signatureBuffer = Buffer.from(signatureData, 'base64');

        // Determine image format and embed accordingly
        let signatureImage;
        if (signatureData.startsWith('iVBORw0KGgo') || field.value?.includes('data:image/png')) {
            signatureImage = await pdfDoc.embedPng(signatureBuffer);
        } else if (signatureData.startsWith('/9j/') || field.value?.includes('data:image/jpeg')) {
            signatureImage = await pdfDoc.embedJpg(signatureBuffer);
        } else {
            // Default to PNG
            signatureImage = await pdfDoc.embedPng(signatureBuffer);
        }

        // Draw the signature on the page
        page.drawImage(signatureImage, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
        });
    } catch (error) {
        console.error('Error embedding signature:', error);
        throw error;
    }
}

// Helper function to embed text fields
async function embedText(page: PDFPage, field: SignatureField, pdfY: number, font: PDFFont) {
    try {
        const fontSize = Math.min(field.height * 0.6, 16);
        const textValue = field.value || '';

        page.drawText(textValue, {
            x: field.x + 2,
            y: pdfY + (field.height / 2) - (fontSize / 2),
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });
    } catch (error) {
        console.error('Error embedding text:', error);
        throw error;
    }
}

// Helper function to embed date fields
async function embedDate(page: PDFPage, field: SignatureField, pdfY: number, font: PDFFont) {
    try {
        let dateValue = field.value || '';

        // If the value is a timestamp or date object, format it
        if (dateValue && !isNaN(Date.parse(dateValue))) {
            const date = new Date(dateValue);
            dateValue = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        const fontSize = Math.min(field.height * 0.6, 14);

        page.drawText(dateValue, {
            x: field.x + 2,
            y: pdfY + (field.height / 2) - (fontSize / 2),
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });
    } catch (error) {
        console.error('Error embedding date:', error);
        throw error;
    }
} 