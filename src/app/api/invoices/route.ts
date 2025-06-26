import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper function to get authenticated user or default admin
async function getAuthenticatedUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  
  let userId = null;
  
  // Try to get user from token first
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      // Verify the user actually exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      if (user) {
        userId = user.id;
      }
    }
  }
  
  // If no valid token/user, use the default admin user
  if (!userId) {
    const defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@ekosolar.com' }
    });
    
    if (!defaultUser) {
      throw new Error('No default admin user found. Please set up the admin user first.');
    }
    
    userId = defaultUser.id;
  }
  
  return userId;
}

// GET /api/invoices - Get all invoices with filtering
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where = {
      userId: userId,
      ...(status && status !== 'All' && { status }),
      ...(search && {
        OR: [
          { invoiceId: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      invoices,
      total: invoices.length
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser(request);
    const data = await request.json();

    // Extract data from request
    const {
      customerId,
      customerName,
      invoiceNumber,
      description,
      total,
      status = 'Draft'
    } = data;

    // Validation
    if (!customerId && !customerName) {
      return NextResponse.json(
        { error: 'Customer ID or customer name is required' },
        { status: 400 }
      );
    }

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      );
    }

    // If customerId is provided, verify customer exists and belongs to user
    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: userId
        }
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Create new invoice
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceId: invoiceNumber,
        customerName: customer ? customer.name : customerName,
        amount: total || 0,
        description: description || '',
        status: status,
        userId: userId,
        customerId: customer ? customer.id : null
      },
      include: {
        customer: true,
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: newInvoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'An invoice with this number already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 