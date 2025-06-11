
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Rewind, FastForward, Repeat, SkipBack, SkipForward } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Lichess-like colors
const lichessLightSquareStyle: React.CSSProperties = { backgroundColor: '#F0D9B5' };
const lichessDarkSquareStyle: React.CSSProperties = { backgroundColor: '#B58863' };

const boardBaseStyle: React.CSSProperties = {
  borderRadius: '0.125rem', // rounded-sm (2px)
  boxShadow: 'none', 
};

// Highlight styles
const selectedSquareStyle: React.CSSProperties = { background: "rgba(255, 255, 0, 0.4)" }; 
const legalMoveSquareStyle: React.CSSProperties = { background: "rgba(144, 238, 144, 0.5)" }; 
const lastMoveHighlightStyle: React.CSSProperties = { background: "rgba(205, 133, 63, 0.5)" }; // Peru, slightly transparent

export default function InteractiveChessboardSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(initialFen);
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Record<string, React.CSSProperties>>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const [fenHistory, setFenHistory] = useState<string[]>([initialFen]);
  const [currentFenIndex, setCurrentFenIndex] = useState(0);

  const boardContainerRef = useRef<HTMLDivElement>(null);

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
  
  const updateGameAndHistory = useCallback((updatedGame: Chess, move: Move | null) => {
    const newFen = updatedGame.fen();
    const newHistory = fenHistory.slice(0, currentFenIndex + 1); // Truncate history if we went back and made a new move
    newHistory.push(newFen);
    setFenHistory(newHistory);
    setCurrentFenIndex(newHistory.length - 1);
    setPosition(newFen);
    setGame(updatedGame);
    if (move) {
      setLastMove({ from: move.from, to: move.to });
    } else {
      setLastMove(null); // Clear last move on reset or if move is null
    }
  }, [fenHistory, currentFenIndex]);


  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    const newGameInstance = new Chess(game.fen());
    const moveResult = modify(newGameInstance);
    if (moveResult) {
      updateGameAndHistory(newGameInstance, moveResult);
    }
    return moveResult;
  }, [game, updateGameAndHistory]);


  function getSquareOptions(square: Square | null) {
    const newOptions: Record<string, React.CSSProperties> = {};
    
    // Highlight last move
    if (lastMove) {
      newOptions[lastMove.from] = lastMoveHighlightStyle;
      newOptions[lastMove.to] = lastMoveHighlightStyle;
    }

    if (!square) return newOptions; // Only last move highlights if no square selected

    const currentMoves = game.moves({ square, verbose: true }) as Move[];
    
    currentMoves.forEach((move) => {
      newOptions[move.to] = { ...legalMoveSquareStyle }; // Ensure new object for React to detect change
    });
    if (currentMoves.length > 0 || game.get(square)) { 
      newOptions[square] = { ...selectedSquareStyle };
    }
    return newOptions;
  }
  
  useEffect(() => {
    // Update highlights whenever selectedSquare or lastMove changes
    setMoveOptions(getSquareOptions(selectedSquare));
  }, [selectedSquare, lastMove, game]); // Add game to dependencies as game.moves() depends on it


  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    const moveResult = safeGameMutate((g) => {
        try {
            return g.move(move);
        } catch (e) {
            // This can happen if the move is illegal for various reasons (e.g., not piece's turn)
            // chess.js might throw an error, or return null.
            // We want to clear selections if the attempt was invalid.
            return null; 
        }
    });
    
    setSelectedSquare(null); 
    // setMoveOptions is now handled by useEffect based on selectedSquare and lastMove
    return !!moveResult;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity in this context
    });
  }

  function onSquareClick(square: Square) {
    if (selectedSquare) {
      if (selectedSquare === square) { // Clicked the same square
        setSelectedSquare(null);
        return;
      }
      // Attempt to make a move
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      // setSelectedSquare(null) will be handled in makeMove or its aftermath via useEffect
    } else {
      // No square selected yet, check if there's a piece to select
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) { 
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null); // Clicked empty square or opponent's piece
      }
    }
  }

  function resetGame() {
    const newGame = new Chess(initialFen);
    setGame(newGame);
    setPosition(initialFen);
    setFenHistory([initialFen]);
    setCurrentFenIndex(0);
    setSelectedSquare(null);
    setLastMove(null);
    // setMoveOptions({}); // Handled by useEffect
  }

  const navigateHistory = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < fenHistory.length) {
      setCurrentFenIndex(newIndex);
      const targetFen = fenHistory[newIndex];
      setPosition(targetFen);
      const newGameInstance = new Chess(targetFen); // Load game state for this FEN
      setGame(newGameInstance); 
      setSelectedSquare(null);
      // Determine the "last move" that led to this FEN
      // This is tricky: if going back, the "last move" is the one that was undone.
      // For simplicity, we might only highlight the actual last move of the game *if at the end*
      // Or, if we have move objects in history, we could derive it.
      // For now, clearing lastMove on history navigation is safest unless we store full Move objects.
      setLastMove(null); 
    }
  };

  const handleGoToStart = () => navigateHistory(0);
  const handlePreviousMove = () => navigateHistory(currentFenIndex - 1);
  const handleNextMove = () => navigateHistory(currentFenIndex + 1);
  const handleGoToEnd = () => navigateHistory(fenHistory.length - 1);

  const handleFlipBoard = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <Card className="shadow-xl border-border overflow-hidden bg-card w-full max-w-lg rounded-lg">
        <CardContent ref={boardContainerRef} className="p-0">
          {isMounted && boardWidth > 0 ? (
            <Chessboard
              id="InteractiveChessboard"
              key="static-interactive-board" 
              position={position}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              arePiecesDraggable={true}
              boardWidth={boardWidth}
              animationDuration={150}
              boardOrientation={boardOrientation}
              customBoardStyle={boardBaseStyle}
              customDarkSquareStyle={lichessDarkSquareStyle}
              customLightSquareStyle={lichessLightSquareStyle}
              customSquareStyles={moveOptions}
              dropOffBoard="snapback"
            />
          ) : (
            <Skeleton className="aspect-square w-full h-auto min-h-[300px] mx-auto rounded-sm" style={{maxWidth: '560px'}}/>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 p-3 bg-card rounded-lg shadow-md flex justify-center space-x-2 flex-wrap gap-2">
        <Button variant="outline" size="default" onClick={handleGoToStart} disabled={currentFenIndex === 0} aria-label="Go to Start">
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handlePreviousMove} disabled={currentFenIndex === 0} aria-label="Previous Move">
          <Rewind className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handleNextMove} disabled={currentFenIndex === fenHistory.length - 1} aria-label="Next Move">
          <FastForward className="h-5 w-5" />
        </Button>
         <Button variant="outline" size="default" onClick={handleGoToEnd} disabled={currentFenIndex === fenHistory.length - 1} aria-label="Go to End">
          <SkipForward className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={resetGame} aria-label="Reset Board">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handleFlipBoard} aria-label="Flip Board">
          <Repeat className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
