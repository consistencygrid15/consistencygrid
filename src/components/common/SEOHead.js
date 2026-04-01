/**
 * SEO Head Component
 * Inject metadata, structured data, and canonical tags
 */

import Head from 'next/head';

export function SEOHead({ metadata = {}, structuredData = null }) {
  const {
    title = 'ConsistencyGrid',
    description = 'Track habits, achieve goals, and visualize your life progress.',
    image = '/og-image.png',
    url = 'https://consistencygrid.com',
    type = 'website',
    keywords = '',
    canonical = url,
    robots = 'index, follow',
  } = metadata;

  const fullTitle = title === 'ConsistencyGrid' ? title : `${title} | ConsistencyGrid`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robots} />
      <meta name="language" content="en" />
      <meta name="author" content="ConsistencyGrid" />

      {/* Canonical Tag */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ConsistencyGrid" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@consistencygrid" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#fb923c" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ConsistencyGrid" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch for external services */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </Head>
  );
}

export default SEOHead;
