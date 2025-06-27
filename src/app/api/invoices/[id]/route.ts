import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  try {
    // For now, we'll use the admin user as fallback
    // In a real app, you'd get this from the session/token
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@ekosolar.com' }
    });
    
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    
    return adminUser;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    throw error;
  }
}

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        customer: true
      }
    });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/invoices/[id] - Update invoice  
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const data = await request.json();
    
    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice with provided data
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        customerName: data.customerName || existingInvoice.customerName,
        amount: data.amount !== undefined ? data.amount : existingInvoice.amount,
        status: data.status || existingInvoice.status,
        description: data.description !== undefined ? data.description : existingInvoice.description,
        updatedAt: new Date()
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/invoices/[id] - Update invoice status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const { status } = await request.json();
    
    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update only the status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        status: status,
        updatedAt: new Date()
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    
    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 