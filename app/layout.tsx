import type { Metadata } from 'next';
export const metadata = { title: 'Advi Command Center', description: 'Studio Management Platform' };
export default function RootLayout({ children }) {
  return <html lang="en"><body style={{ margin: 0, backgroundColor: '#0a0a0a' }}>{children}</body></html>;
}