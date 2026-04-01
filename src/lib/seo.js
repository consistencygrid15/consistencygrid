/**
 * SEO Utilities
 * Metadata generation for all pages
 */

export const seoDefaults = {
  siteName: 'ConsistencyGrid',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://consistencygrid.com',
  description: 'Track habits, achieve goals, and visualize your life progress with ConsistencyGrid. Build consistency one day at a time.',
  image: '/og-image.png',
  twitterHandle: '@consistencygrid',
  locale: 'en_US',
};

export const generateMetadata = (options = {}) => {
  const {
    title = 'ConsistencyGrid',
    description = seoDefaults.description,
    image = seoDefaults.image,
    url = seoDefaults.baseUrl,
    type = 'website',
    author = 'ConsistencyGrid',
    keywords = 'habits, goals, tracking, consistency, productivity, wallpaper, life tracking',
  } = options;

  const fullTitle = title === 'ConsistencyGrid' ? title : `${title} | ConsistencyGrid`;

  return {
    title: fullTitle,
    description,
    keywords,
    author,
    viewport: 'width=device-width, initial-scale=1.0',
    robots: 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: seoDefaults.siteName,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type,
      locale: seoDefaults.locale,
    },
    twitter: {
      card: 'summary_large_image',
      site: seoDefaults.twitterHandle,
      title: fullTitle,
      description,
      images: [image],
    },
    canonical: url,
  };
};

export const pageMetadata = {
  home: {
    title: 'ConsistencyGrid - Track Habits & Achieve Goals',
    description: 'Build lasting habits, track progress, and achieve your life goals. Get beautiful wallpapers that show your life progression.',
    keywords: 'habit tracker, goal setting, consistency, productivity, life tracking, wallpaper generator',
    type: 'website',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Your personal dashboard to track habits, goals, and reminders all in one place.',
    keywords: 'dashboard, tracking, habits, goals, reminders',
    type: 'website',
  },
  analytics: {
    title: 'Analytics - Track Your Progress',
    description: 'View detailed analytics about your consistency score, streaks, and life progress.',
    keywords: 'analytics, consistency score, streaks, progress tracking',
    type: 'website',
  },
  habits: {
    title: 'Habits - Build Consistency',
    description: 'Track your daily habits and build lasting routines. Monitor your streaks and progress.',
    keywords: 'habit tracking, daily habits, streaks, routines',
    type: 'website',
  },
  goals: {
    title: 'Goals - Achieve Your Dreams',
    description: 'Set, track, and achieve your life goals. Break them down into manageable subgoals.',
    keywords: 'goal setting, goal tracking, life goals, subgoals',
    type: 'website',
  },
  reminders: {
    title: 'Reminders - Never Miss Important Events',
    description: 'Create flexible reminders for important events and dates. Visual markers on your calendar.',
    keywords: 'reminders, calendar events, scheduling, notifications',
    type: 'website',
  },
  settings: {
    title: 'Settings - Customize Your Experience',
    description: 'Personalize ConsistencyGrid with custom wallpapers, themes, and preferences.',
    keywords: 'settings, customization, preferences, wallpaper',
    type: 'website',
  },
  login: {
    title: 'Login - ConsistencyGrid',
    description: 'Sign in to your ConsistencyGrid account to track habits and achieve goals.',
    keywords: 'login, sign in, authentication',
    type: 'website',
  },
  signup: {
    title: 'Sign Up - ConsistencyGrid',
    description: 'Create a free ConsistencyGrid account to start tracking habits and achieving goals.',
    keywords: 'signup, register, create account',
    type: 'website',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how ConsistencyGrid protects and manages your personal data.',
    keywords: 'privacy, data protection, GDPR',
    type: 'website',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Read the terms and conditions for using ConsistencyGrid.',
    keywords: 'terms, conditions, legal',
    type: 'website',
  },
};

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ConsistencyGrid',
    url: seoDefaults.baseUrl,
    logo: `${seoDefaults.baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/consistencygrid',
      'https://github.com/consistencygrid',
    ],
    description: seoDefaults.description,
  },

  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ConsistencyGrid',
    description: seoDefaults.description,
    url: seoDefaults.baseUrl,
    applicationCategory: 'ProductivityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    operatingSystem: 'Android, iOS, Windows, macOS, Linux',
  },

  faqs: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ConsistencyGrid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ConsistencyGrid is a habit and goal tracking app that helps you build consistency and achieve your life goals. It includes features for tracking daily habits, managing goals, setting reminders, and generating personalized wallpapers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ConsistencyGrid free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, ConsistencyGrid is completely free to use.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use ConsistencyGrid on mobile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, ConsistencyGrid is optimized for mobile devices and works great as a web app or Android app.',
        },
      },
    ],
  },
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbs = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${seoDefaults.baseUrl}${item.url}`,
    })),
  };
};

/**
 * Generate article structured data
 */
export const generateArticle = (options = {}) => {
  const {
    title,
    description,
    image,
    author = 'ConsistencyGrid',
    datePublished = new Date().toISOString(),
    dateModified = new Date().toISOString(),
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    author: {
      '@type': 'Organization',
      name: author,
    },
    datePublished,
    dateModified,
  };
};
