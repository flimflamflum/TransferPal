import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import { sql } from "drizzle-orm"

// Create the connection
const sql_client = neon(process.env.NEON_DATABASE_URL!)
export const db = drizzle(sql_client, { schema })

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    console.log("Checking database connection...")
    const result = await db.execute(sql`SELECT 1 as connected`)
    console.log("Database connection check result:", JSON.stringify(result))
    return { connected: result[0]?.connected === 1 }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error }
  }
}

// Helper function to safely extract a count value from a query result
export function extractCountValue(result: any[]): number {
  if (!result || result.length === 0) {
    return 0
  }

  const firstRow = result[0]

  // Try different possible column names for count
  if (firstRow.count !== undefined) {
    return Number(firstRow.count)
  }

  if (firstRow["count(*)"] !== undefined) {
    return Number(firstRow["count(*)"])
  }

  // If we can't find a specific column, take the first value
  const firstValue = Object.values(firstRow)[0]
  return firstValue === null ? 0 : Number(firstValue)
}

// Helper function to safely extract a sum value from a query result
export function extractSumValue(result: any[]): number {
  if (!result || result.length === 0) {
    return 0
  }

  const firstRow = result[0]

  // Try different possible column names for sum
  if (firstRow.sum !== undefined) {
    return Number(firstRow.sum)
  }

  if (firstRow.coalesce !== undefined) {
    return Number(firstRow.coalesce)
  }

  // If we can't find a specific column, take the first value
  const firstValue = Object.values(firstRow)[0]
  return firstValue === null ? 0 : Number(firstValue)
}

