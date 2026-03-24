'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import RouteGuard from '@/components/RouteGuard';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const SITE_URL = 'https://www.webdevcodes.xyz';
const SITE_NAME = 'WebDev Codes';
const SITE_DESC = 'Learn web development with expert-led courses, tutorials, and hands-on projects. Master HTML, CSS, JavaScript, React, Next.js and more at WebDev Codes.';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description: SITE_DESC,
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/courses?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();

  // Hide main site chrome on admin/teacher panel routes
  const isPanelRoute = pathname.startsWith('/admin') || 
    (pathname.startsWith('/teacher/') && !pathname.startsWith('/teacher-'));

  useEffect(() => {
    if (isActive) {
      document.body.classList.add('active');
    } else {
      document.body.classList.remove('active');
    }
  }, [isActive]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1200) {
        setIsActive(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>{SITE_NAME} – Learn Web Development Online</title>
        <meta name="description" content={SITE_DESC} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={`${SITE_NAME} – Learn Web Development Online`} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/images/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${SITE_NAME} – Learn Web Development Online`} />
        <meta name="twitter:description" content={SITE_DESC} />
        <meta name="twitter:image" content={`${SITE_URL}/images/og-image.png`} />

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />

        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <RouteGuard>
              {!isPanelRoute && (
                <>
                  <Header
                    onMenuToggle={() => setIsActive(prev => !prev)}
                  />
                  <Sidebar
                    isActive={isActive}
                    onClose={() => setIsActive(false)}
                  />
                </>
              )}
              <main>
                {children}
              </main>
              {!isPanelRoute && <Footer />}
            </RouteGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
