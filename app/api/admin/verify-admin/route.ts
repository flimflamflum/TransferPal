import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcryptjs from "bcryptjs"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get admin users
    const adminUsers = await db.execute(sql`SELECT * FROM admin_users`)

    // Return admin users (without password hashes)
    const safeAdminUsers = adminUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      last_login: user.last_login,
    }))

    return NextResponse.json({
      success: true,
      adminUsers: safeAdminUsers,
      count: adminUsers.length,
    })
  } catch (error) {
    console.error("Admin verification error:", error)
    return NextResponse.json({ error: "Admin verification failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin user by email
    const adminUsers = await db.execute(sql`SELECT * FROM admin_users WHERE email = ${email} LIMIT 1`)

    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json(
        {
          error: "No admin user found with this email",
          email,
        },
        { status: 404 },
      )
    }

    const admin = adminUsers[0]

    // Verify password
    const passwordValid = await bcryptjs.compare(password, admin.password_hash)

    return NextResponse.json({
      success: true,
      passwordValid,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error("Admin verification error:", error)
    return NextResponse.json({ error: "Admin verification failed" }, { status: 500 })
  }
}

