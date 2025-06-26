import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// DELETE /api/appointments/[id] - Delete an appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointmentId = params.id;

    // Check if appointment exists and belongs to the user
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: userId
      }
    });

    if (!existingAppointment) {
      return NextResponse.json({ 
        error: 'Appointment not found or you do not have permission to delete it' 
      }, { status: 404 });
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: {
        id: appointmentId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete appointment. Please try again.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/appointments/[id] - Update an appointment
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointmentId = params.id;

    // Check if appointment exists and belongs to the user
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: userId
      }
    });

    if (!existingAppointment) {
      return NextResponse.json({ 
        error: 'Appointment not found or you do not have permission to update it' 
      }, { status: 404 });
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
      status,
      priority,
      notes,
      estimatedValue,
      photoUrl
    } = await req.json();

    // Parse date if provided
    let appointmentDate;
    if (date) {
      appointmentDate = new Date(date);
      if (isNaN(appointmentDate.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid date format' 
        }, { status: 400 });
      }
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        ...(title && { title }),
        ...(customer && { customer }),
        ...(customerEmail !== undefined && { customerEmail }),
        ...(type && { type }),
        ...(appointmentDate && { date: appointmentDate }),
        ...(time && { time }),
        ...(duration !== undefined && { duration }),
        ...(location !== undefined && { location }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(notes !== undefined && { notes }),
        ...(estimatedValue !== undefined && { estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null }),
        ...(photoUrl !== undefined && { photoUrl })
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      appointment: updatedAppointment 
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ 
      error: 'Failed to update appointment. Please try again.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 