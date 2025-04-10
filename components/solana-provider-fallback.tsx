"use client"

// This is a fallback implementation for the makePremiumPayment function
// in case the direct signAndSendTransaction method doesn't work

import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { toast } from "react-hot-toast"
import { usePremium } from "../contexts/premium-context"
import { SOLANA_CONFIG } from "../utils/config"

const makePremiumPaymentFallback = async (): Promise<boolean> => {
  console.log("Using fallback payment method")

  const { wallet, publicKey } = useWallet()
  const { setPaymentProcessing } = usePremium()

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
    console.log(`Creating transaction for ${SOLANA_CONFIG.PREMIUM_PRICE} lamports...`)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: SOLANA_CONFIG.PREMIUM_PRICE,
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
        amount: SOLANA_CONFIG.PREMIUM_PRICE,
        status: "pending",
        metadata: JSON.stringify({
          type: "premium_upgrade",
          duration: `${SOLANA_CONFIG.PREMIUM_DURATION_DAYS} days`,
        }),
      }),
    })

    // FALLBACK METHOD: First sign, then send
    console.log("Requesting wallet to sign transaction...")
    try {
      // 1. Sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction)

      // 2. Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      console.log(`Transaction sent with signature: ${signature}`)

      toast({
        title: "Transaction Sent",
        description: "Your payment is being processed...",
      })

      // Rest of the confirmation and verification code...
      // (Same as in the original implementation)

      return true
    } catch (error) {
      console.error("Transaction signing error:", error)
      toast({
        title: "Transaction Cancelled",
        description: "You cancelled the transaction in your wallet.",
        variant: "destructive",
      })
      return false
    }
  } catch (error) {
    console.error("Payment error:", error)
    toast({
      title: "Payment Failed",
      description: "An unexpected error occurred. Please try again later.",
      variant: "destructive",
    })
    return false
  } finally {
    setPaymentProcessing(false)
  }
}

