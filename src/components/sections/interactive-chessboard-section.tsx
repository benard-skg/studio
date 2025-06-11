
"use client";

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw, Rewind, FastForward, Repeat, SkipBack, SkipForward, Download } from 'lucide-react';
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
const selectedSquareStyle: React.CSSProperties = { background: "rgba(255, 255, 0, 0.4)" }; // Translucent yellow
const legalMoveSquareStyle: React.CSSProperties = { background: "rgba(144, 238, 144, 0.5)" }; // Translucent light green/jade
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
  const [moveHistoryForDisplay, setMoveHistoryForDisplay] = useState<string>("");

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

  const updateMoveHistoryDisplay = useCallback((currentGame: Chess) => {
    const history = currentGame.history({ verbose: false }); // Get SAN moves: ['e4', 'e5', 'Nf3', 'Nc6']
    let fullHistoryString = "";
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      fullHistoryString += `${moveNumber}. ${history[i]}`;
      if (history[i+1]) {
        fullHistoryString += ` ${history[i+1]}`;
      }
      if (i + 2 < history.length) { // Add a space if there are more moves to come
        fullHistoryString += " ";
      }
    }
    setMoveHistoryForDisplay(fullHistoryString.trim());
  }, []);

  const updateGameAndHistory = useCallback((updatedGame: Chess, moveResult: Move | null) => {
    const newFen = updatedGame.fen();
    const newFenHistory = fenHistory.slice(0, currentFenIndex + 1);
    newFenHistory.push(newFen);
    setFenHistory(newFenHistory);
    setCurrentFenIndex(newFenHistory.length - 1);

    setPosition(newFen);
    setGame(updatedGame);

    if (moveResult) {
      setLastMove({ from: moveResult.from, to: moveResult.to });
    } else {
      setLastMove(null);
    }
    updateMoveHistoryDisplay(updatedGame);
  }, [fenHistory, currentFenIndex, updateMoveHistoryDisplay]);


  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    const newGameInstance = new Chess(game.fen());
    const moveResult = modify(newGameInstance);

    if (moveResult) {
      updateGameAndHistory(newGameInstance, moveResult);
    }
    return moveResult;
  }, [game, updateGameAndHistory]);


  function getSquareOptions(squareToHighlight: Square | null) {
    const newOptions: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      newOptions[lastMove.from] = { ...lastMoveHighlightStyle };
      newOptions[lastMove.to] = { ...lastMoveHighlightStyle };
    }
    if (!squareToHighlight) return newOptions;

    const currentMoves = game.moves({ square: squareToHighlight, verbose: true }) as Move[];
    currentMoves.forEach((move) => {
      newOptions[move.to] = { ...legalMoveSquareStyle };
    });
    if (currentMoves.length > 0 || game.get(squareToHighlight)) {
      newOptions[squareToHighlight] = { ...selectedSquareStyle };
    }
    return newOptions;
  }

  useEffect(() => {
    setMoveOptions(getSquareOptions(selectedSquare));
  }, [selectedSquare, lastMove, game]);


  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    const moveResult = safeGameMutate((g) => {
      try {
        return g.move(move);
      } catch (e) {
        return null;
      }
    });
    setSelectedSquare(null);
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
        return;
      }
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
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
    updateMoveHistoryDisplay(newGame);
  }

  const navigateHistory = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < fenHistory.length) {
      setCurrentFenIndex(newIndex);
      const targetFen = fenHistory[newIndex];
      setPosition(targetFen);
      
      const newGameInstance = new Chess(targetFen);
      setGame(newGameInstance);
      
      setSelectedSquare(null);
      setLastMove(null); 
      updateMoveHistoryDisplay(newGameInstance);
    }
  };

  const handleGoToStart = () => navigateHistory(0);
  const handlePreviousMove = () => navigateHistory(currentFenIndex - 1);
  const handleNextMove = () => navigateHistory(currentFenIndex + 1);
  const handleGoToEnd = () => navigateHistory(fenHistory.length - 1);
  const handleFlipBoard = () => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  
  const handleDownload = () => {
    const pgn = game.pgn();
    console.log("PGN:", pgn);
    // In a real app, you'd trigger a file download here.
    // For example:
    // const element = document.createElement("a");
    // const file = new Blob([pgn], {type: 'application/x-chess-pgn'});
    // element.href = URL.createObjectURL(file);
    // element.download = "game.pgn";
    // document.body.appendChild(element); // Required for this to work in FireFox
    // element.click();
    // document.body.removeChild(element);
    alert("PGN content logged to console. See console for PGN.");
  };


  return (
    <div className="w-full flex flex-col items-center">
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

      <div className="mt-3 p-3 bg-card rounded-lg shadow-md w-full max-w-lg flex flex-wrap justify-center items-center gap-1 sm:gap-2">
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
        <Button variant="outline" size="default" onClick={handleDownload} aria-label="Download PGN">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {moveHistoryForDisplay && (
         <Card className="mt-3 p-2 bg-card rounded-lg shadow-md w-full max-w-lg">
            <CardContent className="p-0">
                <h3 className="font-headline text-md font-semibold mb-1 text-center">Move History</h3>
                <ScrollArea className="h-auto max-h-[60px] w-full rounded-md border border-border p-2 text-sm bg-background">
                    <div className="font-mono whitespace-nowrap text-xs sm:text-sm">
                        {moveHistoryForDisplay}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

