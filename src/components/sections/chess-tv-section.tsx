
"use client";

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(0);
  const [position, setPosition] = useState(DEFAULT_FEN);
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
            const calculated = Math.min(520, Math.max(200, containerWidth * 0.95)); // Max 520px, min 200px, 95% of container
            setBoardWidth(calculated);
            setStatusMessage(`Board size calculated: ${calculated}px. Container width: ${containerWidth}px`);
          } else {
            setBoardWidth(300); 
            setStatusMessage(`Container width is 0. Using fallback board size: 300px.`);
          }
        } else {
          setBoardWidth(300); 
          setStatusMessage("Board container ref not found. Using fallback board size: 300px.");
        }
      };
      calculateSize();
      // Note: Lichess fetching logic is currently removed for simplicity
    }
  }, [isMounted]);

  const debugCardStyle: React.CSSProperties = { border: '2px solid red', padding: '10px', backgroundColor: '#f0f0f0', margin: '1rem auto' };
  const debugBoardContainerStyle: React.CSSProperties = { border: '2px dashed blue', minHeight: boardWidth > 0 ? `${boardWidth}px` : '300px', backgroundColor: '#e0e0e0', padding: '5px' };
  const debugInfoStyle: React.CSSProperties = { marginTop: '10px', padding: '5px', border: '1px solid darkgreen', backgroundColor: 'lightgreen', fontSize: '12px', color: 'black', textAlign: 'left' };

  if (!isMounted || boardWidth === 0) {
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden" style={debugCardStyle}>
            <CardHeader className="bg-card p-4 border-b border-border">
              <div className="flex items-center justify-center mb-2">
                <Tv className="h-7 w-7 text-accent mr-2" />
                <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
              </div>
              <CardDescription className="font-body text-sm text-center text-muted-foreground">
                {isMounted ? "Calculating board size..." : "Loading ChessTV (Pre-mount)..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 bg-card">
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2" style={debugBoardContainerStyle}>
                 <Skeleton className="aspect-square w-full h-auto min-h-[250px]" />
              </div>
               <div style={debugInfoStyle}>
                <p><strong>Debug Info (Loader):</strong></p>
                <p>Is Mounted: {isMounted.toString()}</p>
                <p>Board Width: {boardWidth}px</p>
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
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden" style={debugCardStyle}>
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
              style={debugBoardContainerStyle}
            >
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
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center text-muted-foreground">
              <p>{statusMessage}</p>
            </div>
             <div style={debugInfoStyle}>
              <p><strong>Debug Info (Live):</strong></p>
              <p>Is Mounted: {isMounted.toString()}</p>
              <p>Board Width: {boardWidth}px</p>
              <p>FEN: {position}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

