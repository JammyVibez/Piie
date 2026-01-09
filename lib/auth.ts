import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import type { UserRole } from "../generated/prisma"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
)
const JWT_EXPIRES_IN = "7d"

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  avatar?: string | null
  bannerImage?: string | null
  bio?: string | null
  location?: string | null
  userRole: string
  workerRole?: string | null
  level: number
  xp: number
  influenceScore: number
  realm?: string | null
  isOnline: boolean
  emailVerified: boolean
  createdAt: Date
}

export async function generateToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
    }
  } catch {
    return null
  }
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  return user as AuthUser | null
}

export async function findUserByUsername(username: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  })
  return user as AuthUser | null
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  })
  return user as AuthUser | null
}

export async function findUserWithPasswordByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
  } catch (error) {
    console.error("[Auth] Error finding user by email:", error)
    throw new Error("Database error while finding user")
  }
}

export async function createUser(data: {
  name: string
  username: string
  email: string
  password: string
  userRole: string
}): Promise<AuthUser> {
  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      passwordHash: hashedPassword,
      userRole: data.userRole as UserRole,
      level: 1,
      xp: 0,
      influenceScore: 0,
      isOnline: true,
    },
  })

  return user as AuthUser
}

export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long" }
  }
  if (username.length > 20) {
    return { isValid: false, error: "Username must be less than 20 characters" }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: "Username can only contain letters, numbers, and underscores" }
  }
  return { isValid: true }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeVerificationCode(email: string, code: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      code,
      expiresAt,
    },
  })
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return false

  const token = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
  })

  return !!token
}

export async function deleteVerificationCode(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })
}

export async function markEmailVerified(email: string): Promise<void> {
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { emailVerified: true },
  })
}

export async function updatePassword(email: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash: hashedPassword },
  })
}

export async function createSession(userId: string, refreshToken: string, deviceInfo?: {
  deviceType?: string
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      deviceType: deviceInfo?.deviceType,
      ipAddress: deviceInfo?.ipAddress,
      userAgent: deviceInfo?.userAgent,
      expiresAt,
    },
  })
}

export async function deleteSession(refreshToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { refreshToken },
  })
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  try {
    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }).catch(() => 0),
      prisma.follow.count({ where: { followerId: userId } }).catch(() => 0),
    ])
    return { followers, following }
  } catch (error) {
    console.error("[Auth] Error getting follow counts:", error)
    // Return default values instead of throwing to prevent login failure
    return { followers: 0, following: 0 }
  }
}
