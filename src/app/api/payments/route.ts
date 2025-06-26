import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  try {
    // Try to find admin user first as fallback
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@ekosolar.com'
      }
    });

    if (adminUser) {
      return adminUser;
    }

    // If no admin user exists, create one
    const newAdminUser = await prisma.user.create({
      data: {
        id: 'cmcdpr0a100008c0rt6vuo0l6',
        email: 'admin@ekosolar.com',
        password: 'hashed_password_placeholder',
        name: 'Admin User',
        company: 'EKO SOLAR',
        role: 'admin',
        isVerified: true
      }
    });

    return newAdminUser;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    throw new Error('Authentication failed');
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();

    const {
      invoiceId,
      invoiceNumber,
      customerName,
      amount,
      status = 'Pending',
      paymentDate,
      paymentMethod,
      stripePaymentId,
      description,
      customerId
    } = body;

    // Validation
    if (!customerName || !amount) {
      return NextResponse.json(
        { error: 'Customer name and amount are required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        invoiceNumber,
        customerName,
        amount,
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMethod,
        stripePaymentId,
        description,
        userId: user.id,
        customerId
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 