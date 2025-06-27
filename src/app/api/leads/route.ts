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

// GET /api/leads - Get all leads
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    const leads = await prisma.lead.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdDate: 'desc'
      }
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: body.email.toLowerCase(),
        userId: user.id
      }
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        location: body.location?.trim() || null,
        source: body.source || 'Website',
        status: body.status || 'New',
        score: body.score || 0,
        estimatedValue: body.estimatedValue || 0,
        probability: body.probability || 0,
        assignedTo: body.assignedTo?.trim() || user.name,
        createdDate: new Date().toISOString(),
        lastContact: body.lastContact || null,
        nextFollowUp: body.nextFollowUp || null,
        notes: body.notes?.trim() || null,
        tags: body.tags || [],
        interests: body.interests || [],
        priority: body.priority || 'Medium',
        userId: user.id
      }
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 