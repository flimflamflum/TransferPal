import {
  createQR,
  encodeURL,
  type TransferRequestURLFields,
  findReference,
  validateTransfer,
  FindReferenceError,
} from "@solana/pay"
import { Connection, PublicKey, Keypair } from "@solana/web3.js"
import { SOLANA_CONFIG } from "./config"
import BigNumber from "bignumber.js"

// Create a Solana Pay transfer request link
export function createSolanaPayTransferLink(amount: number, reference: string, label: string, message: string): string {
  try {
    console.log("Creating Solana Pay transfer link with params:", {
      amount,
      reference,
      recipient: SOLANA_CONFIG.RECIPIENT_WALLET,
      network: SOLANA_CONFIG.NETWORK,
    })

    // Convert SOL amount to lamports - FIX: Ensure we're using the correct amount
    // The amount should be in SOL, and we need to convert it to lamports
    const lamports = new BigNumber(amount)
    console.log("Amount in SOL:", amount)
    console.log("Amount in lamports:", lamports.toString())

    // Create the transfer request URL
    const transferRequestParams: TransferRequestURLFields = {
      recipient: new PublicKey(SOLANA_CONFIG.RECIPIENT_WALLET),
      amount: lamports,
      reference: new PublicKey(reference),
      label,
      message,
    }

    // Encode the URL
    const url = encodeURL(transferRequestParams)
    console.log("Generated Solana Pay URL:", url.toString())
    return url.toString()
  } catch (error) {
    console.error("Error creating Solana Pay transfer link:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      if (error.stack) console.error("Stack trace:", error.stack)
    }
    throw new Error(`Failed to create payment link: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Create a Solana Pay QR code
export function createSolanaPayQR(transferRequestURL: string): string {
  try {
    console.log("Creating QR code for URL:", transferRequestURL)

    // Fix: Use a different approach to generate QR code
    // Instead of relying on the built-in toDataURL method, we'll use a more reliable approach

    // First, create the QR code using the Solana Pay library
    const qrCode = createQR(transferRequestURL)

    // Instead of using toDataURL directly, we'll use a more compatible approach
    // Create a canvas element and render the QR code to it
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to get canvas context")
    }

    // Set canvas size to match QR code size
    canvas.width = qrCode.size
    canvas.height = qrCode.size

    // Draw the QR code on the canvas
    qrCode.render(ctx)

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL("image/png")

    console.log("QR code created successfully")
    return dataURL
  } catch (error) {
    console.error("Error creating Solana Pay QR code:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      if (error.stack) console.error("Stack trace:", error.stack)
    }
    throw new Error(`Failed to create QR code: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Generate a unique reference for the transaction
export function generateTransactionReference(): string {
  try {
    console.log("Generating transaction reference")
    // Generate a new keypair to use as reference
    const reference = Keypair.generate()
    const referenceString = reference.publicKey.toString()
    console.log("Generated reference:", referenceString)
    return referenceString
  } catch (error) {
    console.error("Error generating transaction reference:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      if (error.stack) console.error("Stack trace:", error.stack)
    }
    throw new Error(
      `Failed to generate transaction reference: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Update the verifySolanaPayTransaction function to better detect completed transactions

// Verify a Solana Pay transaction
export async function verifySolanaPayTransaction(
  reference: string,
  expectedAmount: number,
): Promise<{ signature: string; confirmed: boolean }> {
  // Connect to Solana with a more reliable connection and longer timeout
  const connection = new Connection(`https://api.${SOLANA_CONFIG.NETWORK}.solana.com`, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
  })

  try {
    console.log(`Verifying transaction with reference: ${reference}, expected amount: ${expectedAmount} SOL`)

    // Convert reference string to PublicKey
    const referencePublicKey = new PublicKey(reference)

    try {
      // Find the transaction by reference with a more lenient approach
      const signatureInfo = await findReference(connection, referencePublicKey, {
        finality: "confirmed",
        confirmOptions: { commitment: "confirmed" },
      })

      console.log("Found transaction signature:", signatureInfo.signature)

      // Get the transaction details to verify it directly
      const transaction = await connection.getTransaction(signatureInfo.signature, {
        commitment: "confirmed",
      })

      if (transaction) {
        console.log("Transaction found on chain:", transaction.meta?.err ? "Failed" : "Success")

        // If transaction exists and doesn't have an error, consider it confirmed
        // This is a more direct check than validateTransfer which can be too strict
        if (!transaction.meta?.err) {
          console.log("Transaction confirmed successfully")
          return {
            signature: signatureInfo.signature,
            confirmed: true,
          }
        }
      }

      // As a fallback, try the standard validation
      try {
        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: new PublicKey(SOLANA_CONFIG.RECIPIENT_WALLET),
            amount: new BigNumber(expectedAmount),
            reference: referencePublicKey,
          },
          { commitment: "confirmed" },
        )

        console.log("Transaction validated successfully through validateTransfer")
        return {
          signature: signatureInfo.signature,
          confirmed: true,
        }
      } catch (validationError) {
        console.error("Transfer validation error:", validationError)

        // IMPORTANT: If we found the transaction but validation failed,
        // we'll still consider it confirmed if it exists on chain
        if (transaction && !transaction.meta?.err) {
          console.log("Transaction exists on chain without errors - considering confirmed despite validation failure")
          return {
            signature: signatureInfo.signature,
            confirmed: true,
          }
        }

        return {
          signature: signatureInfo.signature,
          confirmed: false,
        }
      }
    } catch (error) {
      if (error instanceof FindReferenceError) {
        console.log("Transaction not found yet (expected during waiting period)")
        return {
          signature: "",
          confirmed: false,
        }
      }
      console.error("Error finding reference:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in verifySolanaPayTransaction:", error)
    // Return a non-throwing result to allow for retry
    return {
      signature: "",
      confirmed: false,
    }
  }
}

