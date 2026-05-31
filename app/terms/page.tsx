export const metadata = {
  title: 'Terms of Use — RAMZ',
  description: 'Terms of Use for the RAMZ language-learning app.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Terms of Use</h1>
      <p className="mb-6 text-[var(--text-secondary)]">Effective date: 31 May 2026</p>

      <div className="space-y-6 text-[var(--text-secondary)]">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">1. Acceptance</h2>
          <p>By using RAMZ you agree to these terms. If you do not agree, please do not use the app.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">2. Your Account</h2>
          <p>You are responsible for keeping your sign-in details private and for activity on your account. Please provide accurate information.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">3. Subscriptions & Payments</h2>
          <p>Premium subscriptions are processed through Google Play. Prices are shown in Google Play. Any free trial converts to a paid subscription after 7 days unless cancelled. Subscriptions renew automatically; you can cancel anytime in your Google Play settings.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">4. Acceptable Use</h2>
          <p>You may not use the app for unlawful purposes, attempt to disrupt it, or copy its content.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">5. Intellectual Property</h2>
          <p>All content (lessons, texts, design) belongs to RAMZ and is protected.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">6. Disclaimer</h2>
          <p>The app is provided “as is”. We do not guarantee specific learning outcomes, though we strive for high quality.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">7. Changes</h2>
          <p>We may update these terms. Continued use means you accept the changes.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">8. Contact</h2>
          <p>Email: help@ramz.tj<br />WhatsApp: +971 50 838 5259</p>
        </section>
      </div>
    </div>
  );
}
