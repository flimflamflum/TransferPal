import bcryptjs from "bcryptjs"
import { db } from "./db"
import { sql } from "drizzle-orm"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// This should be a secure environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long-here")

export interface AdminJWTPayload {
  sub: string // admin id
  email: string
  name: string
  iat: number // issued at
  exp: number // expiration
}

// Create a JWT token for admin users
export async function createAdminToken(adminId: string, email: string, name: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 7 // 7 days

  return new SignJWT({
    email,
    name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(JWT_SECRET)
}

// Verify a JWT token
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as AdminJWTPayload
  } catch (error) {
    console.error("Admin JWT verification error:", error)
    return null
  }
}

// Middleware to check if user is admin
export async function isAdmin(request: NextRequest) {
  const cookieStore = request.cookies
  const adminToken = cookieStore.get("admin_token")?.value

  if (!adminToken) {
    return false
  }

  const payload = await verifyAdminToken(adminToken)
  return !!payload
}

// Helper to set admin cookie
export function setAdminCookie(token: string) {
  cookies().set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Helper to clear admin cookie
export function clearAdminCookie() {
  cookies().set({
    name: "admin_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
}

// Helper to hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

// Helper to create an admin user
export async function createAdminUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)

  try {
    const result = await db.execute(
      sql`INSERT INTO admin_users (email, password_hash, name) 
          VALUES (${email}, ${hashedPassword}, ${name})
          ON CONFLICT (email) DO UPDATE 
          SET password_hash = ${hashedPassword}, name = ${name}
          RETURNING id, email, name`,
    )

    return result[0]
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}

