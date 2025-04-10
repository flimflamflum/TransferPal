// Premium tier daily upload limit (500MB)
export const PREMIUM_DAILY_LIMIT = 500 * 1024 * 1024

// Free tier daily upload limit (50MB)
export const FREE_DAILY_LIMIT = 50 * 1024 * 1024

interface PremiumStatus {
  isPremium: boolean
  expiresAt: number | null // Unix timestamp in milliseconds
}

// Check if the user has premium status
export async function getPremiumStatus(): Promise<PremiumStatus> {
  try {
    // First check localStorage for cached premium status
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const storedStatus = localStorage.getItem("premiumStatus")
        if (storedStatus) {
          const status: PremiumStatus = JSON.parse(storedStatus)

          // Check if premium has expired
          if (status.expiresAt && status.expiresAt > Date.now()) {
            console.log("Using cached premium status from localStorage")
            return status
          } else if (status.expiresAt && status.expiresAt <= Date.now()) {
            // Clear expired premium status
            localStorage.removeItem("premiumStatus")
          }
        }
      } catch (localStorageError) {
        console.error("Error reading premium status from localStorage:", localStorageError)
      }
    }

    // Only attempt server-side API calls in the browser
    if (typeof window === "undefined") {
      return { isPremium: false, expiresAt: null }
    }

    // In the browser, we can safely use relative URLs
    try {
      const response = await fetch("/api/premium/status", {
        method: "GET",
        credentials: "include", // Include cookies for JWT
        headers: {
          // Add wallet address if available
          ...(window.phantom?.solana?.publicKey
            ? { "x-wallet-address": window.phantom.solana.publicKey.toString() }
            : {}),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to check premium status")
      }

      const data = await response.json()

      // If premium status is confirmed, update localStorage
      if (data.isPremium && data.expiresAt) {
        const expiresAt = new Date(data.expiresAt).getTime()
        localStorage.setItem(
          "premiumStatus",
          JSON.stringify({
            isPremium: true,
            expiresAt,
          }),
        )

        return {
          isPremium: true,
          expiresAt,
        }
      }

      // If not premium according to server, check localStorage again as fallback
      if (!data.isPremium) {
        // We already checked localStorage at the beginning, but we'll do a final check
        // in case something changed during the API call
        if (typeof window !== "undefined" && window.localStorage) {
          const storedStatus = localStorage.getItem("premiumStatus")
          if (storedStatus) {
            const status: PremiumStatus = JSON.parse(storedStatus)
            if (status.expiresAt && status.expiresAt > Date.now()) {
              console.log("Using localStorage premium status as fallback")
              return status
            }
          }
        }

        return { isPremium: false, expiresAt: null }
      }

      return {
        isPremium: data.isPremium,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : null,
      }
    } catch (error) {
      console.error("Error checking premium status:", error)

      // Fallback to localStorage if server check fails
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const storedStatus = localStorage.getItem("premiumStatus")
          if (storedStatus) {
            const status: PremiumStatus = JSON.parse(storedStatus)

            // Check if premium has expired
            if (status.expiresAt && status.expiresAt > Date.now()) {
              console.log("Using localStorage premium status after API error")
              return status
            } else {
              localStorage.removeItem("premiumStatus")
            }
          }
        } catch (localStorageError) {
          console.error("Error reading premium status from localStorage:", localStorageError)
        }
      }

      return { isPremium: false, expiresAt: null }
    }
  } catch (error) {
    console.error("Unexpected error in getPremiumStatus:", error)
    return { isPremium: false, expiresAt: null }
  }
}

// Set premium status (this will be called after successful payment)
export function setPremiumStatus(expiresAt: number): PremiumStatus {
  const status: PremiumStatus = {
    isPremium: true,
    expiresAt,
  }

  // Store in localStorage as fallback
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("premiumStatus", JSON.stringify(status))
  }

  return status
}

// Get the appropriate daily limit based on premium status
export async function getDailyUploadLimit(): Promise<number> {
  try {
    const { isPremium } = await getPremiumStatus()
    return isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT
  } catch (error) {
    console.error("Error getting daily upload limit:", error)
    return FREE_DAILY_LIMIT // Default to free tier if there's an error
  }
}

// Direct activation function for emergency use
export function activatePremiumDirectly(durationDays = 30): PremiumStatus {
  const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000

  const status: PremiumStatus = {
    isPremium: true,
    expiresAt,
  }

  // Store in localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("premiumStatus", JSON.stringify(status))
  }

  return status
}

