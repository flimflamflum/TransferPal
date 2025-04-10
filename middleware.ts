import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// JWT secret for admin token
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long-here")

export async function middleware(request: NextRequest) {
  // Check if the request is for an admin page (except login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.includes("/admin/login") &&
    !request.nextUrl.pathname.includes("/_next")
  ) {
    const adminToken = request.cookies.get("admin_token")?.value

    if (!adminToken) {
      // Redirect to admin login
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      // Verify the token
      await jwtVerify(adminToken, JWT_SECRET)
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

// Update the matcher to only match admin routes
export const config = {
  matcher: ["/admin/:path*"],
}

