import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  fileKey: text("file_key").notNull().unique(), // Vercel Blob key
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),

  // Unique ID for the download URL
  shareId: text("share_id").notNull().unique(),

  // Expiration settings
  expiryType: text("expiry_type").notNull(), // 'downloads' or 'time'
  downloadLimit: integer("download_limit"),
  timeLimit: integer("time_limit"), // in hours
  expiresAt: timestamp("expires_at"),

  // Tracking
  downloadCount: integer("download_count").default(0).notNull(),
  isExpired: boolean("is_expired").default(false).notNull(),
})

// New table for premium users
export const premiumUsers = pgTable("premium_users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  transactionSignature: text("transaction_signature").notNull().unique(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  amount: integer("amount").notNull(), // in lamports
})

// Table for transaction logs
export const transactionLogs = pgTable("transaction_logs", {
  id: serial("id").primaryKey(),
  signature: text("signature").notNull().unique(),
  walletAddress: text("wallet_address").notNull(),
  amount: integer("amount").notNull(), // in lamports
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: text("metadata"), // JSON string with additional data
})

