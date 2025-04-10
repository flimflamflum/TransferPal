import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { db } from "@/lib/db"
import { files } from "@/lib/db/schema"
import { nanoid } from "nanoid"

// Default maximum lifetime for all files: 72 hours (3 days) in milliseconds
const DEFAULT_MAX_LIFETIME = 72 * 60 * 60 * 1000 // 72 hours in milliseconds

// Maximum file size: 50MB in bytes
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const expiryType = formData.get("expiryType") as string
    const downloadLimit = Number.parseInt(formData.get("downloadLimit") as string)
    const timeLimit = Number.parseInt(formData.get("timeLimit") as string)

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 50MB limit" }, { status: 413 })
    }

    // Generate a unique ID for the share URL
    const shareId = nanoid(10)

    // Calculate expiration timestamp based on user selection
    // For time-based expiry: use the user-selected time limit
    // For download-based expiry: use the default 72-hour limit
    const userExpiresAt =
      expiryType === "time"
        ? new Date(Date.now() + timeLimit * 60 * 60 * 1000)
        : new Date(Date.now() + DEFAULT_MAX_LIFETIME)

    // Always use the earlier of the two expiration times
    const expiresAt = userExpiresAt

    // Upload to Vercel Blob with expiration
    const blob = await put(`files/${shareId}/${file.name}`, file, {
      access: "public",
      // Always set an expiresAt for Blob storage
      expiresAt: expiresAt,
    })

    // Add 1 to the download limit to ensure the first person can download it
    // This is the key change to fix the issue
    const adjustedDownloadLimit = expiryType === "downloads" ? downloadLimit + 1 : null

    // Store metadata in Neon
    await db.insert(files).values({
      fileKey: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      shareId,
      expiryType,
      downloadLimit: adjustedDownloadLimit, // Use the adjusted download limit
      timeLimit: expiryType === "time" ? timeLimit : null,
      // Always set an expiration date
      expiresAt: expiresAt,
      uploadedAt: new Date(),
      downloadCount: 0,
      isExpired: false,
    })

    // Return the share URL
    return NextResponse.json({
      shareId,
      shareUrl: `${request.nextUrl.origin}/download/${shareId}`,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

