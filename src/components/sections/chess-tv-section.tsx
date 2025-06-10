
"use client";

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState(DEFAULT_FEN);
  const [boardWidth, setBoardWidth] = useState(0); // Start at 0, will be calculated
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs only on the client, after isMounted is true
    if (isMounted && boardContainerRef.current) {
      const containerWidth = boardContainerRef.current.offsetWidth;
      let calculatedWidth = 0;

      if (containerWidth > 0) {
        // Use a percentage of container width, with min/max caps
        calculatedWidth = Math.min(520, Math.max(200, containerWidth * 0.95));
      } else {
        // Fallback if offsetWidth is 0 (e.g., display:none or not yet in layout)
        calculatedWidth = 300; // A sensible default for mobile or if calculation fails
      }
      setBoardWidth(calculatedWidth);
    } else if (isMounted && !boardContainerRef.current) {
        // If ref is somehow still not available after mount (should be rare), set a default
        // This might happen if the div with the ref is conditionally rendered itself based on another state
        // For now, our ref is always on a div that should be there if isMounted.
        setBoardWidth(300); 
    }
  }, [isMounted]); // Rerun when isMounted changes (and thus ref might become available)

  // If not mounted or boardWidth is still 0 (not calculated yet), show loader/skeleton
  if (!isMounted || boardWidth === 0) {
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
                Initializing board...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 bg-card">
              {/* This div with the ref is crucial for the width calculation in useEffect */}
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2">
                 <Skeleton className="aspect-square w-full h-auto min-h-[300px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  // If we've reached here, isMounted is true and boardWidth > 0
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
              Live Chess Board (react-chessboard)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div
              // The ref is on the container in the skeleton part, which is fine.
              // This div now just uses the calculated boardWidth for its minHeight.
              id="chess-tv-board-container"
              className="w-full max-w-[520px] mx-auto my-2 rounded-md overflow-hidden"
              style={{ minHeight: `${boardWidth}px` }} // Ensure container height matches board
            >
              <Chessboard
                id="ChessTVBoard"
                position={position}
                boardWidth={boardWidth}
                arePiecesDraggable={false} // Kept simple for now
                animationDuration={200} // A little animation is fine
                key={`chessboard-${boardWidth}`} // Helps re-render if width changes
              />
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              <p>Displaying standard board position.</p>
              {/* Lichess functionality will be re-added later */}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
