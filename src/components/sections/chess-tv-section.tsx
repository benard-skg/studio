
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoveOptions, setLegalMoveOptions] = useState<Record<string, React.CSSProperties>>({});

  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const calculateSize = () => {
        if (boardContainerRef.current) {
          const containerWidth = boardContainerRef.current.offsetWidth;
          // Ensure the board content takes full width of its direct parent
          // The parent of boardContainerRef is CardContent which has padding.
          // We aim for the board to be responsive within the CardContent.
          setBoardWidth(containerWidth > 0 ? Math.min(560, containerWidth) : 300);
        } else {
          setBoardWidth(300);
        }
      };
      calculateSize();
      window.addEventListener('resize', calculateSize);
      return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  const safeGameMutate = useCallback((modify: (g: Chess) => void) => {
    setGame((g) => {
      const update = new Chess(g.fen()); // Create a new instance for mutation
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
    // Style the selected square itself
    newOptions[square] = {
      background: "rgba(255, 255, 0, 0.4)", // Example: yellow highlight for selected piece
    };
    return newOptions;
  }
  
  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    try {
      const result = game.move(move);
      if (result) {
        setPosition(game.fen());
        setLegalMoveOptions({});
        setSelectedSquare(null);
        // Check for game over
        if (game.isGameOver()) {
          alert(getGameOverMessage());
        }
        return true;
      }
    } catch (e) {
      // Invalid move
      setLegalMoveOptions({});
      setSelectedSquare(null);
      return false;
    }
    return false;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    const moveSuccessful = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
    return moveSuccessful;
  }

  function onSquareClick(square: Square) {
    // If it's not our turn, do nothing
    if (game.turn() === 'b' && game.fen().split(" ")[1] === 'w') { // crude player turn check, assumes player is white
        // This needs to be more sophisticated if we want to enforce turns for local play.
        // For now, allow moves for both sides.
    }

    if (selectedSquare) {
      // Attempt to make a move
      if (selectedSquare === square) { // Clicked the same square, deselect
        setSelectedSquare(null);
        setLegalMoveOptions({});
        return;
      }
      const moveSuccessful = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (moveSuccessful) {
        setSelectedSquare(null);
        setLegalMoveOptions({});
      } else {
        // Invalid move target, try to select the new square if it has a piece of the current turn
        const pieceOnNewSquare = game.get(square);
        if (pieceOnNewSquare && pieceOnNewSquare.color === game.turn()) {
          setSelectedSquare(square);
          setLegalMoveOptions(getLegalMoveOptions(square));
        } else {
          setSelectedSquare(null);
          setLegalMoveOptions({});
        }
      }
    } else {
      // No square selected, try to select this one
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
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

  function getGameOverMessage() {
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
    } else if (game.isDraw()) {
      let reason = "Draw!";
      if (game.isStalemate()) reason = "Stalemate! Draw.";
      else if (game.isThreefoldRepetition()) reason = "Threefold Repetition! Draw.";
      else if (game.isInsufficientMaterial()) reason = "Insufficient Material! Draw.";
      return reason;
    }
    return "";
  }

  const boardWrapperStyle: React.CSSProperties = {
    width: '100%', // Fill the CardContent
    maxWidth: `${boardWidth}px`, // Max width for the board itself
    margin: '0 auto', // Center the board if CardContent is wider
    borderRadius: '0.125rem', // Tailwind's rounded-sm is 2px
    overflow: 'hidden', // To ensure children (board) also respect rounded corners
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // A subtle shadow
  };

  return (
    <section id="interactive-chessboard" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-lg mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-2">
              <Gamepad2 className="h-7 w-7 text-accent mr-2" />
              <CardTitle className="font-headline text-2xl text-center">Interactive Chessboard</CardTitle>
            </div>
            <CardDescription className="font-body text-sm text-center text-muted-foreground">
              Play a game of chess. Click or drag pieces to move.
            </CardDescription>
          </CardHeader>
          {/* CardContent will be the container that the board aims to fill */}
          <CardContent ref={boardContainerRef} className="p-2 sm:p-3 bg-card"> 
            {isMounted && boardWidth > 0 ? (
              <div style={boardWrapperStyle}>
                <Chessboard
                  id="InteractiveChessboard"
                  key={position} // Re-render if FEN changes externally, helps clear styles
                  position={position}
                  onSquareClick={onSquareClick}
                  onPieceDrop={onPieceDrop}
                  arePiecesDraggable={true}
                  boardWidth={boardWidth}
                  animationDuration={200}
                  boardOrientation="white"
                  customBoardStyle={{
                    borderRadius: '0.125rem', // Tailwind's rounded-sm
                  }}
                  customDarkSquareStyle={{ backgroundColor: 'hsl(var(--muted))' }}
                  customLightSquareStyle={{ backgroundColor: 'hsl(var(--background))' }}
                  squareStyles={legalMoveOptions}
                />
              </div>
            ) : (
              <Skeleton className="aspect-square w-full max-w-[560px] h-auto min-h-[300px] mx-auto rounded-sm" />
            )}
            <div className="mt-4 text-center">
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
