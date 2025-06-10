
"use client";

import { useEffect, useState } from 'react';
import { ChessBoard } from 'kokopu-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentFen, setCurrentFen] = useState(DEFAULT_FEN);

  useEffect(() => {
    setIsMounted(true);
    // You can uncomment the timeout below to test if the board updates with a new FEN after 5 seconds
    // setTimeout(() => {
    //   console.log("[ChessTV] Simulating FEN update for testing");
    //   setCurrentFen("rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2"); // Example: After 1. Nf3 Nf6
    // }, 5000);
  }, []);

  return (
    <section id="chesstv" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-2">
                <Tv className="h-7 w-7 text-accent mr-2" />
                <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
            </div>
            <CardDescription className="font-body text-sm text-center text-muted-foreground">
              {isMounted ? "Displaying Board" : "Loading ChessTV..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div 
              className="aspect-square w-full max-w-[400px] sm:max-w-[480px] md:max-w-[520px] mx-auto my-2 rounded-md overflow-hidden shadow-inner border border-border/50"
              style={{ minHeight: '300px' }} // Explicit min-height
            >
              {isMounted && currentFen ? (
                <ChessBoard fen={currentFen} />
              ) : (
                <Skeleton className="aspect-square w-full h-full" /> 
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              {isMounted && currentFen && <p>Board should be visible above with FEN: {currentFen}</p>}
              {!isMounted && <p>Initializing board...</p>}
              {isMounted && !currentFen && <p>Error: FEN is not available to render board.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
