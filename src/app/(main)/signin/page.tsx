
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect_url');
      router.push(redirectUrl || '/admin'); // Default to /admin if no redirect_url
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading || (!authLoading && user)) {
    // Show loader while checking auth state or if user is already logged in and redirecting
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl border-border">
          <CardHeader className="text-center">
            <LogIn className="mx-auto h-10 w-10 text-accent mb-3" />
            <CardTitle className="font-headline text-2xl font-bold tracking-tight">Sign In</CardTitle>
            <CardDescription className="font-body">
              Access your account or protected content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By signing in, you agree to our (non-existent yet) Terms of Service and Privacy Policy.
            </p>
             <div className="text-center mt-4">
                <Link href="/" className="text-sm font-body text-accent hover:underline">
                    Back to Home
                </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
