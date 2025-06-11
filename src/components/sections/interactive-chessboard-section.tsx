
"use client";

import * as React from 'react'; // Added this import
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
  const [moveHistoryForDisplay, setMoveHistoryForDisplay] = useState<string[]>([]);

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
    const history = currentGame.history({ verbose: false }); // Get SAN moves
    const formattedMoves: string[] = [];
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      let turn = `${moveNumber}. ${history[i]}`;
      if (history[i+1]) {
        turn += ` ${history[i+1]}`;
      }
      formattedMoves.push(turn);
    }
    setMoveHistoryForDisplay(formattedMoves);
  }, []);

  const updateGameAndHistory = useCallback((updatedGame: Chess, moveResult: Move | null) => {
    const newFen = updatedGame.fen();
    const newFenHistory = fenHistory.slice(0, currentFenIndex + 1); // Truncate history if we made a move after going back
    newFenHistory.push(newFen);
    setFenHistory(newFenHistory);
    setCurrentFenIndex(newFenHistory.length - 1);

    setPosition(newFen);
    setGame(updatedGame); // Keep the game instance synchronized

    if (moveResult) {
      setLastMove({ from: moveResult.from, to: moveResult.to });
    } else {
      setLastMove(null);
    }
    updateMoveHistoryDisplay(updatedGame);
  }, [fenHistory, currentFenIndex, updateMoveHistoryDisplay]);


  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    const newGameInstance = new Chess(game.fen()); // Create a new instance from current FEN
    const moveResult = modify(newGameInstance); // Operate on the new instance

    if (moveResult) { // If the move was successful
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
  }, [selectedSquare, lastMove, game]); // Added game dependency


  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    const moveResult = safeGameMutate((g) => {
      try {
        return g.move(move);
      } catch (e) {
        // Invalid move, chess.js might throw an error or return null
        return null;
      }
    });
    setSelectedSquare(null); // Clear selection after attempting a move
    // setMoveOptions({}); // Clear visual hints immediately
    return !!moveResult; // Return true if move was successful, false otherwise
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity in this example
    });
  }

  function onSquareClick(square: Square) {
    // If a square is already selected
    if (selectedSquare) {
      // If the clicked square is the same as the selected one, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        // setMoveOptions({});
        return;
      }
      // Otherwise, attempt to make a move from selectedSquare to the clicked square
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      // setSelectedSquare(null); // Already handled in makeMove
      // setMoveOptions({});
    } else {
      // If no square is selected, check if the clicked square has a piece of the current turn's color
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square); // Select the square
      } else {
        setSelectedSquare(null); // Clicked on empty square or opponent's piece
        // setMoveOptions({});
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
    // setMoveOptions({});
    updateMoveHistoryDisplay(newGame);
  }

  const navigateHistory = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < fenHistory.length) {
      setCurrentFenIndex(newIndex);
      const targetFen = fenHistory[newIndex];
      setPosition(targetFen);
      
      // Create a new game instance reflecting the FEN from history
      const newGameInstance = new Chess(targetFen);
      setGame(newGameInstance);
      
      setSelectedSquare(null);
      // setMoveOptions({});
      setLastMove(null); // Clear last move highlight when navigating history
      updateMoveHistoryDisplay(newGameInstance); // Update move display
    }
  };

  const handleGoToStart = () => navigateHistory(0);
  const handlePreviousMove = () => navigateHistory(currentFenIndex - 1);
  const handleNextMove = () => navigateHistory(currentFenIndex + 1);
  const handleGoToEnd = () => navigateHistory(fenHistory.length - 1);
  const handleFlipBoard = () => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  const handleDownload = () => {
    // Placeholder for PGN download functionality
    console.log("Download PGN:", game.pgn());
    alert("PGN Download functionality to be implemented. Check console for PGN.");
  };


  return (
    <div className="w-full flex flex-col items-center">
      <Card className="shadow-xl border-border overflow-hidden bg-card w-full max-w-lg rounded-lg">
        <CardContent ref={boardContainerRef} className="p-0">
          {isMounted && boardWidth > 0 ? (
            <Chessboard
              id="InteractiveChessboard"
              key="static-interactive-board" // Stable key
              position={position}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              arePiecesDraggable={true}
              boardWidth={boardWidth}
              animationDuration={150} // Slightly faster animation
              boardOrientation={boardOrientation}
              customBoardStyle={boardBaseStyle}
              customDarkSquareStyle={lichessDarkSquareStyle}
              customLightSquareStyle={lichessLightSquareStyle}
              customSquareStyles={moveOptions}
              dropOffBoard="snapback" // Pieces return to original square if move is invalid
            />
          ) : (
            <Skeleton className="aspect-square w-full h-auto min-h-[300px] mx-auto rounded-sm" style={{maxWidth: '560px'}}/>
          )}
        </CardContent>
      </Card>

      <div className="mt-3 p-3 bg-card rounded-lg shadow-md flex flex-wrap justify-center items-center gap-1 sm:gap-2 w-full max-w-lg">
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

      {moveHistoryForDisplay.length > 0 && (
         <Card className="mt-3 p-2 bg-card rounded-lg shadow-md w-full max-w-lg">
            <CardContent className="p-0">
                <h3 className="font-headline text-md font-semibold mb-1 text-center">Move History</h3>
                <ScrollArea className="h-[100px] w-full rounded-md border border-border p-2 text-sm bg-background">
                    <div className="grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[auto_1fr_1fr_1fr_1fr] gap-x-2 gap-y-1 font-mono">
                    {moveHistoryForDisplay.map((moveTurn, index) => {
                        const parts = moveTurn.match(/(\d+)\.\s*(\S+)(?:\s+(\S+))?/);
                        if (!parts) return <div key={index} className="col-span-full">{moveTurn}</div>;
                        const moveNumber = parts[1];
                        const whiteMove = parts[2];
                        const blackMove = parts[3];
                        return (
                        <React.Fragment key={index}>
                            <div className="text-right text-muted-foreground">{moveNumber}.</div>
                            <div>{whiteMove}</div>
                            {blackMove && <div>{blackMove}</div>}
                            {!blackMove && <div></div>} {/* Placeholder for alignment if only white move */}
                        </React.Fragment>
                        );
                    })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
