
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js'; // Ensure chess.js is installed
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardDescription
import { RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Lichess-like colors
const lichessLightSquareStyle = { backgroundColor: '#F0D9B5' };
const lichessDarkSquareStyle = { backgroundColor: '#B58863' };

const boardBaseStyle: React.CSSProperties = {
  borderRadius: '0.125rem', // rounded-sm (2px)
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Softer shadow
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
          // Use the offsetWidth of the CardContent directly
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
        background: "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });
    newOptions[square] = {
      background: "rgba(255, 255, 0, 0.3)", // Slightly more subtle yellow
    };
    return newOptions;
  }
  
  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    let moveSuccessful = false;
    safeGameMutate((g) => {
        try {
            const result = g.move(move);
            if (result) {
                moveSuccessful = true;
                 // Check for game over
                if (g.isGameOver()) {
                    // You can add a toast or alert here if desired
                    // For now, just console log or do nothing to avoid UI flashes
                    console.log(getGameOverMessage(g));
                }
            }
        } catch (e) {
            // Catches illegal moves if chess.js throws an error
            moveSuccessful = false;
        }
    });
    
    // Always clear highlights after an attempt
    setLegalMoveOptions({});
    setSelectedSquare(null);
    return moveSuccessful;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    // The `makeMove` function will handle FEN update and clearing options
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
  }

  function onSquareClick(square: Square) {
    if (selectedSquare) {
      if (selectedSquare === square) { 
        setSelectedSquare(null);
        setLegalMoveOptions({});
        return;
      }
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      // `makeMove` now handles clearing selectedSquare and legalMoveOptions
    } else {
      const piece = game.get(square);
      // Allow selecting any piece for local play, regardless of turn for simplicity
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

  function getGameOverMessage(g: Chess) {
    if (g.isCheckmate()) {
      return `Checkmate! ${g.turn() === 'w' ? 'Black' : 'White'} wins.`;
    } else if (g.isDraw()) {
      let reason = "Draw!";
      if (g.isStalemate()) reason = "Stalemate! Draw.";
      else if (g.isThreefoldRepetition()) reason = "Threefold Repetition! Draw.";
      else if (g.isInsufficientMaterial()) reason = "Insufficient Material! Draw.";
      return reason;
    }
    return "";
  }

  return (
    <section id="interactive-chessboard" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-lg mx-auto shadow-xl border-border overflow-hidden bg-card">
          {/* CardHeader removed */}
          <CardContent ref={boardContainerRef} className="p-0"> {/* No padding for CardContent */}
            {isMounted && boardWidth > 0 ? (
              <Chessboard
                id="InteractiveChessboard"
                key={position} // Re-render if FEN changes to reflect board state
                position={position}
                onSquareClick={onSquareClick}
                onPieceDrop={onPieceDrop}
                arePiecesDraggable={true}
                boardWidth={boardWidth}
                animationDuration={150} // Slightly faster animation
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
          <div className="p-3 text-center border-t border-border"> {/* Added border for separation */}
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

