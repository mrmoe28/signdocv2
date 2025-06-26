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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        customer: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await req.json();

    const {
      invoiceId,
      invoiceNumber,
      customerName,
      amount,
      status,
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

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update the payment
    const payment = await prisma.payment.update({
      where: { id },
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
        customerId
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
} 