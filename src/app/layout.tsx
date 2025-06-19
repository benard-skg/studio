
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { Suspense } from 'react'; // Import Suspense
import PageLoader from '@/components/layout/PageLoader'; // Import the PageLoader

export const metadata: Metadata = {
  title: 'Limpopo Chess Academy',
  description: 'Professional chess coaching to help you master strategy and achieve your chess goals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PT Sans is still linked via Google Fonts. Playfair Display is now self-hosted via globals.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* Wrap children with AuthProvider */}
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
