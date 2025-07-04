import { stackServerApp } from '@/stack';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

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
        if (!stackServerApp) {
            console.error('Stack Auth not initialized');
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
        const existingUser = await prisma.user.findUnique({
            where: { email: stackUser.primaryEmail }
        });

        if (existingUser) {
            // Update existing user with any new information
            return await prisma.user.update({
                where: { email: stackUser.primaryEmail },
                data: {
                    name: stackUser.displayName || existingUser.name,
                    firstName: stackUser.primaryEmailAuth?.firstName || existingUser.firstName,
                    lastName: stackUser.primaryEmailAuth?.lastName || existingUser.lastName,
                    isVerified: stackUser.primaryEmailVerified || existingUser.isVerified,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new user in our database
            return await prisma.user.create({
                data: {
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
                }
            });
        }
    } catch (error) {
        console.error('Error syncing user with database:', error);
        throw error;
    }
}

// Get user from our database by email
export async function getUserFromDatabase(email: string) {
    try {
        return await prisma.user.findUnique({
            where: { email }
        });
    } catch (error) {
        console.error('Error getting user from database:', error);
        return null;
    }
}

// Get authenticated user for API routes
export async function getAuthenticatedUser() {
    try {
        const stackUser = await getCurrentUser();

        if (!stackUser) {
            return null;
        }

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
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        return null;
    }
}

// Cleanup function to disconnect Prisma
export async function disconnectPrisma() {
    await prisma.$disconnect();
}

// Get user by ID from our database
export async function getUserById(userId: string) {
    try {
        return await prisma.user.findUnique({
            where: { id: userId }
        });
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

// Update user profile in our database
export async function updateUserProfile(userId: string, data: UserProfileUpdate) {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Delete user from our database
export async function deleteUser(userId: string) {
    try {
        return await prisma.user.delete({
            where: { id: userId }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
} 