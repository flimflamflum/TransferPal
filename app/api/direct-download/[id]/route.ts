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

    // Fetch the file content
    const fileResponse = await fetch(fileData.fileKey)

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file content")
    }

    const fileBlob = await fileResponse.blob()

    // Create a response with the file content and appropriate headers
    const response = new NextResponse(fileBlob, {
      status: 200,
      headers: {
        "Content-Type": fileData.fileType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileData.fileName)}"`,
        "Content-Length": fileData.fileSize.toString(),
      },
    })

    // If this is the last download, clean up the file after sending the response
    if (willExpire) {
      cleanupExpiredFile(fileData)
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

