import Link from "next/link"

export default function TermsOfService() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Service Description</h2>
        <p className="mb-2">
          TransferPal provides a temporary file sharing service that allows users to upload files and share them via
          self-destructing links. Files are automatically deleted after they reach their specified download limit or
          time expiration, whichever comes first.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. File Storage and Deletion</h2>
        <p className="mb-2">All files uploaded to TransferPal are subject to the following conditions:</p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>Files will be automatically deleted after reaching the user-specified download limit</li>
          <li>All files are subject to a maximum lifetime of 72 hours, regardless of download count</li>
          <li>Once a file is deleted, it cannot be recovered</li>
          <li>We reserve the right to delete any file at any time without notice</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Prohibited Content</h2>
        <p className="mb-2">Users are prohibited from uploading, sharing, or distributing:</p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>Illegal content of any kind</li>
          <li>Malware, viruses, or any harmful software</li>
          <li>Content that infringes on intellectual property rights</li>
          <li>Pornographic or sexually explicit material</li>
          <li>Content that promotes violence, discrimination, or hate speech</li>
          <li>Personal data of others without their consent</li>
        </ul>
        <p className="mb-2">We reserve the right to report illegal activities to appropriate authorities.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
        <p className="mb-2">By using TransferPal, you agree to:</p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>Use the service in compliance with all applicable laws</li>
          <li>Not attempt to circumvent the file expiration mechanisms</li>
          <li>Not use automated tools to upload or download files without our permission</li>
          <li>Secure your shared links, as anyone with the link can access your files</li>
          <li>Accept full responsibility for the content you upload and share</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Service Limitations</h2>
        <p className="text-sm text-muted-foreground">TransferPal has the following limitations:</p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>Maximum file size: 50MB per upload</li>
          <li>Daily upload limit: 50MB per device</li>
          <li>Maximum storage period: 72 hours</li>
          <li>Service availability is not guaranteed and may be interrupted for maintenance</li>
          <li>We do not guarantee the security or privacy of your files beyond our stated measures</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
        <p className="mb-2">
          TransferPal is provided "as is" without warranties of any kind, either express or implied. We do not guarantee
          that:
        </p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>The service will be uninterrupted or error-free</li>
          <li>Files will be stored or transmitted without loss or corruption</li>
          <li>The service will meet your specific requirements</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
        <p className="mb-2">
          TransferPal and its operators shall not be liable for any direct, indirect, incidental, special, or
          consequential damages resulting from:
        </p>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>Use or inability to use the service</li>
          <li>Unauthorized access to or alteration of your files</li>
          <li>Premature deletion or failure to delete files</li>
          <li>Any other matter relating to the service</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
        <p className="mb-2">
          We reserve the right to modify these Terms of Service at any time. Continued use of TransferPal after changes
          constitutes acceptance of the modified terms.
        </p>
      </section>

      <footer className="text-sm text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>Last updated: {new Date().toLocaleDateString()}</span>
          <Link
            href="/admin/login"
            className="text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors text-xs"
            aria-label="Admin"
          >
            •
          </Link>
        </div>
      </footer>
    </main>
  )
}

