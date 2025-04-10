import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    return NextResponse.json({
      status: "ok",
      database: dbStatus.connected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

