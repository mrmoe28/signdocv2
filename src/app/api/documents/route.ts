import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/drizzle-db';
import { documents, users } from '@/lib/schema';
import { desc } from 'drizzle-orm';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');

export async function GET() {
  try {
    // Fetch all documents for now (until auth is implemented)
    const documentsList = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));

    // Transform the data for the frontend
    const transformedDocuments = documentsList.map((doc) => ({
      id: doc.id,
      name: doc.name,
      fileUrl: doc.fileUrl,
      uploadedBy: doc.uploadedBy,
      uploadedAt: new Date(doc.uploadedAt).toLocaleString(),
      status: doc.status,
      signers: [] // We'll add signer fetching later
    }));

    return NextResponse.json({
      documents: transformedDocuments,
      total: transformedDocuments.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get any existing user from database as fallback
    const existingUsers = await db.select().from(users).limit(1);
    let userId = 'le7jdnmtpj8p5xbxpsnbfn2m'; // Known user ID from logs

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('Using existing user:', userId);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save (optimized)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file asynchronously for better performance
    await writeFile(filepath, buffer);

    // Create document record in database
    const [newDocument] = await db
      .insert(documents)
      .values({
        name: file.name,
        fileUrl: `/uploads/${filename}`,
        uploadedBy: userId,
        status: 'draft',
        metadata: {
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        }
      })
      .returning();

    console.log('✅ Document uploaded successfully:', {
      id: newDocument.id,
      name: newDocument.name,
      fileUrl: newDocument.fileUrl,
      size: file.size
    });

    return NextResponse.json({
      document: {
        id: newDocument.id,
        name: newDocument.name,
        fileUrl: newDocument.fileUrl,
        uploadedBy: newDocument.uploadedBy,
        uploadedAt: new Date(newDocument.uploadedAt).toLocaleString(),
        status: newDocument.status,
        signers: []
      },
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
