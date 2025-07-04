import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // Join the path segments
        const filePath = params.path.join('/');

        // Security check: ensure the file path doesn't contain directory traversal
        if (filePath.includes('..') || filePath.includes('\\')) {
            return new NextResponse('Invalid file path', { status: 400 });
        }

        // Construct the full file path
        const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);

        // Check if file exists
        if (!existsSync(fullPath)) {
            console.log('File not found:', fullPath);
            return new NextResponse('File not found', { status: 404 });
        }

        console.log('Serving file:', fullPath);

        // Read the file
        const fileBuffer = await readFile(fullPath);

        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
        }

        // Create response with proper headers
        const response = new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                // Remove X-Frame-Options to allow PDF embedding
                'X-Frame-Options': 'SAMEORIGIN',
            },
        });

        return response;
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
} 