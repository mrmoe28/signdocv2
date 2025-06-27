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

// GET /api/appointments - Get all appointments
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    // Get appointments for the authenticated user
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const {
      title,
      customer,
      customerEmail,
      type,
      date,
      time,
      duration,
      location,
      priority,
      notes,
      estimatedValue,
      photoUrl
    } = await req.json();

    // Validation
    if (!title || !customer || !date || !time) {
      return NextResponse.json({ 
        error: 'Title, customer, date, and time are required' 
      }, { status: 400 });
    }

    // Parse and validate date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format' 
      }, { status: 400 });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        title,
        customer,
        customerEmail: customerEmail || null,
        type: type || 'Installation',
        date: appointmentDate,
        time,
        duration: duration || null,
        location: location || null,
        priority: priority || 'Medium',
        notes: notes || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        photoUrl: photoUrl || null,
        userId: user.id
      }
    });

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
  } finally {
    await prisma.$disconnect();
  }
} 