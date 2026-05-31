export const metadata = {
  title: 'Privacy Policy — RAMZ',
  description: 'Privacy Policy for the RAMZ language-learning app.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Privacy Policy</h1>
      <p className="mb-6 text-[var(--text-secondary)]">Effective date: 31 May 2026</p>

      <div className="space-y-6 text-[var(--text-secondary)]">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">1. Introduction</h2>
          <p>RAMZ is a language-learning app. We respect your privacy. This policy explains what data we collect and how we use it.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">2. Information We Collect</h2>
          <p>Account data: your name and email address or phone number (used to sign in). Learning data: your progress, XP, hearts, streak and lesson results. Microphone: used only during speaking practice — audio is processed on the device and is not stored on our servers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">3. How We Use Your Information</h2>
          <p>To deliver lessons, save your progress, personalize learning, and provide support. We do not sell your personal data.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">4. Third-Party Services</h2>
          <p>Google Play Billing (to process subscriptions and payments) and Google Text-to-Speech / Speech-to-Text (for pronunciation and speaking practice). These services have their own privacy policies.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">5. Data Retention & Security</h2>
          <p>Data is stored on secure servers and transmitted over encrypted (HTTPS) connections. We use reasonable safeguards to protect your information.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">6. Account & Data Deletion</h2>
          <p>You can permanently delete your account and all associated data in the app: Profile → Account → “Delete account”. You can also request deletion by emailing help@ramz.tj; we will delete your data within 30 days.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">7. Children</h2>
          <p>The app is not intended for users under the age of 13.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">8. Changes</h2>
          <p>We may update this policy from time to time. Significant changes will be announced in the app.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">9. Contact Us</h2>
          <p>Email: help@ramz.tj<br />WhatsApp: +971 50 838 5259</p>
        </section>
      </div>
    </div>
  );
}
