"use client"

import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { useToast } from "@chakra-ui/react"
import { useState } from "react"

// Define SOLANA_CONFIG, PREMIUM_PRICE, and PREMIUM_DURATION_DAYS (replace with your actual values)
const SOLANA_CONFIG = {
  NETWORK: "devnet", // or "mainnet-beta"
  RECIPIENT_WALLET: "YOUR_RECIPIENT_WALLET_ADDRESS",
  PREMIUM_DURATION_DAYS: 30,
}
const PREMIUM_PRICE = 10000000 // Example: 1 SOL in lamports

// Make a premium payment - updated version with fallback
const makePremiumPayment = async (): Promise<boolean> => {
  console.log("makePremiumPayment called")

  // Use the hooks to get wallet, publicKey, toast, and setPaymentProcessing
  const wallet = useWallet()
  const publicKey = wallet.publicKey
  const toast = useToast()
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  if (!wallet || !publicKey) {
    toast({
      title: "Wallet Not Connected",
      description: "Please connect your wallet to make a payment.",
      variant: "destructive",
    })
    return false
  }

  try {
    setPaymentProcessing(true)
    toast({
      title: "Processing Payment",
      description: "Please confirm the transaction in your wallet.",
    })

    // Connect to the Solana network
    console.log(`Connecting to Solana ${SOLANA_CONFIG.NETWORK} network...`)
    const connection = new Connection(`https://api.${SOLANA_CONFIG.NETWORK}.solana.com`, "confirmed")

    // Create recipient PublicKey from the config string
    const recipientPublicKey = new PublicKey(SOLANA_CONFIG.RECIPIENT_WALLET)
    console.log(`Recipient wallet: ${recipientPublicKey.toString()}`)

    // Create a transaction
    console.log(`Creating transaction for ${PREMIUM_PRICE} lamports...`)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: PREMIUM_PRICE,
      }),
    )

    // Set a recent blockhash
    console.log("Getting recent blockhash...")
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey

    // Log the transaction to the server before sending
    console.log("Logging transaction to server...")
    await fetch("/api/transaction-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress: publicKey.toString(),
        amount: PREMIUM_PRICE,
        status: "pending",
        metadata: JSON.stringify({
          type: "premium_upgrade",
          duration: `${SOLANA_CONFIG.PREMIUM_DURATION_DAYS} days`,
        }),
      }),
    })

    // Try different methods to sign and send the transaction
    let signature: string

    // Method 1: Try direct signAndSendTransaction if available
    if (typeof wallet.signAndSendTransaction === "function") {
      console.log("Using direct signAndSendTransaction method")
      try {
        const result = await wallet.signAndSendTransaction(transaction)
        signature = result.signature
      } catch (error: any) {
        console.error("Error with direct signAndSendTransaction:", error)
        throw error
      }
    }
    // Method 2: Try request method
    else {
      console.log("Using request method")
      try {
        const result = await wallet.request({
          method: "signAndSendTransaction",
          params: {
            message: transaction.serializeMessage(),
          },
        })
        signature = result.signature
      } catch (error: any) {
        console.error("Error with request method:", error)
        throw error
      }
    }

    console.log(`Transaction sent with signature: ${signature}`)

    toast({
      title: "Transaction Sent",
      description: "Your payment is being processed...",
    })

    // Wait for confirmation
    try {
      console.log("Waiting for transaction confirmation...")
      const confirmation = await connection.confirmTransaction(signature, "confirmed")
      console.log("Transaction confirmation received:", confirmation)

      if (confirmation.value.err) {
        console.error("Transaction error:", confirmation.value.err)
        toast({
          title: "Transaction Failed",
          description: "The transaction was not confirmed. Please try again.",
          variant: "destructive",
        })

        // Update transaction log
        await fetch("/api/transaction-log", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signature,
            status: "failed",
            error: JSON.stringify(confirmation.value.err),
          }),
        })

        return false
      }

      // Verify the transaction on the server
      try {
        console.log("Verifying payment on server...")
        const verificationResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signature,
            amount: PREMIUM_PRICE,
            sender: publicKey.toString(),
            recipient: SOLANA_CONFIG.RECIPIENT_WALLET,
          }),
        })

        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json()
          throw new Error(errorData.error || "Payment verification failed")
        }

        const responseData = await verificationResponse.json()
        console.log("Payment verified successfully:", responseData)

        // Update transaction log
        await fetch("/api/transaction-log", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signature,
            status: "confirmed",
          }),
        })

        // Update local premium status
        if (responseData.premium && responseData.premium.expiresAt) {
          // Store premium status in localStorage for client-side checks
          const expiresAt = new Date(responseData.premium.expiresAt).getTime()
          localStorage.setItem(
            "premiumStatus",
            JSON.stringify({
              isPremium: true,
              expiresAt: expiresAt,
            }),
          )
        }

        toast({
          title: "Payment Successful!",
          description: `Your premium upgrade has been activated for ${SOLANA_CONFIG.PREMIUM_DURATION_DAYS} days.`,
        })

        // Refresh the page to update UI
        setTimeout(() => {
          window.location.reload()
        }, 2000)

        return true
      } catch (error: any) {
        console.error("Verification error:", error)
        toast({
          title: "Verification Failed",
          description:
            error instanceof Error ? error.message : "Could not verify your payment. Please contact support.",
          variant: "destructive",
        })
        return false
      }
    } catch (error: any) {
      console.error("Confirmation error:", error)
      toast({
        title: "Verification Failed",
        description: "Could not verify your transaction. Please contact support.",
        variant: "destructive",
      })
      return false
    }
  } catch (error: any) {
    console.error("Transaction signing error:", error)
    toast({
      title: "Transaction Cancelled",
      description: "You cancelled the transaction in your wallet.",
      variant: "destructive",
    })
    return false
    \
  }
  catch (error: any)
  console.error("Payment error:", error)
  toast({
    title: "Payment Failed",
    description: "An unexpected error occurred. Please try again later.",
    variant: "destructive",
  })
  return false
  finally
  setPaymentProcessing(false)
}

