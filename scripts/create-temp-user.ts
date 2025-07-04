import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

import { db } from '../src/lib/drizzle-db';
import { users } from '../src/lib/schema';
import { hashPassword } from '../src/lib/auth';

async function createTempUser() {
  try {
    const hashedPassword = await hashPassword('temp123');
    
    const [tempUser] = await db
      .insert(users)
      .values({
        id: 'temp-user-123',
        email: 'temp@example.com',
        password: hashedPassword,
        name: 'Temporary User',
        role: 'user',
        isVerified: true
      })
      .returning();
    
    console.log('Temporary user created:', tempUser);
  } catch (error) {
    console.error('Error creating temp user:', error);
  } finally {
    process.exit();
  }
}

createTempUser();
