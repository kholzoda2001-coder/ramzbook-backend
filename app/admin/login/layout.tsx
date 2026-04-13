import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login — Ramz Dashboard',
  description: 'Secure access for authorized personnel only.',
};

/**
 * This layout intentionally does NOT wrap children with AdminShell.
 * It overrides the parent /admin/layout.tsx so the login page gets
 * a clean, full-screen layout without sidebar or header.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
