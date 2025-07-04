import { stackServerApp, isStackAuthAvailable } from '@/stack';
import { db } from './drizzle-db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types for Stack Auth user
interface StackAuthUser {
    id: string;
    primaryEmail: string;
    displayName?: string;
    primaryEmailVerified?: boolean;
    primaryEmailAuth?: {
        firstName?: string;
        lastName?: string;
    };
}

interface UserProfileUpdate {
    name?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

// Get the current user from Stack Auth
export async function getCurrentUser() {
    try {
        if (!isStackAuthAvailable() || !stackServerApp) {
            console.warn('Stack Auth not available, using fallback');
            return null;
        }

        const user = await stackServerApp.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Create or update user in our database based on Stack Auth user
export async function syncUserWithDatabase(stackUser: StackAuthUser) {
    try {
        // Check if user already exists in our database
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, stackUser.primaryEmail))
            .limit(1);

        if (existingUser.length > 0) {
            // Update existing user with any new information
            const [updated] = await db
                .update(users)
                .set({
                    name: stackUser.displayName || existingUser[0].name,
                    firstName: stackUser.primaryEmailAuth?.firstName || existingUser[0].firstName,
                    lastName: stackUser.primaryEmailAuth?.lastName || existingUser[0].lastName,
                    isVerified: stackUser.primaryEmailVerified || existingUser[0].isVerified,
                    updatedAt: new Date()
                })
                .where(eq(users.id, existingUser[0].id))
                .returning();

            return updated;
        } else {
            // Create new user in our database
            const [newUser] = await db
                .insert(users)
                .values({
                    id: nanoid(), // Generate unique ID
                    email: stackUser.primaryEmail,
                    password: '', // Stack Auth handles password, we just store empty string
                    name: stackUser.displayName || stackUser.primaryEmail.split('@')[0],
                    firstName: stackUser.primaryEmailAuth?.firstName || '',
                    lastName: stackUser.primaryEmailAuth?.lastName || '',
                    isVerified: stackUser.primaryEmailVerified || false,
                    role: 'user', // Default role
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            return newUser;
        }
    } catch (error) {
        console.error('Error syncing user with database:', error);
        throw error;
    }
}

// Get user from our database by email
export async function getUserFromDatabase(email: string) {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error('Error getting user from database:', error);
        return null;
    }
}

// Get or create admin user for fallback scenarios
export async function getOrCreateAdminUser() {
    try {
        // First, try to find existing temp user for backwards compatibility
        const tempUser = await db
            .select()
            .from(users)
            .where(eq(users.id, 'temp-user-123'))
            .limit(1);

        if (tempUser.length > 0) {
            return tempUser[0];
        }

        // Try to find existing admin user
        const adminUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, 'admin@ekosolar.com'))
            .limit(1);

        if (adminUsers.length > 0) {
            return adminUsers[0];
        }

        // Try to find any existing user
        const anyUser = await db
            .select()
            .from(users)
            .limit(1);

        if (anyUser.length > 0) {
            return anyUser[0];
        }

        // Create temp user with specific ID for backwards compatibility
        const [newUser] = await db
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
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        console.log('Created fallback temp user');
        return newUser;
    } catch (error) {
        console.error('Error getting or creating admin user:', error);
        throw error;
    }
}

// Get authenticated user for API routes
export async function getAuthenticatedUser() {
    try {
        // Try Stack Auth first
        if (isStackAuthAvailable()) {
            const stackUser = await getCurrentUser();

            if (stackUser) {
                // Sync Stack Auth user with our database
                const dbUser = await syncUserWithDatabase(stackUser as StackAuthUser);

                return {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    role: dbUser.role,
                    isVerified: dbUser.isVerified,
                    stackUser: stackUser
                };
            }
        }

        // Fallback to admin user
        const adminUser = await getOrCreateAdminUser();

        return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            isVerified: adminUser.isVerified,
            stackUser: null
        };
    } catch (error) {
        console.error('Error getting authenticated user:', error);

        // Last resort: create a temporary admin user
        try {
            const adminUser = await getOrCreateAdminUser();
            return {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
                isVerified: adminUser.isVerified,
                stackUser: null
            };
        } catch (finalError) {
            console.error('Final fallback failed:', finalError);
            throw new Error('Authentication system unavailable');
        }
    }
}

// Get user by ID from our database
export async function getUserById(userId: string) {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

// Update user profile in our database
export async function updateUserProfile(userId: string, data: UserProfileUpdate) {
    try {
        const [updated] = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        return updated;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Delete user from our database
export async function deleteUser(userId: string) {
    try {
        const [deleted] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();

        return deleted;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
} 