import { type NextRequest, NextResponse } from "next/server"
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { db } from "@/lib/db"
import { premiumUsers, transactionLogs } from "@/lib/db/schema"
import { createPremiumToken } from "@/lib/jwt"
import { cookies } from "next/headers"
import { SOLANA_CONFIG } from "@/lib/config"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { signature, recipient } = await request.json()

    if (!signature) {
      return NextResponse.json({ error: "Missing transaction signature" }, { status: 400 })
    }

    // Connect to Solana
    const connection = new Connection(`https://api.${SOLANA_CONFIG.NETWORK}.solana.com`, "confirmed")

    // Get transaction details - this is required
    let transactionDetails
    try {
      transactionDetails = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      })
    } catch (error) {
      console.error("Error fetching transaction:", error)
      return NextResponse.json(
        {
          error: "Invalid transaction signature. Please check and try again.",
        },
        { status: 400 },
      )
    }

    // If we can't find the transaction, reject
    if (!transactionDetails) {
      console.log("Transaction not found")
      return NextResponse.json(
        {
          error: "Transaction not found. Please check the signature and try again.",
        },
        { status: 404 },
      )
    }

    // Verify the transaction is a payment to our wallet
    let isValidPayment = false
    let senderAddress = ""
    let paymentAmount = 0

    // Try to verify it's a payment to our wallet
    const accountKeys = transactionDetails.transaction.message.accountKeys
    const recipientIndex = accountKeys.findIndex((key) => key.toString() === SOLANA_CONFIG.RECIPIENT_WALLET)

    if (recipientIndex === -1) {
      return NextResponse.json(
        {
          error: "This transaction was not sent to our payment wallet",
        },
        { status: 400 },
      )
    }

    if (transactionDetails.meta) {
      const preBalance = transactionDetails.meta.preBalances[recipientIndex]
      const postBalance = transactionDetails.meta.postBalances[recipientIndex]

      // Check if recipient received funds
      if (postBalance > preBalance) {
        paymentAmount = postBalance - preBalance

        // Verify payment amount is at least 80% of expected price
        const minimumAmount = SOLANA_CONFIG.PREMIUM_PRICE * LAMPORTS_PER_SOL * 0.8

        if (paymentAmount >= minimumAmount) {
          isValidPayment = true
          // Get sender (first account)
          senderAddress = accountKeys[0].toString()
          console.log(`Valid payment of ${paymentAmount / LAMPORTS_PER_SOL} SOL from ${senderAddress}`)
        } else {
          return NextResponse.json(
            {
              error: `Payment amount too low. Expected at least ${SOLANA_CONFIG.PREMIUM_PRICE} SOL, received ${paymentAmount / LAMPORTS_PER_SOL} SOL`,
            },
            { status: 400 },
          )
        }
      } else {
        return NextResponse.json(
          {
            error: "No payment detected in this transaction",
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        {
          error: "Invalid transaction format",
        },
        { status: 400 },
      )
    }

    // Only proceed if valid payment
    if (!isValidPayment) {
      return NextResponse.json(
        {
          error: "Invalid payment transaction",
        },
        { status: 400 },
      )
    }

    // Check if this transaction has already been processed
    const existingTransaction = await db.query.transactionLogs
      .findFirst({
        where: (fields, operators) => operators.eq(fields.signature, signature),
      })
      .catch(() => null)

    if (existingTransaction) {
      // If already processed, still return success with expiry date
      const existingPremium = await db.query.premiumUsers
        .findFirst({
          where: (fields, operators) => operators.eq(fields.transactionSignature, signature),
        })
        .catch(() => null)

      if (existingPremium) {
        return NextResponse.json({
          success: true,
          message: "This transaction has already been processed",
          premium: {
            expiresAt: existingPremium.expiresAt.toISOString(),
          },
        })
      } else {
        return NextResponse.json(
          {
            error: "This transaction has already been processed but premium status not found",
          },
          { status: 400 },
        )
      }
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SOLANA_CONFIG.PREMIUM_DURATION_DAYS)

    // Store premium user in database
    try {
      // First check if a premium user with this wallet already exists
      const existingPremiumUser = await db.query.premiumUsers
        .findFirst({
          where: (fields, operators) => operators.eq(fields.walletAddress, senderAddress),
        })
        .catch(() => null)

      if (existingPremiumUser) {
        // Update the existing premium user record
        await db
          .update(premiumUsers)
          .set({
            transactionSignature: signature,
            purchasedAt: new Date(),
            expiresAt,
            isActive: true,
            amount: paymentAmount,
          })
          .where(eq(premiumUsers.walletAddress, senderAddress))
      } else {
        // Create a new premium user record
        await db.insert(premiumUsers).values({
          walletAddress: senderAddress,
          transactionSignature: signature,
          purchasedAt: new Date(),
          expiresAt,
          isActive: true,
          amount: paymentAmount,
        })
      }

      // Check if transaction log already exists
      const existingLog = await db.query.transactionLogs
        .findFirst({
          where: (fields, operators) => operators.eq(fields.signature, signature),
        })
        .catch(() => null)

      if (!existingLog) {
        // Only insert transaction log if it doesn't exist
        await db.insert(transactionLogs).values({
          signature,
          walletAddress: senderAddress,
          amount: paymentAmount,
          status: "confirmed",
          timestamp: new Date(),
          metadata: JSON.stringify({
            type: "premium_upgrade",
            method: "manual_verification",
            duration: `${SOLANA_CONFIG.PREMIUM_DURATION_DAYS} days`,
            expiresAt: expiresAt.toISOString(),
          }),
        })
      }
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Even if database operations fail, still set the premium status in localStorage
      // by returning success with a special flag
      return NextResponse.json({
        success: true,
        message: "Payment verified but database update failed. Premium activated locally.",
        premium: {
          expiresAt: expiresAt.toISOString(),
          localOnly: true,
        },
        error: dbError instanceof Error ? dbError.message : "Unknown database error",
      })
    }

    // Create JWT token
    try {
      const token = await createPremiumToken(senderAddress, expiresAt)

      // Set cookie with JWT token
      cookies().set({
        name: "premium_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: expiresAt,
        path: "/",
      })
    } catch (tokenError) {
      console.error("Token creation error:", tokenError)
      // Continue even if token creation fails, as we've already saved to the database
    }

    return NextResponse.json({
      success: true,
      message: "Premium activated successfully",
      premium: {
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Emergency activation error:", error)
    return NextResponse.json(
      {
        error: "Verification failed. Please try again or contact support.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

