import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

/**
 * Lazy initialization of Prisma Client
 * This prevents build errors when DATABASE_URL is not set or database is not accessible
 * The connection will only be created at runtime when Prisma is actually used
 */
let prismaInstance: ReturnType<typeof createPrismaClient> | null = null;

/**
 * Creates and configures the Prisma Client with Neon adapter
 * - Sets up WebSocket connections for Neon serverless
 * - Creates connection pool with DATABASE_URL
 * - Extends PrismaClient with custom result transformers for price and rating fields
 */
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not defined in environment variables. ' +
      'Database functionality requires a valid connection string. ' +
      'Please set DATABASE_URL in your environment.'
    );
  }

  // Sets up WebSocket connections for Neon
  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}`;

  // Creates connection pool
  const pool = new Pool({ connectionString });

  // Instantiates Prisma adapter with Neon pool
  const adapter = new PrismaNeon(pool);

  // Extends PrismaClient with custom result transformers
  return new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });
}

/**
 * Get or create the Prisma Client instance
 * - Lazy initialization prevents build-time errors
 * - Singleton pattern ensures single instance
 */
function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
}

/**
 * Prisma Client configured for Neon serverless
 * Uses lazy initialization to prevent build-time errors
 */
export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get: (target, prop) => {
    const instance = getPrismaClient();
    const value = instance[prop as keyof typeof instance];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
