import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { documents, signatures } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // DocuSeal webhook payload structure
        const {
            event_type,
            data: {
                document_id,
                signer_email,
                signer_name,
                signature_data,
                signed_at,
                status
            }
        } = body;

        console.log('DocuSeal webhook received:', { event_type, document_id, signer_email, status });

        if (event_type === 'document.signed') {
            // Find our document by the document_id in metadata or by URL
            const document = await db
                .select()
                .from(documents)
                .where(eq(documents.id, document_id))
                .limit(1);

            if (!document[0]) {
                console.error('Document not found for signature webhook:', document_id);
                return NextResponse.json(
                    { error: 'Document not found' },
                    { status: 404 }
                );
            }

            // Save the signature to our database
            await db
                .insert(signatures)
                .values({
                    documentId: document[0].id,
                    signerName: signer_name,
                    signerEmail: signer_email,
                    signatureData: signature_data || 'DocuSeal signature',
                    position: {
                        page: 1,
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 100
                    },
                    signedAt: signed_at ? new Date(signed_at) : new Date(),
                });

            // Update document status
            await db
                .update(documents)
                .set({
                    status: 'signed',
                    completedAt: new Date(),
                    updatedAt: new Date()
                })
                .where(eq(documents.id, document[0].id));

            console.log('Document signature saved successfully:', {
                documentId: document[0].id,
                signer: signer_email
            });

            return NextResponse.json({
                success: true,
                message: 'Signature processed successfully'
            });
        }

        if (event_type === 'document.failed') {
            // Handle signing failure
            const document = await db
                .select()
                .from(documents)
                .where(eq(documents.id, document_id))
                .limit(1);

            if (document[0]) {
                await db
                    .update(documents)
                    .set({
                        status: 'failed',
                        updatedAt: new Date()
                    })
                    .where(eq(documents.id, document[0].id));
            }

            console.log('Document signing failed:', document_id);
            return NextResponse.json({
                success: true,
                message: 'Document signing failure recorded'
            });
        }

        // Handle other event types as needed
        return NextResponse.json({
            success: true,
            message: 'Webhook received',
            event_type
        });

    } catch (error) {
        console.error('DocuSeal webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Allow DocuSeal to send webhooks without CSRF protection
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
} 