import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { leads } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq, desc } from 'drizzle-orm';

// GET /api/leads - Get all leads
export async function GET() {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadsList = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, user.id))
      .orderBy(desc(leads.createdAt));

    return NextResponse.json({ leads: leadsList });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, body.email.toLowerCase()))
      .limit(1);

    if (existingLead.length > 0) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create new lead
    const newLead = {
      id: nanoid(),
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      source: body.source || null,
      status: body.status || 'new',
      notes: body.notes?.trim() || null,
      userId: user.id,
      customerId: body.customerId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [lead] = await db
      .insert(leads)
      .values(newLead)
      .returning();

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
} 