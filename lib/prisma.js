
import { PrismaClient } from '@/lib/generated/prisma';

export const db = globalThis.prisma || new PrismaClient();


if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;   
// Prevents the Prisma Client from being closed in development mode


}
//DESCRIPTION: This code initializes a Prisma Client instance for database interactions in a Next.js application. It ensures that the client is reused across module imports in development mode to avoid exhausting database connections. In production
// , a new instance is created as needed.