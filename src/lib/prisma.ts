import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL || "file:./dev.db";

  if (url.startsWith("postgresql") || url.startsWith("postgres")) {
    const { PrismaNeon } = await import("@prisma/adapter-neon");
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  const { PrismaLibSql } = await import("@prisma/adapter-libsql");
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

let prismaPromise: Promise<PrismaClient> | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!prismaPromise) {
    prismaPromise = createPrismaClient();
  }
  globalForPrisma.prisma = await prismaPromise;
  return globalForPrisma.prisma;
}
