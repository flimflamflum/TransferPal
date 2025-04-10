// Daily upload limit in bytes (50MB for free tier, 500MB for premium)
// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024

interface QuotaData {
  date: string
  bytesUsed: number
}

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

// Get the current quota usage
export function getQuotaUsage(): QuotaData {
  // Default to empty quota if nothing in localStorage
  const defaultQuota: QuotaData = {
    date: getTodayString(),
    bytesUsed: 0,
  }

  // Check if localStorage is available (it won't be during SSR)
  if (typeof window === "undefined" || !window.localStorage) {
    return defaultQuota
  }

  try {
    const storedQuota = localStorage.getItem("uploadQuota")
    if (!storedQuota) {
      return defaultQuota
    }

    const quotaData: QuotaData = JSON.parse(storedQuota)

    // If the stored date is not today, reset the quota
    if (quotaData.date !== getTodayString()) {
      const resetQuota = {
        date: getTodayString(),
        bytesUsed: 0,
      }
      localStorage.setItem("uploadQuota", JSON.stringify(resetQuota))
      return resetQuota
    }

    return quotaData
  } catch (error) {
    console.error("Error reading quota from localStorage:", error)
    return defaultQuota
  }
}

// Update the quota after a successful upload
export function updateQuotaUsage(bytesUploaded: number): QuotaData {
  const currentQuota = getQuotaUsage()

  const newQuota: QuotaData = {
    date: getTodayString(),
    bytesUsed: currentQuota.bytesUsed + bytesUploaded,
  }

  // Check if localStorage is available
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("uploadQuota", JSON.stringify(newQuota))
  }

  return newQuota
}

// Check if an upload would exceed the daily limit
export function wouldExceedQuota(fileSize: number): boolean {
  const currentQuota = getQuotaUsage()
  const dailyLimit = getDailyUploadLimit()
  return currentQuota.bytesUsed + fileSize > dailyLimit
}

// Get remaining quota in bytes
export function getRemainingQuota(): number {
  const currentQuota = getQuotaUsage()
  const dailyLimit = getDailyUploadLimit()
  return Math.max(0, dailyLimit - currentQuota.bytesUsed)
}

// Format bytes to a human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  if (isNaN(bytes) || bytes === undefined) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Get the appropriate daily limit based on premium status
const PREMIUM_DAILY_LIMIT = 500 * 1024 * 1024 // 500MB
const FREE_DAILY_LIMIT = 50 * 1024 * 1024 // 50MB

export function getDailyUploadLimit(): number {
  // For client-side rendering, we need a synchronous check
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const storedStatus = localStorage.getItem("premiumStatus")
      if (storedStatus) {
        const status = JSON.parse(storedStatus)
        if (status.isPremium && status.expiresAt && status.expiresAt > Date.now()) {
          return PREMIUM_DAILY_LIMIT
        }
      }
    } catch (error) {
      console.error("Error reading premium status:", error)
    }
  }
  return FREE_DAILY_LIMIT
}

