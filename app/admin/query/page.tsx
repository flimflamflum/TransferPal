"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Play, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function QueryTool() {
  const [query, setQuery] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/direct-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Query execution failed")
      }

      setResult(data.result)
      toast({
        title: "Query executed",
        description: `Returned ${data.rowCount} rows`,
      })
    } catch (err) {
      console.error("Query error:", err)
      setError(err instanceof Error ? err.message : String(err))
      toast({
        title: "Query failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">SQL Query Tool</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Execute SQL Query</CardTitle>
          <CardDescription>Run SQL queries directly against the database</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter SQL query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setQuery("")}>
            Clear
          </Button>
          <Button onClick={executeQuery} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Execute
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>
              {result.length} {result.length === 1 ? "row" : "rows"} returned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {result.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {Object.keys(result[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {result.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value: any, valueIndex: number) => (
                          <td
                            key={valueIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                          >
                            {value === null
                              ? "null"
                              : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No results returned</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  )
}

