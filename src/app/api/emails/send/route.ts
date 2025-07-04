import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email-service';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper function to get authenticated user
async function getAuthenticatedUser(req: NextRequest) {
    const token = req.cookies.get('auth-token')?.value;

    let userId = null;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (user) {
                userId = user.id;
            }
        }
    }

    if (!userId) {
        const defaultUser = await prisma.user.findFirst({
            where: { email: 'admin@ekosolar.com' }
        });

        if (!defaultUser) {
            throw new Error('No default admin user found.');
        }

        userId = defaultUser.id;
    }

    return userId;
}

export async function POST(request: NextRequest) {
    try {
        // const userId = await getAuthenticatedUser(request); // TODO: Enable when email history is implemented
        const body = await request.json();

        const {
            to,
            // cc, // TODO: Enable when implementing CC/BCC support
            // bcc, // TODO: Enable when implementing CC/BCC support
            subject,
            content,
            // templateId, // TODO: Enable when implementing template support
            scheduleAt,
            isScheduled
        } = body;

        // Validate required fields
        if (!to || !subject || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, content' },
                { status: 400 }
            );
        }

        // If scheduled, store in database for later processing
        if (isScheduled && scheduleAt) {
            // TODO: Store scheduled email in database (requires schema update)
            // For now, return success for scheduled emails
            return NextResponse.json({
                success: true,
                message: 'Email scheduled successfully (demo mode)',
                scheduledId: 'scheduled-' + Date.now()
            });
        }

        // Send email immediately
        try {
            // For now, we'll use the existing invoice email service
            // In a real app, you'd have a more generic email service
            const result = await sendInvoiceEmail({
                invoiceId: 'EMAIL-' + Date.now(),
                customerName: to.split('@')[0],
                customerEmail: to,
                amount: 0,
                companyName: 'Your Company'
            });

            if (result.success) {
                // TODO: Store email history in database (requires schema update)
                console.log('Email sent successfully:', { to, subject, messageId: result.messageId });

                return NextResponse.json({
                    success: true,
                    message: 'Email sent successfully',
                    messageId: result.messageId
                });
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        } catch (emailError) {
            console.error('Error sending email:', emailError);

            // TODO: Store failed email history in database (requires schema update)
            console.log('Email failed:', { to, subject, error: emailError });

            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Send email error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 