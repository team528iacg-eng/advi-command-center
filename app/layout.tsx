import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advi Command Center',
  description: 'AI-powered project management for creative studios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
