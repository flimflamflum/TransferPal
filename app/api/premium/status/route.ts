import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { premiumUsers } from "@/lib/db/schema"
import { eq, and, gt } from "drizzle-orm"
import { verifyPremiumToken } from "@/lib/jwt"
import { cookies } from "next/headers"
import { createPremiumToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    console.log("Checking premium status...")

    // First, try to verify from JWT token
    const premiumToken = cookies().get("premium_token")?.value

    if (premiumToken) {
      console.log("Premium token found in cookies, verifying...")
      const payload = await verifyPremiumToken(premiumToken)

      if (payload && payload.premiumUntil * 1000 > Date.now()) {
        console.log("Valid premium token found, user is premium until:", new Date(payload.premiumUntil * 1000))
        return NextResponse.json({
          isPremium: true,
          expiresAt: new Date(payload.premiumUntil * 1000).toISOString(),
          source: "token",
        })
      } else {
        console.log("Premium token expired or invalid")
      }
    } else {
      console.log("No premium token found in cookies")
    }

    // If no valid token, check if wallet is connected and look up in database
    const walletAddress = request.headers.get("x-wallet-address")
    console.log("Checking wallet address:", walletAddress)

    if (walletAddress) {
      console.log("Looking up premium status for wallet:", walletAddress)
      const premiumUser = await db.query.premiumUsers.findFirst({
        where: and(
          eq(premiumUsers.walletAddress, walletAddress),
          eq(premiumUsers.isActive, true),
          gt(premiumUsers.expiresAt, new Date()),
        ),
      })

      if (premiumUser) {
        console.log("Premium user found in database:", premiumUser)
        // Create a new token and set it
        const token = await createPremiumToken(walletAddress, premiumUser.expiresAt)

        cookies().set({
          name: "premium_token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: premiumUser.expiresAt,
          path: "/",
        })

        return NextResponse.json({
          isPremium: true,
          expiresAt: premiumUser.expiresAt.toISOString(),
          source: "database",
        })
      } else {
        console.log("No active premium subscription found for wallet")
      }
    }

    // No premium status found
    console.log("No premium status found, user is not premium")
    return NextResponse.json({
      isPremium: false,
      expiresAt: null,
    })
  } catch (error) {
    console.error("Premium status check error:", error)
    return NextResponse.json({
      isPremium: false,
      expiresAt: null,
      error: "Failed to check premium status",
    })
  }
}

// Add a DELETE endpoint to clear premium status when disconnecting
export async function DELETE(request: NextRequest) {
  try {
    // Clear the premium token cookie
    cookies().set({
      name: "premium_token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "Premium status cleared",
    })
  } catch (error) {
    console.error("Error clearing premium status:", error)
    return NextResponse.json(
      {
        error: "Failed to clear premium status",
      },
      { status: 500 },
    )
  }
}

