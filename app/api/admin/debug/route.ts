import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get table information
    const tables = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `)
    console.log("Tables:", JSON.stringify(tables))

    // Get column information for the files table
    let filesColumns = []
    try {
      filesColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'files'
    `)
      console.log("Files columns:", JSON.stringify(filesColumns))
    } catch (error) {
      console.error("Error getting files columns:", error)
    }

    // Get a sample of files with raw query to see exact structure
    let filesSample = []
    try {
      filesSample = await db.execute(sql`
      SELECT * FROM files LIMIT 5
    `)
      console.log("Files sample raw:", JSON.stringify(filesSample))
    } catch (error) {
      console.error("Error getting files sample:", error)
    }

    // Count files with a simpler query
    let filesCount = 0
    try {
      const countResult = await db.execute(sql`SELECT COUNT(*) FROM files`)
      console.log("Raw count result:", JSON.stringify(countResult))

      if (countResult && countResult.length > 0) {
        // Extract the count value from the first column of the first row
        const firstRow = countResult[0]
        console.log("First row of count result:", JSON.stringify(firstRow))

        // Try different ways to access the count
        const countValue = firstRow.count || firstRow.count_big || firstRow["count(*)"] || Object.values(firstRow)[0]
        console.log("Extracted count value:", countValue)

        filesCount = Number(countValue)
      }
    } catch (error) {
      console.error("Error counting files:", error)
    }

    // Test a simple sum query
    let totalSize = 0
    try {
      const sizeResult = await db.execute(sql`SELECT COALESCE(SUM(file_size), 0) FROM files`)
      console.log("Raw size result:", JSON.stringify(sizeResult))

      if (sizeResult && sizeResult.length > 0) {
        const firstRow = sizeResult[0]
        console.log("First row of size result:", JSON.stringify(firstRow))

        // Try different ways to access the sum
        const sizeValue =
          firstRow.sum || firstRow.coalesce || firstRow["coalesce(sum(file_size), 0)"] || Object.values(firstRow)[0]
        console.log("Extracted size value:", sizeValue)

        totalSize = sizeValue === null ? 0 : Number(sizeValue)
      }
    } catch (error) {
      console.error("Error summing file sizes:", error)
    }

    // Try a direct query to see what's in the database
    let directQueryResult = null
    try {
      directQueryResult = await db.execute(sql`SELECT * FROM files`)
      console.log("Direct query result count:", directQueryResult.length)
    } catch (error) {
      console.error("Error with direct query:", error)
    }

    return NextResponse.json({
      tables,
      filesColumns,
      filesSample,
      filesCount,
      totalSize,
      rawCountSample: filesSample.length > 0 ? Object.keys(filesSample[0]) : [],
      directQueryResultCount: directQueryResult ? directQueryResult.length : 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch debug information",
        errorDetails: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

