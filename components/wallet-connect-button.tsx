"use client"

import { Button } from "@/components/ui/button"
import { useSolana } from "./solana-provider"
import { Wallet, Loader2, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface WalletConnectButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function WalletConnectButton({
  className = "",
  variant = "default",
  size = "default",
}: WalletConnectButtonProps) {
  const { connected, connecting, connectWallet, disconnectWallet, publicKey } = useSolana()

  const handleConnect = async () => {
    await connectWallet()
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
  }

  // Format the public key for display
  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  // Apply the purple gradient for non-connected state
  const buttonClass = connected
    ? className
    : `bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white ${className}`

  if (connecting) {
    return (
      <Button className={buttonClass} variant={variant} size={size} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={className} variant={variant} size={size}>
            <Wallet className="mr-2 h-4 w-4" />
            {publicKey ? formatPublicKey(publicKey.toString()) : "Connected"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={handleConnect} className={buttonClass} variant={variant} size={size}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}

