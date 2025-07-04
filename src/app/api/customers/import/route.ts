import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Stack Auth
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check file type
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large. Max 2MB allowed.' }, { status: 400 });
        }

        // Read and parse CSV content
        const csvContent = await file.text();
        const lines = csvContent.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file must have at least a header row and one data row' }, { status: 400 });
        }

        // Parse CSV headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Validate required headers
        const requiredHeaders = ['Name', 'Email'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json({
                error: `Missing required headers: ${missingHeaders.join(', ')}`
            }, { status: 400 });
        }

        // Parse data rows
        const records: Record<string, string>[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const record: Record<string, string> = {};

            headers.forEach((header, index) => {
                record[header] = values[index] || '';
            });

            // Validate required fields
            if (!record.Name || !record.Email) {
                errors.push(`Row ${i + 1}: Missing required fields (Name, Email)`);
                continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(record.Email)) {
                errors.push(`Row ${i + 1}: Invalid email format`);
                continue;
            }

            records.push(record);
        }

        if (records.length === 0) {
            return NextResponse.json({
                error: 'No valid records found in CSV file',
                details: errors
            }, { status: 400 });
        }

        // Check for duplicate emails in the database
        const existingEmails = await db
            .select({ email: customers.email })
            .from(customers)
            .where(eq(customers.userId, user.id));

        const existingEmailSet = new Set(existingEmails.map(c => c.email.toLowerCase()));

        // Process records and check for duplicates
        const newCustomers = [];
        const duplicates = [];

        for (const record of records) {
            const email = record.Email.toLowerCase();

            if (existingEmailSet.has(email)) {
                duplicates.push({
                    name: record.Name,
                    email: record.Email,
                    reason: 'Email already exists'
                });
                continue;
            }

            const newCustomer = {
                id: nanoid(),
                name: record.Name,
                email: record.Email,
                phone: record.Phone || null,
                company: record.Company || null,
                address: record.Address || null,
                contactPerson: record['Contact Person'] || null,
                customerType: record['Customer Type'] || 'residential',
                notifyByEmail: record['Notify By Email'] !== 'false',
                notifyBySmsText: record['Notify By SMS'] !== 'false',
                userId: user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            newCustomers.push(newCustomer);
            existingEmailSet.add(email); // Prevent duplicates within the same import
        }

        // Insert new customers in batches
        const batchSize = 100;
        let insertedCount = 0;
        const insertErrors = [];

        for (let i = 0; i < newCustomers.length; i += batchSize) {
            const batch = newCustomers.slice(i, i + batchSize);

            try {
                await db.insert(customers).values(batch);
                insertedCount += batch.length;
            } catch (error) {
                console.error('Error inserting batch:', error);
                insertErrors.push(`Failed to insert batch ${Math.floor(i / batchSize) + 1}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'CSV import completed',
            results: {
                total: records.length,
                inserted: insertedCount,
                duplicates: duplicates.length,
                errors: errors.length + insertErrors.length
            },
            details: {
                duplicates: duplicates.slice(0, 10), // Show first 10 duplicates
                errors: [...errors, ...insertErrors].slice(0, 10) // Show first 10 errors
            }
        });

    } catch (error) {
        console.error('Error importing customers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 