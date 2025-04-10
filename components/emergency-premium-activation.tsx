"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { SOLANA_CONFIG } from "@/lib/config"

export default function EmergencyPremiumActivation({ onSuccess }: { onSuccess: () => void }) {
  const [signature, setSignature] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    if (!signature.trim()) {
      toast({
        title: "Error",
        description: "Please enter your transaction signature",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Verify the transaction with the server
      const response = await fetch("/api/emergency-activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: signature.trim(),
          recipient: SOLANA_CONFIG.RECIPIENT_WALLET,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)

        // Check if this is a local-only activation due to database issues
        if (data.localOnly) {
          toast({
            title: "Premium Partially Activated",
            description:
              "Your payment was verified, but there was an issue saving to our database. Premium features are activated on this device.",
          })
        } else {
          toast({
            title: "Premium Activated!",
            description: `Your premium status has been activated until ${new Date(data.premium.expiresAt).toLocaleDateString()}`,
          })
        }

        // Store in localStorage regardless of server-side success
        localStorage.setItem(
          "premiumStatus",
          JSON.stringify({
            isPremium: true,
            expiresAt: new Date(data.premium.expiresAt).getTime(),
          }),
        )

        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        // If server verification fails, show the specific error
        setError(data.error || "Verification failed. Please ensure you've entered a valid transaction signature.")
        toast({
          title: "Verification Failed",
          description: data.error || "Could not verify your payment. Please check the signature and try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error activating premium:", err)
      setError("Failed to verify payment. Please try again or contact support.")
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-xl font-bold">Premium Activated!</h2>
            <p className="text-muted-foreground">
              Your premium upgrade has been activated for {SOLANA_CONFIG.PREMIUM_DURATION_DAYS} days.
            </p>
            <Button onClick={onSuccess}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Payment</CardTitle>
        <CardDescription>Enter your transaction signature to activate premium</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="signature" className="text-sm font-medium">
              Transaction Signature
            </label>
            <Input
              id="signature"
              placeholder="Enter your Solana transaction signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You can find this in your wallet transaction history. It should look like: "5UYkBtRBMX..."
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onSuccess()}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Payment"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Having trouble? Make sure you've entered the correct transaction signature. Only transactions that sent{" "}
            {SOLANA_CONFIG.PREMIUM_PRICE} SOL to our wallet will be accepted.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

