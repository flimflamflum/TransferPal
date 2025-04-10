import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900">
                <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-300" />
              </div>
              <h1 className="text-2xl font-bold">You're Offline</h1>
              <p className="text-muted-foreground">
                It looks like you're not connected to the internet. Some features may not be available.
              </p>
              <div className="pt-4">
                <Link href="/">
                  <Button>
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                TransferPal works best with an internet connection. Please check your connection and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

