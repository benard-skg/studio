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
  const [boardWidth, setBoardWidth] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing ChessTV...");
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setStatusMessage("ChessTV Mounted. Calculating board size...");
      const calculateSize = () => {
        if (boardContainerRef.current) {
          const containerWidth = boardContainerRef.current.offsetWidth;
          if (containerWidth > 0) {
            const calculated = Math.min(520, Math.max(200, containerWidth * 0.95));
            setBoardWidth(calculated);
            setStatusMessage(`Board size calculated: ${calculated}px. Container width: ${containerWidth}px`);
          } else {
            // Fallback if offsetWidth is 0 (e.g., display:none or not yet in layout)
            setBoardWidth(300); // A sensible default for mobile
            setStatusMessage(`Container width is 0. Using fallback board size: 300px.`);
          }
        } else {
          setBoardWidth(300); // Fallback if ref is somehow not available
          setStatusMessage("Board container ref not found. Using fallback board size: 300px.");
        }
      };

      // Initial calculation
      calculateSize();

      // Optional: Recalculate on resize, though this can be complex to get right
      // For now, let's focus on initial render.
      // window.addEventListener('resize', calculateSize);
      // return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  // Debug: Variables to display on screen
  const debugIsMounted = isMounted.toString();
  const debugBoardWidth = boardWidth.toString();

  if (!isMounted) {
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden" style={{ border: '2px solid red', padding: '10px', backgroundColor: '#f0f0f0' }}>
            <CardHeader className="bg-card p-4 border-b border-border">
              <div className="flex items-center justify-center mb-2">
                <Tv className="h-7 w-7 text-accent mr-2" />
                <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
              </div>
              <CardDescription className="font-body text-sm text-center text-muted-foreground">
                Loading ChessTV (Skeleton)...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 bg-card">
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2" style={{ border: '2px dashed blue', minHeight: '300px', backgroundColor: '#e0e0e0' }}>
                 <Skeleton className="aspect-square w-full h-auto min-h-[300px]" />
              </div>
               <div style={{ marginTop: '10px', padding: '5px', border: '1px solid green', fontSize: '12px' }}>
                <p>Debug Info:</p>
                <p>Is Mounted: {debugIsMounted}</p>
                <p>Board Width: {debugBoardWidth}</p>
                <p>Status: {statusMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  return (
    <section id="chesstv" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden" style={{ border: '2px solid red', padding: '10px', backgroundColor: '#f0f0f0' }}>
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
              style={{ border: '2px dashed blue', backgroundColor: '#e0e0e0', minHeight: boardWidth > 0 ? `${boardWidth}px` : '300px' }}
            >
              {isMounted && boardWidth > 0 ? (
                <Chessboard
                  id="ReactChessboard"
                  position={position}
                  boardWidth={boardWidth}
                  arePiecesDraggable={false}
                  animationDuration={200}
                  boardOrientation="white"
                  customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#B58863' }}
                  customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
                />
              ) : (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  {statusMessage === "Initializing ChessTV..." || statusMessage.includes("Calculating board size...") ? "Loading board..." : "Board could not be rendered. Waiting for size..."}
                  <Skeleton className="aspect-square w-full h-auto min-h-[280px] mt-2" />
                </div>
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              <p>{statusMessage}</p>
            </div>
             <div style={{ marginTop: '10px', padding: '5px', border: '1px solid green', fontSize: '12px' }}>
              <p>Debug Info (Live):</p>
              <p>Is Mounted: {debugIsMounted}</p>
              <p>Board Width: {debugBoardWidth}px</p>
              <p>FEN: {position}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}