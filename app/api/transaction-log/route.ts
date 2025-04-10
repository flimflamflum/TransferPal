import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactionLogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amount, status, metadata } = await request.json()

    if (!walletAddress || !amount || !status) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Generate a temporary signature for pending transactions
    const tempSignature = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Insert transaction log
    await db.insert(transactionLogs).values({
      signature: tempSignature,
      walletAddress,
      amount,
      status,
      timestamp: new Date(),
      metadata: metadata || null,
    })

    return NextResponse.json({
      success: true,
      signature: tempSignature,
    })
  } catch (error) {
    console.error("Transaction log error:", error)
    return NextResponse.json({ error: "Failed to log transaction" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { signature, status, error } = await request.json()

    if (!signature || !status) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Update transaction log
    await db
      .update(transactionLogs)
      .set({
        status,
        metadata: error ? JSON.stringify({ error }) : undefined,
      })
      .where(eq(transactionLogs.signature, signature))

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Transaction log update error:", error)
    return NextResponse.json({ error: "Failed to update transaction log" }, { status: 500 })
  }
}

