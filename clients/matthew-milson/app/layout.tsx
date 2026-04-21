import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = 'https://matthew-milson.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Matthew Milson — Business Development Representative',
    template: '%s · Matthew Milson',
  },
  description:
    'Matthew Milson — Toronto-based Business Development Representative with 3+ years driving outbound pipeline, closing deals, and generating revenue across insurance, recruiting, and e-commerce.',
  keywords: [
    'Matthew Milson',
    'Business Development Representative',
    'BDR',
    'Sales Development',
    'SDR',
    'Toronto sales',
    'Inside Sales',
    'Outbound Sales',
    'RBC Insurance',
  ],
  authors: [{ name: 'Matthew Milson' }],
  creator: 'Matthew Milson',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Matthew Milson — Business Development Representative',
    description:
      '3+ years driving outbound pipeline and revenue. $1.1M+ in insurance premiums influenced, 1,500+ client territory managed, 15+ daily outbound calls.',
    siteName: 'Matthew Milson',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matthew Milson — Business Development Representative',
    description:
      '3+ years driving outbound pipeline and revenue across insurance, recruiting, and e-commerce.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Matthew Milson',
  jobTitle: 'Business Development Representative',
  email: 'mailto:matthewmilson55@gmail.com',
  telephone: '+1-647-532-6010',
  url: siteUrl,
  sameAs: ['https://www.linkedin.com/in/matthewmilson/'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Toronto',
    addressRegion: 'ON',
    addressCountry: 'CA',
  },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Centennial College' },
    { '@type': 'CollegeOrUniversity', name: 'Ivey Business School' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
