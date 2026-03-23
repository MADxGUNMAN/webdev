'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import RouteGuard from '@/components/RouteGuard';
import './globals.css';

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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
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
