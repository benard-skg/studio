
"use client";

import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/navbar'; // Import Navbar
import Footer from '@/components/layout/footer';   // Import Footer


export default function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        // Store the current path to redirect back after login
        const redirectUrl = encodeURIComponent(pathname);
        router.replace(`/signin?redirect_url=${redirectUrl}`);
      }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
      // Display a full-page loader or a simpler loading state
      return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Navbar /> {/* Include Navbar here */}
          <main className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
          </main>
          <Footer /> {/* Include Footer here */}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuthComponent.displayName = `WithAuth(${displayName})`;

  return WithAuthComponent;
}
