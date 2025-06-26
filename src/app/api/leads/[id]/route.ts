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

// GET /api/leads/[id] - Get a specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    const lead = await prisma.lead.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const leadWithParsedFields = {
      ...lead,
      tags: JSON.parse(lead.tags || '[]'),
      interests: JSON.parse(lead.interests || '[]')
    };

    return NextResponse.json(leadWithParsedFields);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    const body = await request.json();

    // Check if lead exists and belongs to user
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

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

    // Check if another lead with this email already exists (excluding current lead)
    const duplicateLead = await prisma.lead.findFirst({
      where: {
        email: body.email.toLowerCase(),
        userId: user.id,
        NOT: {
          id: id
        }
      }
    });

    if (duplicateLead) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        location: body.location?.trim() || null,
        source: body.source || existingLead.source,
        status: body.status || existingLead.status,
        score: body.score !== undefined ? body.score : existingLead.score,
        estimatedValue: body.estimatedValue !== undefined ? body.estimatedValue : existingLead.estimatedValue,
        probability: body.probability !== undefined ? body.probability : existingLead.probability,
        assignedTo: body.assignedTo?.trim() || existingLead.assignedTo,
        lastContact: body.lastContact || existingLead.lastContact,
        nextFollowUp: body.nextFollowUp || existingLead.nextFollowUp,
        notes: body.notes?.trim() || existingLead.notes,
        tags: JSON.stringify(body.tags || []),
        interests: JSON.stringify(body.interests || []),
        priority: body.priority || existingLead.priority,
        updatedAt: new Date()
      }
    });

    // Parse JSON fields for response
    const leadWithParsedFields = {
      ...updatedLead,
      tags: JSON.parse(updatedLead.tags || '[]'),
      interests: JSON.parse(updatedLead.interests || '[]')
    };

    return NextResponse.json(leadWithParsedFields);
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    // Check if lead exists and belongs to user
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    await prisma.lead.delete({
      where: { id: id }
    });

    return NextResponse.json(
      { message: 'Lead deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 