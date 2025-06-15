
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LichessTVEmbedSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section id="lichess-tv" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-1">
              <Tv className="h-7 w-7 text-accent mr-2" />
              <CardTitle className="font-headline text-xl font-bold tracking-tighter text-center">Lichess TV</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 bg-card flex justify-center items-center">
            {isMounted ? (
              <iframe
                src="https://lichess.org/tv/frame?theme=brown&bg=dark"
                style={{ width: '100%', maxWidth: '400px', aspectRatio: '10 / 11', border: 'none' }}
                title="Lichess TV Embed"
              ></iframe>
            ) : (
              <Skeleton className="w-full max-w-[400px]" style={{aspectRatio: '10 / 11'}} />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
