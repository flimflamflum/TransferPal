import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { del } from "@vercel/blob"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shareId = params.id

    // Get the file with this shareId
    const fileData = await db.query.files.findFirst({
      where: eq(files.shareId, shareId),
    })

    if (!fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if file is already marked as expired
    if (fileData.isExpired) {
      // Clean up the file
      await cleanupExpiredFile(fileData)
      return NextResponse.json({ error: "Link expired" }, { status: 410 })
    }

    // Check time-based expiration
    if (fileData.expiresAt) {
      if (new Date() > new Date(fileData.expiresAt)) {
        // File has expired - clean it up immediately
        await cleanupExpiredFile(fileData)
        return NextResponse.json({ error: "Link expired" }, { status: 410 })
      }
    }

    // Check download limit (for download-based expiration)
    if (fileData.expiryType === "downloads" && fileData.downloadLimit) {
      if (fileData.downloadCount >= fileData.downloadLimit) {
        // File has expired - clean it up immediately
        await cleanupExpiredFile(fileData)
        return NextResponse.json({ error: "Link expired" }, { status: 410 })
      }
    }

    // Increment download count
    await db
      .update(files)
      .set({ downloadCount: fileData.downloadCount + 1 })
      .where(eq(files.id, fileData.id))

    // Check if this download will cause expiration due to download limit
    const willExpire =
      fileData.expiryType === "downloads" &&
      fileData.downloadLimit &&
      fileData.downloadCount + 1 >= fileData.downloadLimit

    // If this is the last download, clean up the file after sending the response
    let cleanupPromise = Promise.resolve()
    if (willExpire) {
      cleanupPromise = cleanupExpiredFile(fileData)
    }

    // For the frontend display, we need to show the original download limit (not the adjusted one)
    // So if the download limit is 2, 4, or 6, we'll display 1, 3, or 5
    let displayDownloadLimit = fileData.downloadLimit
    if (fileData.expiryType === "downloads" && fileData.downloadLimit) {
      displayDownloadLimit = fileData.downloadLimit - 1
    }

    // Return file metadata for the frontend
    const response = NextResponse.json({
      id: fileData.id,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      fileUrl: fileData.fileKey,
      downloadCount: fileData.downloadCount + 1,
      isExpired: willExpire,
      expiryType: fileData.expiryType,
      downloadLimit: displayDownloadLimit, // Use the display download limit
      timeLimit: fileData.timeLimit,
    })

    // Wait for cleanup to complete if this is the last download
    if (willExpire) {
      await cleanupPromise
    }

    return response
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

// Helper function to clean up expired files
async function cleanupExpiredFile(fileData: any) {
  try {
    console.log(`Cleaning up expired file: ${fileData.fileName} (ID: ${fileData.id})`)

    // Delete the file from Blob storage
    try {
      await del(fileData.fileKey)
      console.log(`Deleted file from Blob storage: ${fileData.fileKey}`)
    } catch (blobError) {
      console.error(`Error deleting from Blob storage: ${blobError}`)
      // Continue with database deletion even if Blob deletion fails
    }

    // Delete the record from the database
    await db.delete(files).where(eq(files.id, fileData.id))

    console.log(`Deleted file record from database: ${fileData.id}`)
    return true
  } catch (error) {
    console.error(`Failed to clean up file ${fileData.id}:`, error)
    return false
  }
}

