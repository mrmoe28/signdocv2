import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/drizzle-db';
import { documents } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: documentId } = await params;

        // Find the document first
        const [document] = await db
            .select()
            .from(documents)
            .where(eq(documents.id, documentId));

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Delete the physical file from uploads folder
        if (document.fileUrl) {
            const filePath = path.join(process.cwd(), 'public', document.fileUrl);
            if (existsSync(filePath)) {
                try {
                    await unlink(filePath);
                } catch (fileError) {
                    console.error('Error deleting file:', fileError);
                    // Continue with database deletion even if file deletion fails
                }
            }
        }

        // Delete the document record from database
        await db
            .delete(documents)
            .where(eq(documents.id, documentId));

        return NextResponse.json({
            message: 'Document deleted successfully',
            deletedId: documentId
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: documentId } = await params;

        const [document] = await db
            .select()
            .from(documents)
            .where(eq(documents.id, documentId));

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            document: {
                id: document.id,
                name: document.name,
                fileUrl: document.fileUrl,
                uploadedBy: document.uploadedBy,
                uploadedAt: new Date(document.uploadedAt).toLocaleString(),
                status: document.status,
                signers: [] // We'll add signer fetching later
            }
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
} 