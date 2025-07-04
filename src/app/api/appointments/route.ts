import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { appointments } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq, asc } from 'drizzle-orm';

// GET /api/appointments - Get all appointments
export async function GET() {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get appointments for the authenticated user
    const appointmentsList = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, user.id))
      .orderBy(asc(appointments.startTime));

    return NextResponse.json({ appointments: appointmentsList });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      status = 'scheduled',
      customerId
    } = await req.json();

    // Validation
    if (!title || !startTime || !endTime) {
      return NextResponse.json({
        error: 'Title, start time, and end time are required'
      }, { status: 400 });
    }

    // Parse and validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format'
      }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({
        error: 'End time must be after start time'
      }, { status: 400 });
    }

    // Create the appointment
    const newAppointment = {
      id: nanoid(),
      title,
      description: description || null,
      startTime: start,
      endTime: end,
      location: location || null,
      status,
      userId: user.id,
      customerId: customerId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [appointment] = await db
      .insert(appointments)
      .values(newAppointment)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({
      error: 'Failed to create appointment. Please try again.'
    }, { status: 500 });
  }
} 