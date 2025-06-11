
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Lichess-like colors
const lichessLightSquareStyle: React.CSSProperties = { backgroundColor: '#F0D9B5' };
const lichessDarkSquareStyle: React.CSSProperties = { backgroundColor: '#B58863' };

const boardBaseStyle: React.CSSProperties = {
  borderRadius: '0.125rem', // rounded-sm (2px)
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Softer shadow, still visible on most backgrounds
};


export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoveOptions, setLegalMoveOptions] = useState<Record<string, React.CSSProperties>>({});

  const boardContainerRef = useRef<HTMLDivElement>(null); // Will refer to CardContent

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const calculateSize = () => {
        if (boardContainerRef.current) {
          const containerWidth = boardContainerRef.current.offsetWidth;
          setBoardWidth(containerWidth > 0 ? Math.min(560, containerWidth) : 300);
        } else {
          setBoardWidth(300); // Fallback
        }
      };
      calculateSize();
      window.addEventListener('resize', calculateSize);
      return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  const safeGameMutate = useCallback((modify: (g: Chess) => void) => {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      setPosition(update.fen());
      return update;
    });
  }, []);

  function getLegalMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true }) as Move[];
    if (moves.length === 0) {
      return {};
    }
    const newOptions: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      newOptions[move.to] = {
        background: "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)", // Subtle dot for legal moves
        borderRadius: "50%",
      };
    });
    newOptions[square] = {
      background: "rgba(255, 255, 0, 0.3)", // Highlight selected square
    };
    return newOptions;
  }
  
  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    let moveSuccessful = false;
    safeGameMutate((g) => {
        try {
            const result = g.move(move);
            if (result) moveSuccessful = true;
        } catch (e) {
            // Illegal move, chess.js might throw or return null/false
            moveSuccessful = false;
        }
    });
    
    // Always clear highlights after an attempt
    setLegalMoveOptions({});
    setSelectedSquare(null);
    return moveSuccessful;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
  }

  function onSquareClick(square: Square) {
    if (selectedSquare) {
      // If same square is clicked again, deselect
      if (selectedSquare === square) { 
        setSelectedSquare(null);
        setLegalMoveOptions({});
        return;
      }
      // Otherwise, try to make the move
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      // `makeMove` now handles clearing selectedSquare and legalMoveOptions
    } else {
      // If no piece is selected, select this one if it's a piece
      const piece = game.get(square);
      // For local play, allow selecting any piece, regardless of turn for simplicity
      if (piece) { 
        setSelectedSquare(square);
        setLegalMoveOptions(getLegalMoveOptions(square));
      }
    }
  }

  function resetGame() {
    safeGameMutate((g) => {
      g.load(initialFen);
    });
    setLegalMoveOptions({});
    setSelectedSquare(null);
  }

  return (
    <section id="interactive-chessboard" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-lg mx-auto shadow-xl border-border overflow-hidden bg-card">
          {/* CardHeader removed for cleaner look */}
          <CardContent ref={boardContainerRef} className="p-0"> {/* No padding for CardContent */}
            {isMounted && boardWidth > 0 ? (
              <Chessboard
                id="InteractiveChessboard"
                key="static-interactive-board" // Static key to prevent remounts
                position={position}
                onSquareClick={onSquareClick}
                onPieceDrop={onPieceDrop}
                arePiecesDraggable={true}
                boardWidth={boardWidth}
                animationDuration={150}
                boardOrientation="white"
                customBoardStyle={boardBaseStyle}
                customDarkSquareStyle={lichessDarkSquareStyle}
                customLightSquareStyle={lichessLightSquareStyle}
                squareStyles={legalMoveOptions}
                dropOffBoard="snapback" // Pieces snap back if dropped off board
              />
            ) : (
              // Ensure skeleton also respects max-width and aspect ratio
              <Skeleton className="aspect-square w-full h-auto min-h-[300px] mx-auto rounded-sm" style={{maxWidth: '560px'}}/>
            )}
          </CardContent>
          <div className="p-3 text-center border-t border-border">
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Board
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
