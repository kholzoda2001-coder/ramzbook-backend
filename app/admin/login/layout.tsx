// This layout intentionally bypasses the parent AdminShell.
// The login page must render standalone (no sidebar, no header).
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
