import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

import { db } from '../src/lib/drizzle-db';
import { users } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function ensureTempUser() {
    try {
        // First, try to find existing temp user
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, 'temp-user-123'))
            .limit(1);

        if (existingUser.length > 0) {
            console.log('✅ Temp user already exists');
            return existingUser[0];
        }

        // Try to find admin user
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.email, 'admin@ekosolar.com'))
            .limit(1);

        if (existingAdmin.length > 0) {
            console.log('✅ Admin user found, using as fallback');
            return existingAdmin[0];
        }

        // Create temp user with specific ID for backwards compatibility
        const newUser = await db
            .insert(users)
            .values({
                id: 'temp-user-123', // Use specific ID for temp user
                email: 'temp@localhost.dev',
                name: 'Temporary User',
                firstName: 'Temp',
                lastName: 'User',
                company: 'Dev Environment',
                phone: '(555) 000-0000',
                address: '123 Dev Street',
                city: 'Development',
                state: 'CA',
                zipCode: '00000',
            })
            .returning();

        console.log('✅ Temporary user created successfully:', newUser[0]);
        return newUser[0];
    } catch (error) {
        console.error('❌ Error ensuring temp user:', error);

        // If there's a unique constraint error, try to find any existing user
        try {
            const anyUser = await db
                .select()
                .from(users)
                .limit(1);

            if (anyUser.length > 0) {
                console.log('✅ Found existing user, will use as fallback');
                return anyUser[0];
            }
        } catch (findError) {
            console.error('❌ Error finding existing users:', findError);
        }

        throw error;
    }
}

if (require.main === module) {
    ensureTempUser()
        .then(() => {
            console.log('✅ User setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ User setup failed:', error);
            process.exit(1);
        });
}

export { ensureTempUser }; 