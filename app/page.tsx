/**
 * app/page.tsx
 *
 * The root page simply redirects to the existing HTML file
 * served from /public/advi-preview.html
 *
 * The HTML file remains 100% unchanged — this is purely a redirect.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/advi-preview.html');
}
