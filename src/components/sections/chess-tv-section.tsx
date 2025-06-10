
"use client";

import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard'; // Import from react-chessboard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ChessTVSectionLoader from './chess-tv-section-loader';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState(DEFAULT_FEN); // react-chessboard uses 'position' for FEN
  const [isLoading, setIsLoading] = useState(true);
  const [boardKey, setBoardKey] = useState(0); // Key to force re-render if needed

  useEffect(() => {
    setIsMounted(true);
    // Simulate loading finish and ensure client-side context for board width
    const timer = setTimeout(() => {
      setIsLoading(false);
      setBoardKey(prev => prev + 1); // Force re-render after mount for width calculation
    }, 100); // Short delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, []);

  // Calculate board width dynamically after mount
  const getBoardWidth = () => {
    if (typeof window !== 'undefined') {
      // Attempt to find the container and use its width, or fallback
      const container = document.getElementById('chess-tv-board-container');
      if (container) {
        return Math.min(520, container.offsetWidth * 0.95); // Use 95% of container width
      }
      return Math.min(520, window.innerWidth * 0.8); // Fallback to viewport width
    }
    return 320; // Default for SSR or if window is not available
  };
  
  if (!isMounted || isLoading) { // Show loader if not mounted or still loading
    return <ChessTVSectionLoader />;
  }

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
              Live Chess Board
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div 
              id="chess-tv-board-container" // Add an ID for width calculation
              className="aspect-square w-full max-w-[520px] mx-auto my-2 rounded-md overflow-hidden"
              style={{ minHeight: '320px' }} 
            >
              {isMounted && !isLoading ? ( // Ensure mounted and not loading before rendering Chessboard
                <Chessboard 
                  key={boardKey} // Use key to help with re-renders if width changes
                  id="ChessTVBoard" 
                  position={position} 
                  boardWidth={getBoardWidth()}
                  arePiecesDraggable={false} 
                  animationDuration={200}
                />
              ) : (
                // This Skeleton should ideally not be shown if !isMounted || isLoading condition above handles it.
                // But as a fallback for the brief moment:
                <Skeleton className="aspect-square w-full h-full" /> 
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              <p>Displaying standard board position.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
