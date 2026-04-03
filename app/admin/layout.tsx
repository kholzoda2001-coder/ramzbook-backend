import type { Metadata } from 'next';
import AdminShell from './_components/AdminShell';

export const metadata: Metadata = {
  title: 'Ramz Admin Dashboard',
  description: 'Admin control panel for the Ramz Super-App.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
