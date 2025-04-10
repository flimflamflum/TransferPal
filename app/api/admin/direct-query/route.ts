import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }

    // Execute the raw SQL query
    const result = await db.execute(sql.raw(query))

    return NextResponse.json({
      success: true,
      result,
      rowCount: result.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Direct query error:", error)
    return NextResponse.json(
      {
        error: "Query execution failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

