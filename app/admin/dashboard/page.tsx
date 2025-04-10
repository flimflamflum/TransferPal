"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  BarChart,
  FileText,
  Users,
  HardDrive,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  LogOut,
  RefreshCw,
  Database,
} from "lucide-react"
import { formatBytes } from "@/lib/upload-quota"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DashboardStats {
  totalFiles: number
  activeFiles: number
  totalPremiumUsers: number
  activePremiumUsers: number
  storageUsed: number
  recentUploads: number
  recentSubscriptions: number
  totalRevenue: number
  timestamp: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching admin stats...")
      const response = await fetch("/api/admin/stats")
      console.log("Admin stats response status:", response.status)

      if (response.status === 401) {
        // Unauthorized, redirect to login
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Admin stats data received:", data)

      if (data.error) {
        console.warn("Stats API returned an error:", data.error)
        // Still set the stats if they're provided
        if (data.totalFiles !== undefined) {
          setStats(data)
        } else {
          throw new Error(data.error)
        }
      } else {
        setStats(data)
      }

      // Also fetch debug info
      try {
        console.log("Fetching debug info...")
        const debugResponse = await fetch("/api/admin/debug")
        console.log("Debug response status:", debugResponse.status)

        if (debugResponse.ok) {
          const debugData = await debugResponse.json()
          setDebugInfo(debugData)
          console.log("Debug info received:", debugData)
        }
      } catch (debugError) {
        console.error("Error fetching debug info:", debugError)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError(`Failed to load dashboard statistics: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics. See console for details.",
        variant: "destructive",
      })

      // Set default stats to prevent UI errors
      setStats({
        totalFiles: 0,
        activeFiles: 0,
        totalPremiumUsers: 0,
        activePremiumUsers: 0,
        storageUsed: 0,
        recentUploads: 0,
        recentSubscriptions: 0,
        totalRevenue: 0,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const refreshStats = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshStats} disabled={isRefreshing} className="flex items-center gap-2">
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/query")} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            SQL Query Tool
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
          {error}
          <Button variant="outline" size="sm" onClick={fetchStats} className="ml-4">
            Retry
          </Button>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalFiles.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.activeFiles.toLocaleString() || 0} active files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activePremiumUsers.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.totalPremiumUsers.toLocaleString() || 0} total premium users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(stats?.storageUsed || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {stats?.activeFiles.toLocaleString() || 0} active files
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recentUploads.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Files uploaded in the last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Total revenue: {((stats?.totalRevenue || 0) / 1000000000).toFixed(4)} SOL
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mr-2" />
                  <span>Revenue chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.recentSubscriptions.toLocaleString() || 0}</div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">New premium users</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">{((stats?.recentSubscriptions || 0) * 0.01).toFixed(2)} SOL revenue</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Management</CardTitle>
              <CardDescription>View and manage all files in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Files Overview</h3>
                  <Button variant="outline" size="sm" onClick={refreshStats}>
                    Refresh
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Database Information:</p>
                  <p>Total Files: {stats?.totalFiles || 0}</p>
                  <p>Active Files: {stats?.activeFiles || 0}</p>
                  <p>Storage Used: {formatBytes(stats?.storageUsed || 0)}</p>
                  <p>Last Updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : "Unknown"}</p>
                </div>

                {debugInfo && debugInfo.filesSample && debugInfo.filesSample.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Sample Files:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {Object.keys(debugInfo.filesSample[0]).map((key) => (
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
                          {debugInfo.filesSample.map((file: any, index: number) => (
                            <tr key={index}>
                              {Object.values(file).map((value: any, valueIndex: number) => (
                                <td
                                  key={valueIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                                >
                                  {value === null ? "null" : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {debugInfo && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <div className="space-y-2 text-sm">
                <p>Tables found: {debugInfo.tables?.length || 0}</p>
                <p>Files columns: {debugInfo.filesColumns?.length || 0}</p>
                <p>Files sample count: {debugInfo.filesSample?.length || 0}</p>
                <p>Direct query count: {debugInfo.directQueryResultCount || 0}</p>
                <p>Debug timestamp: {new Date(debugInfo.timestamp).toLocaleString()}</p>

                {debugInfo.error && (
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded">
                    Error: {debugInfo.error}
                    {debugInfo.errorDetails && <p>{debugInfo.errorDetails}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage premium users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue statistics and projections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revenue analytics will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}

