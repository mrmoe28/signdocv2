import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb as db } from '@/lib/db';
import { documents } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendDocumentEmail } from '@/lib/email-service';
import fs from 'fs';
import path from 'path';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { senderEmail, senderName, recipientEmail, recipientName, message } = body;

        // Validate required fields
        if (!senderEmail || !senderName || !recipientEmail || !recipientName) {
            return NextResponse.json(
                { error: 'Missing required fields: senderEmail, senderName, recipientEmail, recipientName' },
                { status: 400 }
            );
        }

        // Get document from database
        const document = await db.select().from(documents).where(eq(documents.id, id)).limit(1);

        if (!document.length) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        const doc = document[0];

        // Update document with sender and recipient info
        await db.update(documents)
            .set({
                senderEmail,
                recipientEmail,
                sentAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(documents.id, id));

        // Read PDF file
        let pdfBuffer: Buffer | undefined;
        try {
            const filePath = path.join(process.cwd(), 'public', doc.fileUrl);
            if (fs.existsSync(filePath)) {
                pdfBuffer = fs.readFileSync(filePath);
            }
        } catch (error) {
            console.error('Error reading PDF file:', error);
            // Continue without attachment if file can't be read
        }

        // Prepare email data
        const emailData = {
            documentId: doc.id,
            documentName: doc.name,
            senderEmail,
            senderName,
            recipientEmail,
            recipientName,
            message,
            companyName: 'Sign Docs'
        };

        // Send email
        const emailResult = await sendDocumentEmail(emailData, pdfBuffer);

        if (!emailResult.success) {
            return NextResponse.json(
                { error: `Failed to send email: ${emailResult.error}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Document sent successfully to both sender and recipient',
            messageId: emailResult.messageId
        });

    } catch (error) {
        console.error('Error sending document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 