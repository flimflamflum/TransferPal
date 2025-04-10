"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runCleanup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cleanup")

      if (!response.ok) {
        throw new Error("Cleanup failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error running cleanup:", err)
      setError("Failed to run cleanup. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>File Cleanup</CardTitle>
          <CardDescription>Manually clean up expired files from storage and database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will permanently delete all expired files from both Blob storage and the database. This action cannot
            be undone.
          </p>

          {result && (
            <div className="mt-4 p-4 bg-slate-50 rounded-md">
              <h3 className="font-medium mb-2">Cleanup Results:</h3>
              <p>{result.message}</p>

              {result.results && result.results.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-1">Files processed:</h4>
                  <ul className="text-sm space-y-1">
                    {result.results.map((item: any, index: number) => (
                      <li key={index} className="flex items-center">
                        {item.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        {item.fileName} (ID: {item.id})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button onClick={runCleanup} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Cleanup...
              </>
            ) : (
              "Run Cleanup Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

