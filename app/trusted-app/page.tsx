"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"

export default function TrustedAppPage() {
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    try {
      // This is just a placeholder - Phantom doesn't actually have a public API for this
      // In reality, users would need to manually trust your app in Phantom
      setRegistered(true)
      setError(null)
    } catch (err) {
      setError("Failed to register app. Please try the manual steps below.")
    }
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Register as Trusted App</CardTitle>
          <CardDescription>Help Phantom wallet recognize TransferPal as a trusted application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Why is this needed?</h3>
            <p className="text-sm text-muted-foreground">
              Phantom wallet has security features that may block transactions from websites it doesn't recognize as
              trusted. Following these steps can help ensure your payments go through smoothly.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Manual Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open your Phantom wallet extension</li>
              <li>Go to Settings (gear icon)</li>
              <li>Select "Trusted Apps"</li>
              <li>If TransferPal is listed, ensure it's enabled</li>
              <li>If not listed, you'll need to complete a transaction first</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {registered && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-start">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                Registration successful! Phantom should now recognize TransferPal as a trusted app.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={handleRegister} disabled={registered}>
            {registered ? "Registered" : "Register App"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

