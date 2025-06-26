import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/customers - Get all customers
export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookies
    const token = req.cookies.get('auth-token')?.value;
    
    let userId;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // If no valid token, use the default admin user
    if (!userId) {
      const defaultUser = await prisma.user.findFirst({
        where: { email: 'admin@ekosolar.com' }
      });
      
      if (!defaultUser) {
        return NextResponse.json({ error: 'No user found' }, { status: 401 });
      }
      
      userId = defaultUser.id;
    }

    // Get customers for the authenticated user
    const customers = await prisma.customer.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ customers });

  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/customers - Create a new customer
export async function POST(req: NextRequest) {
  try {
    // Get auth token from cookies
    const token = req.cookies.get('auth-token')?.value;
    
    let userId;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // If no valid token, use the default admin user
    if (!userId) {
      const defaultUser = await prisma.user.findFirst({
        where: { email: 'admin@ekosolar.com' }
      });
      
      if (!defaultUser) {
        return NextResponse.json({ error: 'No user found' }, { status: 401 });
      }
      
      userId = defaultUser.id;
    }

    const {
      name,
      email,
      phone,
      company,
      address,
      contactPerson,
      customerType,
      notifyByEmail,
      notifyBySmsText
    } = await req.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if customer with this email already exists for this user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: email.toLowerCase(),
        userId: userId
      }
    });

    if (existingCustomer) {
      return NextResponse.json({ 
        error: 'A customer with this email already exists' 
      }, { status: 409 });
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        company: company || null,
        address: address || null,
        contactPerson: contactPerson || null,
        customerType: customerType || 'residential',
        notifyByEmail: notifyByEmail !== false, // default to true
        notifyBySmsText: notifyBySmsText !== false, // default to true
        userId: userId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Customer created successfully',
      customer 
    });

  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({ 
      error: 'Failed to create customer. Please try again.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 