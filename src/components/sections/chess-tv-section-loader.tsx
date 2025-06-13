// This component appears to be unused.
// LichessTVEmbedSection is used for displaying Lichess TV.
// This file can be safely removed if not used elsewhere.
"use client";

import { useEffect, useState, useRef } from 'react';
// import { Chessboard } from 'react-chessboard'; // Not used if Skeleton is primary
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSectionLoader() { // Renamed component
  const [isMounted, setIsMounted] = useState(false);
  // const [position, setPosition] = useState(DEFAULT_FEN); // Not used if Skeleton is primary
  // const [boardWidth, setBoardWidth] = useState(0); // Not used if Skeleton is primary
  const [statusMessage, setStatusMessage] = useState("Initializing ChessTV...");
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Logic for board width calculation could be here if Chessboard was used
    // For a loader, this might just be to trigger a re-render or message update
    if (boardContainerRef.current) {
        setStatusMessage("ChessTV Loader Mounted. Displaying placeholder...");
    }
  }, []);

  const debugIsMounted = isMounted.toString();
  // const debugBoardWidth = boardWidth.toString(); // Not relevant for pure skeleton

  // Always return a Skeleton or loading state representation
  return (
    <section id="chesstvloader" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-2">
              <Tv className="h-7 w-7 text-accent mr-2" />
              <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
            </div>
            <CardDescription className="font-body text-sm text-center text-muted-foreground">
              {statusMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2">
               <Skeleton className="aspect-square w-full h-auto min-h-[300px]" />
            </div>
             <div style={{ marginTop: '10px', padding: '5px', border: '1px solid green', fontSize: '12px', display: 'none' }}> {/* Hidden debug info */}
              <p>Debug Info:</p>
              <p>Is Mounted: {debugIsMounted}</p>
              <p>Status: {statusMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
