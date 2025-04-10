import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Initialize default values
    let totalFiles = 0
    let activeFiles = 0
    let totalPremiumUsers = 0
    let activePremiumUsers = 0
    let storageUsed = 0
    let recentUploads = 0
    let recentSubscriptions = 0
    let totalRevenue = 0

    // Debug: Log the database connection
    console.log("Admin stats: Checking database connection...")
    const dbCheck = await db.execute(sql`SELECT 1 as connected`)
    console.log("Database connection check:", dbCheck)

    // Get total files count
    try {
      console.log("Admin stats: Querying total files...")
      const totalFilesResult = await db.execute(sql`SELECT COUNT(*) FROM files`)
      console.log("Total files query result:", JSON.stringify(totalFilesResult))

      if (totalFilesResult && totalFilesResult.length > 0) {
        // Extract the count value - Neon returns the count in the first column of the first row
        const firstRow = totalFilesResult[0]
        console.log("First row of total files result:", JSON.stringify(firstRow))

        // Try to get the count value, regardless of the column name
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        console.log("Extracted count value:", countValue)

        totalFiles = Number(countValue)
      }
      console.log("Parsed total files:", totalFiles)
    } catch (error) {
      console.error("Error getting total files:", error)
    }

    // Get active files count
    try {
      console.log("Admin stats: Querying active files...")
      const activeFilesResult = await db.execute(
        sql`SELECT COUNT(*) FROM files WHERE is_expired = false AND expires_at > NOW()`,
      )
      console.log("Active files query result:", JSON.stringify(activeFilesResult))

      if (activeFilesResult && activeFilesResult.length > 0) {
        const firstRow = activeFilesResult[0]
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        activeFiles = Number(countValue)
      }
      console.log("Parsed active files:", activeFiles)
    } catch (error) {
      console.error("Error getting active files:", error)
    }

    // Get total storage used
    try {
      console.log("Admin stats: Querying storage used...")
      const storageUsedResult = await db.execute(sql`SELECT COALESCE(SUM(file_size), 0) FROM files`)
      console.log("Storage used query result:", JSON.stringify(storageUsedResult))

      if (storageUsedResult && storageUsedResult.length > 0) {
        const firstRow = storageUsedResult[0]
        console.log("First row of storage used result:", JSON.stringify(firstRow))

        // Try different ways to access the sum value
        const sumValue =
          firstRow.sum || firstRow.coalesce || firstRow["coalesce(sum(file_size), 0)"] || Object.values(firstRow)[0]
        console.log("Extracted sum value:", sumValue)

        storageUsed = sumValue === null ? 0 : Number(sumValue)
      }
      console.log("Parsed storage used:", storageUsed)
    } catch (error) {
      console.error("Error getting storage used:", error)
    }

    // Get recent uploads
    try {
      console.log("Admin stats: Querying recent uploads...")
      const recentUploadsResult = await db.execute(
        sql`SELECT COUNT(*) FROM files WHERE uploaded_at > NOW() - INTERVAL '24 hours'`,
      )
      console.log("Recent uploads query result:", JSON.stringify(recentUploadsResult))

      if (recentUploadsResult && recentUploadsResult.length > 0) {
        const firstRow = recentUploadsResult[0]
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        recentUploads = Number(countValue)
      }
    } catch (error) {
      console.error("Error getting recent uploads:", error)
    }

    // Get total premium users count
    try {
      const premiumUsersResult = await db.execute(sql`SELECT COUNT(*) FROM premium_users`)
      console.log("Premium users query result:", JSON.stringify(premiumUsersResult))

      if (premiumUsersResult && premiumUsersResult.length > 0) {
        const firstRow = premiumUsersResult[0]
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        totalPremiumUsers = Number(countValue)
      }
    } catch (error) {
      console.error("Error getting total premium users:", error)
    }

    // Get active premium users count
    try {
      const activePremiumUsersResult = await db.execute(
        sql`SELECT COUNT(*) FROM premium_users WHERE is_active = true AND expires_at > NOW()`,
      )
      console.log("Active premium users query result:", JSON.stringify(activePremiumUsersResult))

      if (activePremiumUsersResult && activePremiumUsersResult.length > 0) {
        const firstRow = activePremiumUsersResult[0]
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        activePremiumUsers = Number(countValue)
      }
    } catch (error) {
      console.error("Error getting active premium users:", error)
    }

    // Get recent subscriptions
    try {
      const recentSubscriptionsResult = await db.execute(
        sql`SELECT COUNT(*) FROM premium_users WHERE purchased_at > NOW() - INTERVAL '30 days'`,
      )
      console.log("Recent subscriptions query result:", JSON.stringify(recentSubscriptionsResult))

      if (recentSubscriptionsResult && recentSubscriptionsResult.length > 0) {
        const firstRow = recentSubscriptionsResult[0]
        const countValue = firstRow.count || firstRow["count(*)"] || Object.values(firstRow)[0]
        recentSubscriptions = Number(countValue)
      }
    } catch (error) {
      console.error("Error getting recent subscriptions:", error)
    }

    // Get total revenue
    try {
      const revenueResult = await db.execute(sql`SELECT COALESCE(SUM(amount), 0) FROM premium_users`)
      console.log("Revenue query result:", JSON.stringify(revenueResult))

      if (revenueResult && revenueResult.length > 0) {
        const firstRow = revenueResult[0]
        const sumValue =
          firstRow.sum || firstRow.coalesce || firstRow["coalesce(sum(amount), 0)"] || Object.values(firstRow)[0]
        totalRevenue = sumValue === null ? 0 : Number(sumValue)
      }
    } catch (error) {
      console.error("Error getting total revenue:", error)
    }

    // Log the final stats we're returning
    console.log("Admin stats: Returning stats:", {
      totalFiles,
      activeFiles,
      totalPremiumUsers,
      activePremiumUsers,
      storageUsed,
      recentUploads,
      recentSubscriptions,
      totalRevenue,
    })

    return NextResponse.json({
      totalFiles,
      activeFiles,
      totalPremiumUsers,
      activePremiumUsers,
      storageUsed,
      recentUploads,
      recentSubscriptions,
      totalRevenue,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        // Return empty stats to prevent dashboard errors
        totalFiles: 0,
        activeFiles: 0,
        totalPremiumUsers: 0,
        activePremiumUsers: 0,
        storageUsed: 0,
        recentUploads: 0,
        recentSubscriptions: 0,
        totalRevenue: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    ) // Return 200 even on error to prevent dashboard from breaking
  }
}

