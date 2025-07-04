import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { signatureFields, documents, signers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const body = await request.json();
    const { signatureData, position, signerEmail, signerName } = body;

    // First, check if document exists
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

    // Create or find signer
    let signer = await db
      .select()
      .from(signers)
      .where(eq(signers.documentId, documentId))
      .where(eq(signers.email, signerEmail || 'user@example.com'))
      .limit(1)
      .then(results => results[0]);

    if (!signer) {
      [signer] = await db
        .insert(signers)
        .values({
          documentId,
          name: signerName || 'Test User',
          email: signerEmail || 'user@example.com',
          order: 1,
          status: 'pending'
        })
        .returning();
    }

    // Create signature field
    const [signatureField] = await db
      .insert(signatureFields)
      .values({
        documentId,
        signerId: signer.id,
        page: position.page,
        x: position.x,
        y: position.y,
        width: 200, // Default signature width
        height: 80, // Default signature height
        type: 'signature',
        value: signatureData,
        required: true
      })
      .returning();

    // Update signer status
    await db
      .update(signers)
      .set({
        status: 'signed',
        signedAt: new Date(),
        signatureData
      })
      .where(eq(signers.id, signer.id));

    // Check if all signers have signed
    const allSigners = await db
      .select()
      .from(signers)
      .where(eq(signers.documentId, documentId));

    const allSigned = allSigners.every(s => s.status === 'signed');

    if (allSigned) {
      // Update document status
      await db
        .update(documents)
        .set({
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(documents.id, documentId));
    }

    return NextResponse.json({
      message: 'Signature placed successfully',
      signatureField,
      documentCompleted: allSigned
    });
  } catch (error) {
    console.error('Error placing signature:', error);
    return NextResponse.json(
      { error: 'Failed to place signature' },
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

    // Get all signatures for this document
    const signatures = await db
      .select({
        id: signatureFields.id,
        page: signatureFields.page,
        x: signatureFields.x,
        y: signatureFields.y,
        width: signatureFields.width,
        height: signatureFields.height,
        value: signatureFields.value,
        signerName: signers.name,
        signerEmail: signers.email,
        signedAt: signers.signedAt
      })
      .from(signatureFields)
      .innerJoin(signers, eq(signatureFields.signerId, signers.id))
      .where(eq(signatureFields.documentId, documentId));

    return NextResponse.json({
      signatures
    });
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}
