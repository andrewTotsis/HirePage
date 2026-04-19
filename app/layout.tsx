import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = 'https://hirepage.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HirePage — Stand Out. Get Noticed. Get Hired.',
    template: '%s · HirePage',
  },
  description:
    'HirePage turns your resume into a professional personal website that helps recruiters instantly understand your value. Built for students, graduates, and job seekers.',
  keywords: [
    'personal website',
    'resume website',
    'portfolio website',
    'job seeker portfolio',
    'student personal website',
    'career website',
    'graduate portfolio',
    'professional online presence',
    'HirePage',
  ],
  authors: [{ name: 'HirePage' }],
  creator: 'HirePage',
  applicationName: 'HirePage',
  category: 'business',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'HirePage',
    title: 'HirePage — Stand Out. Get Noticed. Get Hired.',
    description:
      'Turn your resume into a professional personal website. Built for students, graduates, and job seekers who want to stand out.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'HirePage — professional personal websites for job seekers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HirePage — Stand Out. Get Noticed. Get Hired.',
    description:
      'Turn your resume into a professional personal website. Built for students, graduates, and job seekers.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded-md"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'HirePage',
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: [],
              description:
                'Professional personal websites for students, graduates, and job seekers.',
            }),
          }}
        />
      </body>
    </html>
  );
}
