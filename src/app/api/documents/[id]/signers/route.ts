import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { signers, documents } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const body = await request.json();
    const { signers: signersList } = body;

    // Verify document exists
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

    // Create signers
    const createdSigners = [];
    for (let i = 0; i < signersList.length; i++) {
      const signer = signersList[i];
      const emailToken = randomBytes(32).toString('hex');

      const [newSigner] = await db
        .insert(signers)
        .values({
          documentId,
          name: signer.name,
          email: signer.email,
          order: i + 1,
          status: 'pending',
          emailToken,
          tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
        .returning();

      createdSigners.push(newSigner);
    }

    // Update document status to pending if it was draft
    if (document.status === 'draft') {
      await db
        .update(documents)
        .set({ status: 'pending' })
        .where(eq(documents.id, documentId));
    }

    // TODO: Send emails to signers
    // For now, just log the signing links
    createdSigners.forEach(signer => {
      console.log(`Signing link for ${signer.name}: ${process.env.NEXT_PUBLIC_BASE_URL}/sign/${signer.emailToken}`);
    });

    return NextResponse.json({
      message: 'Signers added successfully',
      signers: createdSigners,
      signingLinks: createdSigners.map(s => ({
        name: s.name,
        email: s.email,
        link: `${process.env.NEXT_PUBLIC_BASE_URL}/sign/${s.emailToken}`
      }))
    });
  } catch (error) {
    console.error('Error adding signers:', error);
    return NextResponse.json(
      { error: 'Failed to add signers' },
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

    // Get all signers for this document
    const signersList = await db
      .select()
      .from(signers)
      .where(eq(signers.documentId, documentId))
      .orderBy(signers.order);

    return NextResponse.json({
      signers: signersList
    });
  } catch (error) {
    console.error('Error fetching signers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signers' },
      { status: 500 }
    );
  }
}
