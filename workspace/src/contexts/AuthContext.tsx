
"use client";

import type { User } from 'firebase/auth';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
// Removed: import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>; // Returns User or null
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      toast({
        title: "Signed In Successfully!",
        description: `Welcome, ${result.user.displayName || 'User'}!`,
      });
      return result.user; // Return user on success
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
      return null; // Return null on failure
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
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
