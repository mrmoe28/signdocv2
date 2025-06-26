import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/appointments - Get all appointments
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

    // Get appointments for the authenticated user
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: userId
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
        userId: userId
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