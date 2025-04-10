import { SignJWT, jwtVerify } from "jose"

// This should be a secure environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long-here")

export interface JWTPayload {
  sub: string // wallet address
  iat: number // issued at
  exp: number // expiration
  premiumUntil: number // premium expiration timestamp
}

// Create a JWT token for premium users
export async function createPremiumToken(walletAddress: string, expiresAt: Date): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = Math.floor(expiresAt.getTime() / 1000) // Token expires when premium expires

  return new SignJWT({
    premiumUntil: exp,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(walletAddress)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(JWT_SECRET)
}

// Verify a JWT token
export async function verifyPremiumToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

