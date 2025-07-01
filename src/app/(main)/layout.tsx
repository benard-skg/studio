// src/app/(main)/layout.tsx

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';
import { Suspense } from 'react';
import PageLoader from '@/components/layout/PageLoader';

export default function MainLayout({
  children,
  }: {
    children: React.ReactNode;
    }) {
      return (
          <ThemeProvider
                attribute="class"
                      defaultTheme="dark"
                            enableSystem
                                  disableTransitionOnChange
                                      >
                                            <AuthProvider>
                                                    <Suspense fallback={<PageLoader />}>
                                                              {children}
                                                                      </Suspense>
                                                                              <Toaster />
                                                                                    </AuthProvider>
                                                                                        </ThemeProvider>
                                                                                          );
                                                                                          }
                                                                                          
