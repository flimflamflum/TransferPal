export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Introduction</h2>
        <p className="mb-2">
          This Privacy Policy explains how we collect, use, and share information when you use our self-destructing file
          sharing service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
        <p className="mb-2">When you use our service, we collect:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Files you upload (temporarily stored until expiration)</li>
          <li>Basic file metadata (name, size, type)</li>
          <li>IP addresses and access logs</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
        <p className="mb-2">We use this information to:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Provide the file sharing service</li>
          <li>Enforce file expiration policies</li>
          <li>Improve our service</li>
          <li>Prevent abuse</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Advertising</h2>
        <p className="mb-2">
          We use Google AdSense to display advertisements on our service. Google AdSense may use cookies and web beacons
          to collect information about your visits to this and other websites to provide targeted advertisements.
        </p>
        <p className="mb-2">
          Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site
          and/or other sites on the Internet.
        </p>
        <p className="mb-2">
          You can opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline dark:text-blue-400">
            Google Ads Settings
          </a>
          .
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
        <p className="mb-2">
          Files are automatically deleted after they reach their download limit or time expiration. We do not keep
          permanent copies of your uploaded files.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
        <p className="mb-2">
          If you have any questions about this Privacy Policy, please contact us at:{" "}
          <a href="mailto:transferpalpro@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
            transferpalpro@gmail.com
          </a>
        </p>
      </section>

      <footer className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</footer>
    </main>
  )
}

