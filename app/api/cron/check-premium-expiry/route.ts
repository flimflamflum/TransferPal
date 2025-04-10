import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { premiumUsers } from "@/lib/db/schema"
import { eq, lt, and } from "drizzle-orm"

export async function GET() {
  try {
    // Find expired premium users
    const now = new Date()

    // Update expired premium users
    const result = await db
      .update(premiumUsers)
      .set({ isActive: false })
      .where(and(eq(premiumUsers.isActive, true), lt(premiumUsers.expiresAt, now)))

    return NextResponse.json({
      success: true,
      message: `Checked premium expiry. Deactivated ${result.rowCount} expired subscriptions.`,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Premium expiry check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check premium expiry",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

