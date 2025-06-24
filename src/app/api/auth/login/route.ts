import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, isValidEmail, generateToken, createSessionData } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    const loginIdentifier = username || email;

    // Validation
    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Find user by email or username (treating username as email for now since we store emails)
    let user;
    if (isValidEmail(loginIdentifier)) {
      // If it looks like an email, search by email
      user = await prisma.user.findUnique({
        where: { email: loginIdentifier.toLowerCase() }
      });
    } else {
      // If it doesn't look like an email, try to find by email anyway (username = email)
      user = await prisma.user.findUnique({
        where: { email: loginIdentifier.toLowerCase() }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Generate token and create session
    const token = generateToken(user.id);
    const sessionData = createSessionData(user);

    // Create response with secure cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: sessionData 
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 