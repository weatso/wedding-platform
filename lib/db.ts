import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Biar kita bisa lihat query SQL di terminal (untuk debugging)
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;