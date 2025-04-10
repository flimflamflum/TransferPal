import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import PWARegister from "@/components/pwa-register"
import WelcomePopup from "@/components/welcome-popup"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TransferPal - quick, easy and secure instant file transfers",
  description: "Share files securely with self-destructing links",
  // Add the Google AdSense verification meta tag
  other: {
    "google-adsense-account": "ca-pub-1237004726725642",
  },
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TransferPal",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1237004726725642"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TransferPal" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
      <body className={`${inter.className} dark:bg-slate-900`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <PWAInstallPrompt />
          <PWARegister />
          <WelcomePopup />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'