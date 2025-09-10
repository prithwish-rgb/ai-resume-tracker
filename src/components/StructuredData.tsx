import React from 'react';

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Resume Tracker",
    "description": "Parse jobs from emails, tailor your resume in seconds, prepare with smart questions, and negotiate your offer—all in one place.",
    "url": "https://ai-resume-tracker-lake.vercel.app",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "Prithwish Karmakar"
    },
    "featureList": [
      "Job application tracking",
      "AI-powered resume tailoring", 
      "Interview preparation",
      "Email job parsing",
      "Analytics and insights"
    ],
    "screenshot": "https://ai-resume-tracker-lake.vercel.app/api/og"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
