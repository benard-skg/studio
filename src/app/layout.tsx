// src/app/layout.tsx

import './globals.css';

export default function RootLayout({
  children,
  }: {
    children: React.ReactNode;
    }) {
      return (
          <html lang="en" suppressHydrationWarning>
                <head>
                        {/* PT Sans is still linked via Google Fonts. Playfair Display is now self-hosted via globals.css */}
                                <link rel="preconnect" href="https://fonts.googleapis.com" />
                                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                                                <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
                                                      </head>
                                                            <body className="font-body antialiased">
                                                                    {children}
                                                                          </body>
                                                                              </html>
                                                                                );
                                                                                }
