"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { PublicKey } from "@solana/web3.js"
import { toast } from "@/components/ui/use-toast"

// Define the Phantom provider interface with additional connect methods
interface PhantomProvider {
  publicKey: PublicKey | null
  isConnected: boolean | null
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: string, callback: () => void) => void
  request: (method: any, params: any) => Promise<any>
}

// Define the Solana context interface
interface SolanaContextType {
  wallet: PhantomProvider | null
  connected: boolean
  publicKey: PublicKey | null
  connecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

// Create the Solana context
const SolanaContext = createContext<SolanaContextType>({
  wallet: null,
  connected: false,
  publicKey: null,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
})

// Hook to use the Solana context
export const useSolana = () => useContext(SolanaContext)

// The Solana provider component
export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Initialize the wallet
  useEffect(() => {
    const getProvider = () => {
      if (typeof window !== "undefined") {
        if ("phantom" in window) {
          const provider = (window as any).phantom?.solana
          if (provider?.isPhantom) {
            return provider
          }
        }
      }
      return null
    }

    const provider = getProvider()
    if (provider) setWallet(provider)

    // Check if already connected
    const checkConnection = async () => {
      if (provider && provider.isConnected) {
        try {
          const response = await provider.connect({ onlyIfTrusted: true })
          setPublicKey(response.publicKey)
          setConnected(true)
        } catch (error) {
          // Handle connection error
          console.error("Auto-connect error:", error)
        }
      }
    }

    checkConnection()

    // Listen for connection events
    if (provider) {
      provider.on("connect", () => {
        if (provider.publicKey) {
          setPublicKey(provider.publicKey)
          setConnected(true)
        }
      })

      provider.on("disconnect", () => {
        setPublicKey(null)
        setConnected(false)
      })
    }

    return () => {
      // Clean up event listeners if needed
    }
  }, [])

  // Connect to the wallet
  const connectWallet = async () => {
    if (!wallet) {
      window.open("https://phantom.app/", "_blank")
      return
    }

    try {
      setConnecting(true)
      const response = await wallet.connect()
      setPublicKey(response.publicKey)
      setConnected(true)
      toast({
        title: "Wallet Connected",
        description: "Your Phantom wallet has been connected successfully.",
      })
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect from the wallet
  const disconnectWallet = async () => {
    if (wallet) {
      try {
        await wallet.disconnect()
        setPublicKey(null)
        setConnected(false)

        // Clear any wallet-related data from localStorage
        if (typeof window !== "undefined") {
          // Remove premium status that might be tied to this wallet
          localStorage.removeItem("premiumStatus")

          // Remove any other wallet-related data
          localStorage.removeItem("walletConnected")
        }

        // Clear premium cookie via API
        try {
          await fetch("/api/premium/status", {
            method: "DELETE",
          })
        } catch (error) {
          console.error("Error clearing premium cookie:", error)
        }

        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
        })
      } catch (error) {
        console.error("Disconnect error:", error)
        toast({
          title: "Disconnect Failed",
          description: "Failed to disconnect your wallet. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Update the context provider to remove the direct payment method
  return (
    <SolanaContext.Provider
      value={{
        wallet,
        connected,
        publicKey,
        connecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </SolanaContext.Provider>
  )
}

