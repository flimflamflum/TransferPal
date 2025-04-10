// Solana payment configuration
export const SOLANA_CONFIG = {
  // Your Solana wallet address - make sure this is a valid Solana address
  RECIPIENT_WALLET: "HnxFP5waqiGyRjftZ5CQh1KAjbPDjmB73CRaGT9XHeGE",

  // Price in SOL (0.01 SOL)
  // FIX: Ensure this is defined as a decimal, not in lamports
  PREMIUM_PRICE: 0.01,

  // Premium duration in days
  PREMIUM_DURATION_DAYS: 30,

  // Network to use ('mainnet-beta' for production, 'devnet' for testing)
  NETWORK: "mainnet-beta", // Changed from devnet to mainnet-beta for real transactions
}

