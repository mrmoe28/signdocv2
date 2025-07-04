import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb as db } from '@/lib/db';
import { signatures, signatureEvents } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// GET /api/signatures - List all signatures for a document
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        const documentSignatures = await db
            .select()
            .from(signatures)
            .where(eq(signatures.documentId, documentId))
            .orderBy(desc(signatures.createdAt));

        return NextResponse.json({ signatures: documentSignatures });
    } catch (error) {
        console.error('Error fetching signatures:', error);
        return NextResponse.json(
            { error: 'Failed to fetch signatures' },
            { status: 500 }
        );
    }
}

// POST /api/signatures - Create a new signature/field
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            documentId,
            signerName,
            signerEmail,
            signatureData,
            fieldType = 'signature',
            textValue,
            fontFamily = 'Arial',
            fontSize = 14,
            signatureType = 'drawn',
            positionX,
            positionY,
            width = 150,
            height = 60,
            pageNumber = 1
        } = body;

        // Validate required fields
        if (!documentId || !signerName || !signerEmail ||
            positionX === undefined || positionY === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate field type specific requirements
        if (fieldType === 'signature' && !signatureData) {
            return NextResponse.json(
                { error: 'Signature data is required for signature fields' },
                { status: 400 }
            );
        }

        // Get client IP and user agent for audit trail
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || '';

        // Create signature record
        const [newSignature] = await db
            .insert(signatures)
            .values({
                id: createId(),
                documentId,
                signerName,
                signerEmail,
                signatureData: signatureData || null,
                fieldType,
                textValue: textValue || null,
                fontFamily,
                fontSize,
                signatureType,
                positionX,
                positionY,
                width,
                height,
                pageNumber,
                ipAddress: clientIP,
                userAgent
            })
            .returning();

        // Log signature event for audit trail
        await db.insert(signatureEvents).values({
            id: createId(),
            documentId,
            eventType: fieldType === 'signature' ? 'signed' : 'field_added',
            eventData: {
                signatureId: newSignature.id,
                signerName,
                signerEmail,
                fieldType,
                signatureType,
                textValue: textValue || null,
                fontFamily,
                position: { x: positionX, y: positionY, width, height, page: pageNumber }
            },
            userEmail: signerEmail,
            ipAddress: clientIP
        });

        console.log('✅ Field created successfully:', {
            id: newSignature.id,
            documentId,
            fieldType,
            signerEmail,
            signatureType
        });

        return NextResponse.json({
            signature: newSignature,
            message: `${fieldType} field created successfully`
        });
    } catch (error) {
        console.error('Error creating signature field:', error);
        return NextResponse.json(
            { error: 'Failed to create signature field' },
            { status: 500 }
        );
    }
}

// DELETE /api/signatures - Delete a signature (for document owners)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const signatureId = searchParams.get('id');

        if (!signatureId) {
            return NextResponse.json(
                { error: 'Signature ID is required' },
                { status: 400 }
            );
        }

        // Get signature details before deletion for audit
        const [signatureToDelete] = await db
            .select()
            .from(signatures)
            .where(eq(signatures.id, signatureId));

        if (!signatureToDelete) {
            return NextResponse.json(
                { error: 'Signature not found' },
                { status: 404 }
            );
        }

        // Delete the signature
        await db
            .delete(signatures)
            .where(eq(signatures.id, signatureId));

        // Log deletion event
        const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';
        await db.insert(signatureEvents).values({
            id: createId(),
            documentId: signatureToDelete.documentId,
            eventType: 'deleted',
            eventData: {
                deletedSignatureId: signatureId,
                fieldType: signatureToDelete.fieldType,
                signerEmail: signatureToDelete.signerEmail,
                deletedAt: new Date().toISOString()
            },
            userEmail: 'system', // Could be improved with actual user
            ipAddress: clientIP
        });

        return NextResponse.json({
            message: 'Field deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting signature field:', error);
        return NextResponse.json(
            { error: 'Failed to delete signature field' },
            { status: 500 }
        );
    }
} 