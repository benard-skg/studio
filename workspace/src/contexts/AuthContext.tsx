
"use client";

import type { User } from 'firebase/auth';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Keep imports
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // REMOVED: router, pathname, searchParams from top-level scope
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // ACQUIRE hooks here, inside the client-triggered function
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      toast({
        title: "Signed In Successfully!",
        description: `Welcome, ${result.user.displayName || 'User'}!`,
      });
      const redirectUrl = searchParams.get('redirect_url');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (pathname === '/signin') {
        router.push('/admin');
      }
      // If not on signin page and no redirect_url, stay on current page
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    // ACQUIRE router here
    const router = useRouter();
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/'); // Redirect to homepage after sign out
    } catch (error: any) {
      console.error("Error signing out:", error);
       toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message || "Could not sign out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
