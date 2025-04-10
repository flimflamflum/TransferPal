// This is a script you can run with Node.js to generate PNG favicons
// You would run: node scripts/generate-favicon.js

import fs from "fs"
import { createCanvas } from "canvas"

// Sizes for different devices and purposes
const sizes = [16, 32, 48, 64, 72, 96, 128, 144, 152, 192, 384, 512]

// Create the favicon for each size
sizes.forEach((size) => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#3b82f6" // Primary blue color
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2) // Rounded corners
  ctx.fill()

  // Letter T
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${size * 0.7}px Arial, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("T", size / 2, size / 2 + size * 0.05)

  // Save the file
  const buffer = canvas.toBuffer("image/png")
  const dir = `./public/icons`

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(`${dir}/icon-${size}x${size}.png`, buffer)

  // Also save the apple touch icon
  if (size === 180) {
    fs.writeFileSync(`${dir}/apple-touch-icon.png`, buffer)
  }
})

console.log("Favicons generated successfully!")

