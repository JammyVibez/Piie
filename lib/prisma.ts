import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

type PrismaClientType = PrismaClient

function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error("[Prisma] No database connection string found. Set DIRECT_URL or DATABASE_URL environment variable.")
    throw new Error("Database connection string is missing")
  }

  try {
    const adapter = new PrismaPg({
      connectionString,
    })

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  } catch (error) {
    console.error("[Prisma] Failed to create Prisma client:", error)
    throw error
  }
}

let prismaInstance: PrismaClientType | null = null
let initializationError: Error | null = null

function getPrismaClient(): PrismaClientType {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  
  if (initializationError) {
    throw initializationError
  }
  
  if (!prismaInstance) {
    try {
      prismaInstance = createPrismaClient()
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance
      }
    } catch (error) {
      console.error("[Prisma] Failed to initialize:", error)
      initializationError = error instanceof Error 
        ? error 
        : new Error("Prisma client failed to initialize. Check your database connection.")
      throw initializationError
    }
  }
  
  return prismaInstance
}

// Lazy getter - only initializes when accessed
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export default prisma
