import { type NextRequest, NextResponse } from "next/server"
import { createAdminUser } from "@/lib/admin-auth"

// This is a one-time setup endpoint that should be disabled in production
export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const secretKey = request.nextUrl.searchParams.get("key")
    if (secretKey !== process.env.ADMIN_SETUP_KEY && secretKey !== "setup-admin-123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create admin user
    const admin = await createAdminUser("transferpalpro@gmail.com", "admin123", "TransferPal Admin")

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error("Admin setup error:", error)
    return NextResponse.json({ error: "Admin setup failed" }, { status: 500 })
  }
}

