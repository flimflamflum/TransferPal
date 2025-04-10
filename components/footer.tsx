import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <span>© {new Date().getFullYear()} TransferPal</span>
        </div>
      </div>
    </footer>
  )
}

