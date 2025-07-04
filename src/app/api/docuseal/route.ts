import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { db } from '@/lib/drizzle-db';
import { documents, signatures } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// DocuSeal configuration
const DOCUSEAL_TOKEN = process.env.DOCUSEAL_TOKEN || 'your-docuseal-token-here';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { documentId, signerEmail, signerName, documentUrl } = await request.json();

        if (!documentId || !signerEmail || !signerName || !documentUrl) {
            return NextResponse.json(
                { error: 'Missing required fields: documentId, signerEmail, signerName, documentUrl' },
                { status: 400 }
            );
        }

        // Verify document exists and user has access
        const document = await db
            .select()
            .from(documents)
            .where(eq(documents.id, documentId))
            .limit(1);

        if (!document[0]) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Create signing token for DocuSeal
        const token = jwt.sign({
            user_email: currentUser.email,
            integration_email: signerEmail,
            name: `${document[0].name} - Signature Request`,
            document_urls: [documentUrl],
            signer_name: signerName,
            signer_email: signerEmail,
            document_id: documentId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }, DOCUSEAL_TOKEN);

        // Update document status to indicate signing is in progress
        await db
            .update(documents)
            .set({
                status: 'pending_signature',
                updatedAt: new Date()
            })
            .where(eq(documents.id, documentId));

        return NextResponse.json({
            token,
            documentId,
            signerEmail,
            signerName,
            message: 'Signing token generated successfully'
        });

    } catch (error) {
        console.error('Error generating DocuSeal token:', error);
        return NextResponse.json(
            { error: 'Failed to generate signing token' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Get document signatures
        const documentSignatures = await db
            .select()
            .from(signatures)
            .where(eq(signatures.documentId, documentId));

        return NextResponse.json({
            documentId,
            signatures: documentSignatures,
            count: documentSignatures.length
        });

    } catch (error) {
        console.error('Error fetching document signatures:', error);
        return NextResponse.json(
            { error: 'Failed to fetch signatures' },
            { status: 500 }
        );
    }
} 