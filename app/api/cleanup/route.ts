import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { eq, lt, or } from "drizzle-orm"
import { del } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    // Find expired files
    const expiredFiles = await db
      .select()
      .from(files)
      .where(
        or(
          eq(files.isExpired, true),
          lt(files.expiresAt, new Date()), // This catches all expired files, including download-based ones
        ),
      )

    if (expiredFiles.length === 0) {
      return NextResponse.json({ message: "No expired files to clean up" })
    }

    // Delete each file from Blob storage
    const deletionPromises = expiredFiles.map(async (file) => {
      try {
        // Delete from Blob storage
        try {
          await del(file.fileKey)
          console.log(`Deleted file from Blob storage: ${file.fileKey}`)
        } catch (blobError) {
          console.error(`Error deleting from Blob storage: ${blobError}`)
          // Continue with database deletion even if Blob deletion fails
        }

        // Delete the database record
        await db.delete(files).where(eq(files.id, file.id))

        return { id: file.id, fileName: file.fileName, success: true }
      } catch (error) {
        console.error(`Failed to delete file ${file.id}:`, error)
        return { id: file.id, fileName: file.fileName, success: false, error }
      }
    })

    const results = await Promise.all(deletionPromises)

    return NextResponse.json({
      message: `Cleaned up ${results.filter((r) => r.success).length} expired files`,
      results,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}

