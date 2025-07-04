import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

import { db } from '../src/lib/drizzle-db';
import { users } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function createDefaultUser() {
  try {
    // Check if admin user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@ekosolar.com'))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin user
    const newUser = await db
      .insert(users)
      .values({
        email: 'admin@ekosolar.com',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        company: 'EkoSolar',
        phone: '(555) 123-4567',
        address: '123 Solar Street',
        city: 'Sunnyville',
        state: 'CA',
        zipCode: '90210',
      })
      .returning();

    console.log('✅ Default admin user created:', newUser[0]);
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  }
}

createDefaultUser().then(() => {
  console.log('✅ User creation script completed');
  process.exit(0);
});
