
import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { StructuredData } from "@/components/StructuredData";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Resume Tracker - Land More Interviews",
  description: "Parse jobs from emails, tailor your resume in seconds, prepare with smart questions, and negotiate your offer—all in one place.",
  keywords: ["resume tracker", "job application tracker", "AI resume", "interview preparation", "job search"],
  authors: [{ name: "Prithwish Karmakar" }],
  creator: "Prithwish Karmakar",
  publisher: "AI Resume Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ai-resume-tracker-lake.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-resume-tracker-lake.vercel.app',
    siteName: 'AI Resume Tracker',
    title: 'AI Resume Tracker - Land More Interviews',
    description: 'Parse jobs from emails, tailor your resume in seconds, prepare with smart questions, and negotiate your offer—all in one place.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AI Resume Tracker - Land more interviews with an AI-powered job tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Tracker - Land More Interviews',
    description: 'Parse jobs from emails, tailor your resume in seconds, prepare with smart questions, and negotiate your offer—all in one place.',
    images: ['/api/og'],
    creator: '@prithwish_rgb',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>  
          <ErrorBoundary>
            <Navbar />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 sm:pt-24 md:pt-28 min-h-screen">
              {children}
            </main>
          </ErrorBoundary>
        </Providers>

      </body>
    </html>
  );
}
