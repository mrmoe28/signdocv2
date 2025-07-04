// Temporary Prisma compatibility layer for Drizzle
// This file provides a Prisma-like interface using Drizzle under the hood

import { db, sql } from './drizzle-db';
import { users, customers, invoices, appointments, payments, leads } from './schema';
import { eq } from 'drizzle-orm';

// Mock Prisma client that uses Drizzle
export const prisma = {
  user: {
    findFirst: async ({ where }: any) => {
      if (where?.email) {
        const result = await db.select().from(users).where(eq(users.email, where.email)).limit(1);
        return result[0] || null;
      }
      if (where?.id) {
        const result = await db.select().from(users).where(eq(users.id, where.id)).limit(1);
        return result[0] || null;
      }
      const result = await db.select().from(users).limit(1);
      return result[0] || null;
    },
    findMany: async () => {
      return db.select().from(users);
    },
    create: async ({ data }: any) => {
      const result = await db.insert(users).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(users).set(data).where(eq(users.id, where.id)).returning();
      return result[0];
    },
  },
  customer: {
    findMany: async ({ where }: any = {}) => {
      if (where?.userId) {
        return db.select().from(customers).where(eq(customers.userId, where.userId));
      }
      return db.select().from(customers);
    },
    create: async ({ data }: any) => {
      const result = await db.insert(customers).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(customers).set(data).where(eq(customers.id, where.id)).returning();
      return result[0];
    },
    delete: async ({ where }: any) => {
      await db.delete(customers).where(eq(customers.id, where.id));
    },
  },
  invoice: {
    findMany: async ({ where }: any = {}) => {
      if (where?.userId) {
        return db.select().from(invoices).where(eq(invoices.userId, where.userId));
      }
      return db.select().from(invoices);
    },
    findUnique: async ({ where }: any) => {
      const result = await db.select().from(invoices).where(eq(invoices.id, where.id)).limit(1);
      return result[0] || null;
    },
    create: async ({ data }: any) => {
      const result = await db.insert(invoices).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(invoices).set(data).where(eq(invoices.id, where.id)).returning();
      return result[0];
    },
    delete: async ({ where }: any) => {
      await db.delete(invoices).where(eq(invoices.id, where.id));
    },
  },
  appointment: {
    findMany: async ({ where }: any = {}) => {
      if (where?.userId) {
        return db.select().from(appointments).where(eq(appointments.userId, where.userId));
      }
      return db.select().from(appointments);
    },
    findUnique: async ({ where }: any) => {
      const result = await db.select().from(appointments).where(eq(appointments.id, where.id)).limit(1);
      return result[0] || null;
    },
    create: async ({ data }: any) => {
      const result = await db.insert(appointments).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(appointments).set(data).where(eq(appointments.id, where.id)).returning();
      return result[0];
    },
    delete: async ({ where }: any) => {
      await db.delete(appointments).where(eq(appointments.id, where.id));
    },
  },
  payment: {
    findMany: async ({ where }: any = {}) => {
      if (where?.userId) {
        return db.select().from(payments).where(eq(payments.userId, where.userId));
      }
      return db.select().from(payments);
    },
    findUnique: async ({ where }: any) => {
      const result = await db.select().from(payments).where(eq(payments.id, where.id)).limit(1);
      return result[0] || null;
    },
    create: async ({ data }: any) => {
      const result = await db.insert(payments).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(payments).set(data).where(eq(payments.id, where.id)).returning();
      return result[0];
    },
    delete: async ({ where }: any) => {
      await db.delete(payments).where(eq(payments.id, where.id));
    },
  },
  lead: {
    findMany: async ({ where, orderBy }: any = {}) => {
      if (where?.userId) {
        return db.select().from(leads).where(eq(leads.userId, where.userId));
      }
      return db.select().from(leads);
    },
    findUnique: async ({ where }: any) => {
      const result = await db.select().from(leads).where(eq(leads.id, where.id)).limit(1);
      return result[0] || null;
    },
    create: async ({ data }: any) => {
      const result = await db.insert(leads).values(data).returning();
      return result[0];
    },
    update: async ({ where, data }: any) => {
      const result = await db.update(leads).set(data).where(eq(leads.id, where.id)).returning();
      return result[0];
    },
    delete: async ({ where }: any) => {
      await db.delete(leads).where(eq(leads.id, where.id));
    },
  },
  
  $disconnect: async () => {
    // No-op for Drizzle
  },
};

// Export the actual Drizzle db instance as well
export { db as drizzleDb } from './drizzle-db';