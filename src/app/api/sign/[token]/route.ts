import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle-db';
import { signers, documents, signatureFields } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find signer by token
    const [signer] = await db
      .select()
      .from(signers)
      .where(eq(signers.emailToken, token))
      .limit(1);

    if (!signer) {
      return NextResponse.json(
        { error: 'Invalid signing token' },
        { status: 404 }
      );
    }

    // TODO: Check if token is expired (add tokenExpiry to schema if needed)
    // if (signer.tokenExpiry && new Date() > signer.tokenExpiry) {
    //   return NextResponse.json(
    //     { error: 'Signing link has expired' },
    //     { status: 400 }
    //   );
    // }

    // Get document details
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, signer.documentId))
      .limit(1);

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
        fileUrl: document.fileUrl
      },
      signer: {
        id: signer.id,
        name: signer.name,
        email: signer.email,
        status: signer.status
      }
    });
  } catch (error) {
    console.error('Error fetching signing session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signing session' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { signatureData, position, action = 'save_and_send' } = body;

    // Find signer by token
    const [signer] = await db
      .select()
      .from(signers)
      .where(eq(signers.emailToken, token))
      .limit(1);

    if (!signer) {
      return NextResponse.json(
        { error: 'Invalid signing token' },
        { status: 404 }
      );
    }

    // Check if already signed (unless it's a draft action)
    if (signer.status === 'signed' && action !== 'draft') {
      return NextResponse.json(
        { error: 'Document already signed' },
        { status: 400 }
      );
    }

    // TODO: Check if token is expired (add tokenExpiry to schema if needed)
    // if (signer.tokenExpiry && new Date() > signer.tokenExpiry) {
    //   return NextResponse.json(
    //     { error: 'Signing link has expired' },
    //     { status: 400 }
    //   );
    // }

    // Create or update signature field
    const [signatureField] = await db
      .insert(signatureFields)
      .values({
        documentId: signer.documentId,
        signerId: signer.id,
        page: position.page,
        x: position.x,
        y: position.y,
        width: 200,
        height: 80,
        fieldType: 'signature',
        value: signatureData,
        required: 'true'
      })
      .returning();

    console.log('✅ Field created successfully:', {
      id: signatureField.id,
      documentId: signatureField.documentId,
      fieldType: signatureField.fieldType,
      signerEmail: signer.email,
      signatureType: 'drawn'
    });

    // Handle different actions
    let signerStatus = signer.status;
    let shouldNotifyNext = false;
    let documentCompleted = false;

    switch (action) {
      case 'save_and_send':
        signerStatus = 'signed';
        shouldNotifyNext = true;
        break;

      case 'save':
        signerStatus = 'signed';
        shouldNotifyNext = false;
        break;

      case 'draft':
        signerStatus = 'draft';
        shouldNotifyNext = false;
        break;

      default:
        signerStatus = 'signed';
        shouldNotifyNext = true;
    }

    // Update signer status
    await db
      .update(signers)
      .set({
        status: signerStatus,
        signedAt: signerStatus === 'signed' ? new Date() : null
      })
      .where(eq(signers.id, signer.id));

    // Check if all signers have signed (only for completed signatures)
    if (signerStatus === 'signed') {
      const allSigners = await db
        .select()
        .from(signers)
        .where(eq(signers.documentId, signer.documentId));

      const allSigned = allSigners.every(s => s.status === 'signed');
      documentCompleted = allSigned;

      if (allSigned) {
        // Update document status
        await db
          .update(documents)
          .set({
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(documents.id, signer.documentId));
      }
    }

    // TODO: Implement notification logic here
    if (shouldNotifyNext && !documentCompleted) {
      // Find next signer to notify
      const nextSigner = await db
        .select()
        .from(signers)
        .where(and(
          eq(signers.documentId, signer.documentId),
          eq(signers.status, 'pending')
        ))
        .limit(1);

      if (nextSigner.length > 0) {
        console.log('📧 Would notify next signer:', nextSigner[0].email);
        // TODO: Send email notification to next signer
      }
    }

    return NextResponse.json({
      message: getSuccessMessage(action, documentCompleted),
      documentCompleted,
      action,
      signerStatus
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Failed to sign document' },
      { status: 500 }
    );
  }
}

function getSuccessMessage(action: string, documentCompleted: boolean): string {
  if (documentCompleted) {
    return 'Document completed! All signers have signed.';
  }

  switch (action) {
    case 'save_and_send':
      return 'Document signed and sent to the next signer';
    case 'save':
      return 'Document signed successfully';
    case 'draft':
      return 'Draft saved successfully';
    default:
      return 'Document signed successfully';
  }
}
