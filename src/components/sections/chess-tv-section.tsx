
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Rewind, FastForward, Repeat } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Lichess-like colors
const lichessLightSquareStyle: React.CSSProperties = { backgroundColor: '#F0D9B5' };
const lichessDarkSquareStyle: React.CSSProperties = { backgroundColor: '#B58863' };

const boardBaseStyle: React.CSSProperties = {
  borderRadius: '0.125rem', // rounded-sm (2px)
  boxShadow: 'none', // Shadow will be on the Card
};

// Highlight styles
const selectedSquareStyle: React.CSSProperties = { background: "rgba(255, 255, 0, 0.4)" }; // Translucent yellow
const legalMoveSquareStyle: React.CSSProperties = { background: "rgba(144, 238, 144, 0.5)" }; // Translucent light green/jade

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(initialFen);
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Record<string, React.CSSProperties>>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

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
          setBoardWidth(300);
        }
      };
      calculateSize();
      window.addEventListener('resize', calculateSize);
      return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);
  
  const updateGameAndHistory = useCallback((updatedGame: Chess) => {
    const newFen = updatedGame.fen();
    const newHistory = fenHistory.slice(0, currentFenIndex + 1);
    newHistory.push(newFen);
    setFenHistory(newHistory);
    setCurrentFenIndex(newHistory.length - 1);
    setPosition(newFen);
    setGame(updatedGame);
  }, [fenHistory, currentFenIndex]);


  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    const newGameInstance = new Chess(game.fen());
    const moveResult = modify(newGameInstance);
    if (moveResult) {
      updateGameAndHistory(newGameInstance);
    }
    return moveResult;
  }, [game, updateGameAndHistory]);


  function getSquareOptions(square: Square | null) {
    if (!square) return {};
    const currentMoves = game.moves({ square, verbose: true }) as Move[];
    const newOptions: Record<string, React.CSSProperties> = {};

    currentMoves.forEach((move) => {
      newOptions[move.to] = legalMoveSquareStyle;
    });
    if (currentMoves.length > 0 || game.get(square)) { // Highlight selected square if it has moves or a piece
      newOptions[square] = selectedSquareStyle;
    }
    return newOptions;
  }
  
  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    const moveResult = safeGameMutate((g) => {
        try {
            return g.move(move);
        } catch (e) {
            return null;
        }
    });
    
    setSelectedSquare(null);
    setMoveOptions({});
    return !!moveResult;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', 
    });
  }

  function onSquareClick(square: Square) {
    if (selectedSquare) {
      if (selectedSquare === square) { 
        setSelectedSquare(null);
        setMoveOptions({});
        return;
      }
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) { 
        setSelectedSquare(square);
        setMoveOptions(getSquareOptions(square));
      } else {
        setSelectedSquare(null);
        setMoveOptions({});
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
    setMoveOptions({});
  }

  const handlePreviousMove = () => {
    if (currentFenIndex > 0) {
      const newIndex = currentFenIndex - 1;
      setCurrentFenIndex(newIndex);
      const prevFen = fenHistory[newIndex];
      setPosition(prevFen);
      game.load(prevFen); // Sync chess.js instance
      setSelectedSquare(null);
      setMoveOptions({});
    }
  };

  const handleNextMove = () => {
    if (currentFenIndex < fenHistory.length - 1) {
      const newIndex = currentFenIndex + 1;
      setCurrentFenIndex(newIndex);
      const nextFen = fenHistory[newIndex];
      setPosition(nextFen);
      game.load(nextFen); // Sync chess.js instance
      setSelectedSquare(null);
      setMoveOptions({});
    }
  };

  const handleFlipBoard = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  };

  return (
    <section id="interactive-chessboard" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg"> {/* Constrain width for aesthetics */}
        <Card className="shadow-xl border-border overflow-hidden bg-card">
          <CardContent ref={boardContainerRef} className="p-0"> {/* No padding for CardContent */}
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
        
        <div className="mt-4 flex justify-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMove} disabled={currentFenIndex === 0} aria-label="Previous Move">
            <Rewind className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMove} disabled={currentFenIndex === fenHistory.length - 1} aria-label="Next Move">
            <FastForward className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetGame} aria-label="Reset Board">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleFlipBoard} aria-label="Flip Board">
            <Repeat className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
