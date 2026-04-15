export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">Privacy Policy</h1>
      <p className="mb-4 text-[var(--text-secondary)]">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-[var(--text-secondary)]">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">1. Introduction</h2>
          <p>Welcome to RamzBook. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">2. Information We Collect</h2>
          <p>We automatically collect certain information when you visit, use, or navigate the App. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our App, and other technical information.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">3. How We Use Your Information</h2>
          <p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">4. Sharing Your Information</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">5. Security of Your Information</h2>
          <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">6. Changes to this Privacy Notice</h2>
          <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">7. Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us or contact us via our official support channels provided in the app.</p>
        </section>
      </div>
    </div>
  );
}
