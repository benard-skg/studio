
"use client";

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import ChessTVSectionLoader from './chess-tv-section-loader';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState(DEFAULT_FEN);
  // Start with a fixed, reasonable width. Will be updated dynamically.
  const [boardWidth, setBoardWidth] = useState(320); 
  // isLoading will be true until we've tried to calculate the board width
  const [isLoading, setIsLoading] = useState(true); 
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    console.log("[ChessTVSection] Component did mount.");

    // Set a short timeout to ensure DOM elements are available for width calculation
    const timer = setTimeout(() => {
      if (boardContainerRef.current) {
        const containerWidth = boardContainerRef.current.offsetWidth;
        // Ensure a minimum width, e.g., 200px, and max of 520px or 95% of container
        const calculatedWidth = Math.min(520, Math.max(200, containerWidth * 0.95));
        console.log(`[ChessTVSection] Container width: ${containerWidth}, Calculated board width: ${calculatedWidth}`);
        setBoardWidth(calculatedWidth);
      } else {
        console.warn("[ChessTVSection] Board container ref not available on mount, using default width 320.");
        setBoardWidth(320); // Fallback if ref is not immediately available
      }
      setIsLoading(false); // Finished initial setup and width calculation
      console.log("[ChessTVSection] Initial loading and width calculation complete.");
    }, 100); // Small delay for DOM readiness

    // Resize listener
    const handleResize = () => {
      if (boardContainerRef.current) {
        const containerWidth = boardContainerRef.current.offsetWidth;
        const newCalculatedWidth = Math.min(520, Math.max(200, containerWidth * 0.95));
        console.log(`[ChessTVSection] Resized. Container width: ${containerWidth}, New board width: ${newCalculatedWidth}`);
        setBoardWidth(newCalculatedWidth);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      console.log("[ChessTVSection] Component will unmount.");
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  if (!isMounted) {
    console.log("[ChessTVSection] Not mounted yet. Rendering ChessTVSectionLoader.");
    return <ChessTVSectionLoader />;
  }

  if (isLoading) {
    console.log("[ChessTVSection] Still in loading state (calculating width). Rendering ChessTVSectionLoader.");
    // You can use ChessTVSectionLoader or a more specific Skeleton here
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
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2">
                 <Skeleton className="aspect-square w-full h-auto min-h-[320px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  console.log(`[ChessTVSection] Ready to render Chessboard. isMounted: ${isMounted}, isLoading: ${isLoading}, boardWidth: ${boardWidth}, position: ${position}`);

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
              ref={boardContainerRef}
              id="chess-tv-board-container"
              className="w-full max-w-[520px] mx-auto my-2 rounded-md overflow-hidden"
              style={{ minHeight: `${boardWidth}px` }} // Ensure container height matches board for aspect ratio
            >
              {boardWidth > 0 ? (
                <Chessboard
                  id="ChessTVBoard"
                  position={position}
                  boardWidth={boardWidth}
                  arePiecesDraggable={false}
                  animationDuration={200}
                  // key is useful if boardWidth changes drastically and you need a full re-render
                  key={`chessboard-${boardWidth}`} 
                />
              ) : (
                <Skeleton className="w-full h-full min-h-[320px]" /> 
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              <p>Displaying standard board position.</p>
              {/* We'll re-add Lichess functionality later */}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
