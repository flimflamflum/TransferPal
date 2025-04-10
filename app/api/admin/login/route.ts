import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

// Admin password - in a real app, this would be stored securely
const ADMIN_PASSWORD = "transferpal123"

// Use the existing JWT_SECRET from environment variables
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long-here")

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Simple password check
    if (password !== ADMIN_PASSWORD) {
      console.log("Invalid password attempt")
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    console.log("Admin login successful")

    // Create admin token
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 60 * 60 * 24 * 7 // 7 days

    const token = await new SignJWT({
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(JWT_SECRET)

    // Set admin cookie
    cookies().set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

