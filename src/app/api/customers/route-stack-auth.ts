import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedBusinessUser } from '@/lib/stack-auth-helpers';

const prisma = new PrismaClient();

// GET /api/customers - Get all customers (Stack Auth version)
export async function GET(req: NextRequest) {
    try {
        // Get the authenticated user through Stack Auth
        const user = await getAuthenticatedBusinessUser();

        if (!user) {
            return NextResponse.json({
                error: 'Authentication required. Please sign in.'
            }, { status: 401 });
        }

        console.log('🔍 Fetching customers for user:', user.email);

        // Get customers for the authenticated user
        const customers = await prisma.customer.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json({ customers });

    } catch (error) {
        console.error('Get customers error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to fetch customers'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// POST /api/customers - Create a new customer (Stack Auth version)
export async function POST(req: NextRequest) {
    try {
        // Get the authenticated user through Stack Auth
        const user = await getAuthenticatedBusinessUser();

        if (!user) {
            return NextResponse.json({
                error: 'Authentication required. Please sign in.'
            }, { status: 401 });
        }

        const requestBody = await req.json();
        console.log('📋 Customer creation request for user:', user.email, requestBody);

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
        } = requestBody;

        // Validation
        if (!name || !email) {
            console.log('❌ Validation failed: Missing name or email');
            return NextResponse.json({
                error: 'Name and email are required'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Validation failed: Invalid email format');
            return NextResponse.json({
                error: 'Please provide a valid email address'
            }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔍 Checking for existing customer with email:', normalizedEmail);

        // Check if customer with this email already exists for this user
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                email: normalizedEmail,
                userId: user.id // Use Stack Auth user ID
            }
        });

        if (existingCustomer) {
            console.log('❌ Customer already exists:', existingCustomer.id, existingCustomer.name);
            return NextResponse.json({
                error: `A customer with email "${normalizedEmail}" already exists: ${existingCustomer.name}`,
                existingCustomer: {
                    id: existingCustomer.id,
                    name: existingCustomer.name,
                    email: existingCustomer.email
                }
            }, { status: 409 });
        }

        // Prepare customer data with proper defaults
        const customerData = {
            name: name.trim(),
            email: normalizedEmail,
            phone: phone ? phone.trim() : null,
            company: company ? company.trim() : null,
            address: address ? address.trim() : null,
            contactPerson: contactPerson ? contactPerson.trim() : null,
            customerType: customerType || 'residential',
            notifyByEmail: notifyByEmail !== false, // default to true
            notifyBySmsText: notifyBySmsText !== false, // default to true
            userId: user.id // Use Stack Auth user ID
        };

        console.log('💾 Creating customer with data:', customerData);

        // Create the customer
        const customer = await prisma.customer.create({
            data: customerData
        });

        console.log('✅ Customer created successfully:', customer.id, customer.name);

        return NextResponse.json({
            success: true,
            message: 'Customer created successfully',
            customer
        });

    } catch (error) {
        console.error('❌ Create customer error:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('foreign key constraint')) {
                return NextResponse.json({
                    error: 'Database error: User authentication failed. Please try again.'
                }, { status: 500 });
            }
            if (error.message.includes('Unique constraint')) {
                return NextResponse.json({
                    error: 'A customer with this email already exists.'
                }, { status: 409 });
            }
        }

        return NextResponse.json({
            error: 'Failed to create customer. Please try again.'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
} 