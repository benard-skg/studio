
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
  boxShadow: 'none', // Shadow will be on the Card
};

// Highlight styles
const selectedSquareStyle: React.CSSProperties = { background: "rgba(255, 255, 0, 0.4)" }; // Translucent yellow
const legalMoveSquareStyle: React.CSSProperties = { background: "rgba(144, 238, 144, 0.5)" }; // Translucent light green/jade
const lastMoveHighlightStyle: React.CSSProperties = { background: "rgba(205, 133, 63, 0.5)" }; // Peru, slightly transparent

export default function InteractiveChessboardSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess()); // This instance is mainly for move validation and getting SAN
  const [position, setPosition] = useState(initialFen); // Current FEN for the board
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Record<string, React.CSSProperties>>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);

  // History states
  const [fenHistory, setFenHistory] = useState<string[]>([initialFen]);
  const [currentFenIndex, setCurrentFenIndex] = useState(0);
  
  const [sanMoveHistory, setSanMoveHistory] = useState<string[]>([]);
  const [currentSanMoveIndex, setCurrentSanMoveIndex] = useState<number>(-1); // -1 means no moves played yet

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

  const updateMoveHistoryDisplay = useCallback(() => {
    let fullHistoryString = "";
    const activeSanMoves = sanMoveHistory.slice(0, currentSanMoveIndex + 1);

    for (let i = 0; i < activeSanMoves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      fullHistoryString += `${moveNumber}. ${activeSanMoves[i]}`;
      if (activeSanMoves[i+1]) {
        fullHistoryString += ` ${activeSanMoves[i+1]}`;
      }
      if (i + 2 < activeSanMoves.length) {
        fullHistoryString += " ";
      }
    }
    setMoveHistoryForDisplay(fullHistoryString.trim());
  }, [sanMoveHistory, currentSanMoveIndex]);

  useEffect(() => {
    updateMoveHistoryDisplay();
  }, [sanMoveHistory, currentSanMoveIndex, updateMoveHistoryDisplay]);


  const updateGameAndHistoryStates = useCallback((newGameInstance: Chess, moveResult: Move | null) => {
    const newFen = newGameInstance.fen();
    
    // Update FEN history
    const newFenHistory = fenHistory.slice(0, currentFenIndex + 1);
    newFenHistory.push(newFen);
    setFenHistory(newFenHistory);
    setCurrentFenIndex(newFenHistory.length - 1);

    // Update SAN history
    if (moveResult) {
      const newSanMoves = sanMoveHistory.slice(0, currentSanMoveIndex + 1);
      newSanMoves.push(moveResult.san);
      setSanMoveHistory(newSanMoves);
      setCurrentSanMoveIndex(newSanMoves.length - 1);
      setLastMoveSquares({ from: moveResult.from, to: moveResult.to });
    } else {
      // This case should ideally not happen if we're calling with a valid moveResult
      setLastMoveSquares(null);
    }
    
    setPosition(newFen);
    setGame(newGameInstance); // Keep game instance updated with the latest state

  }, [fenHistory, currentFenIndex, sanMoveHistory, currentSanMoveIndex]);


  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    // Always operate on a game instance that reflects the current board position
    const gameInstanceForMove = new Chess(position); 
    const moveResult = modify(gameInstanceForMove);

    if (moveResult) {
      updateGameAndHistoryStates(gameInstanceForMove, moveResult);
    }
    return moveResult;
  }, [position, updateGameAndHistoryStates]);


  const getSquareOptionsToDisplay = useCallback(() => {
    const newOptions: Record<string, React.CSSProperties> = {};
    if (lastMoveSquares) {
      newOptions[lastMoveSquares.from] = { ...lastMoveHighlightStyle };
      newOptions[lastMoveSquares.to] = { ...lastMoveHighlightStyle };
    }

    if (!selectedSquare) return newOptions;

    const tempGame = new Chess(position); // Use current FEN for legal moves calculation
    const currentMoves = tempGame.moves({ square: selectedSquare, verbose: true }) as Move[];
    
    currentMoves.forEach((move) => {
      newOptions[move.to] = { ...legalMoveSquareStyle };
    });
    if (currentMoves.length > 0 || tempGame.get(selectedSquare)) {
      newOptions[selectedSquare] = { ...selectedSquareStyle };
    }
    return newOptions;
  }, [selectedSquare, lastMoveSquares, position]);

  useEffect(() => {
    setMoveOptions(getSquareOptionsToDisplay());
  }, [selectedSquare, lastMoveSquares, position, getSquareOptionsToDisplay]);


  function makeMove(move: string | { from: Square; to: Square; promotion?: Piece[1] }) {
    const moveResult = safeGameMutate((g) => {
      try {
        return g.move(move);
      } catch (e) {
        // Invalid move
        return null;
      }
    });
    setSelectedSquare(null); // Clear selection after attempting a move
    return !!moveResult;
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    // The 'game' instance for move validation is re-created in safeGameMutate from current 'position'
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
  }

  function onSquareClick(square: Square) {
    const gameForClick = new Chess(position); // Use current FEN for click logic

    if (selectedSquare) {
      if (selectedSquare === square) { // Clicked same square again
        setSelectedSquare(null); // Deselect
        return;
      }
      // Attempt to make a move from selectedSquare to clicked square
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      // makeMove will clear selectedSquare
    } else {
      // No square selected, try to select this one
      const piece = gameForClick.get(square);
      if (piece && piece.color === gameForClick.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null); // Clicked on empty square or opponent's piece
      }
    }
  }

  function resetGame() {
    const newGame = new Chess(initialFen);
    setGame(newGame);
    setPosition(initialFen);
    
    setFenHistory([initialFen]);
    setCurrentFenIndex(0);
    
    setSanMoveHistory([]);
    setCurrentSanMoveIndex(-1);
    
    setSelectedSquare(null);
    setLastMoveSquares(null);
  }

  const navigateHistory = (newFenIdx: number) => {
    if (newFenIdx >= 0 && newFenIdx < fenHistory.length) {
      setCurrentFenIndex(newFenIdx);
      const targetFen = fenHistory[newFenIdx];
      setPosition(targetFen);
      
      // Update SAN move index to match FEN history
      // fenHistory[0] is initialFen, sanMoveHistory[0] is the first move.
      // So, if newFenIdx is 0 (initial board), currentSanMoveIndex should be -1.
      // If newFenIdx is 1 (after 1st move), currentSanMoveIndex should be 0.
      setCurrentSanMoveIndex(newFenIdx - 1);

      const newGameInstance = new Chess(targetFen); // For board orientation, turn, etc.
      setGame(newGameInstance); 
      
      setSelectedSquare(null); // Clear piece selection
      
      // Update last move highlight based on the move that *led* to this FEN
      if (newFenIdx > 0 && sanMoveHistory.length >= newFenIdx) {
         // To get the from/to of the move that resulted in fenHistory[newFenIdx],
         // we need to look at sanMoveHistory[newFenIdx - 1] and apply it to fenHistory[newFenIdx -1]
         const gameBeforeThisState = new Chess(fenHistory[newFenIdx - 1]);
         const moveObject = gameBeforeThisState.move(sanMoveHistory[newFenIdx -1]);
         if(moveObject) {
            setLastMoveSquares({from: moveObject.from, to: moveObject.to});
         } else {
            setLastMoveSquares(null);
         }
      } else {
        setLastMoveSquares(null); // No last move for initial position or if history is inconsistent
      }
    }
  };

  const handleGoToStart = () => navigateHistory(0);
  const handlePreviousMove = () => navigateHistory(currentFenIndex - 1);
  const handleNextMove = () => navigateHistory(currentFenIndex + 1);
  const handleGoToEnd = () => navigateHistory(fenHistory.length - 1);
  const handleFlipBoard = () => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  
  const handleDownload = () => {
    const gameToDownloadPgn = new Chess(); // Create a fresh instance
    sanMoveHistory.slice(0, currentSanMoveIndex + 1).forEach(sanMove => {
      gameToDownloadPgn.move(sanMove);
    });
    const pgn = gameToDownloadPgn.pgn();
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
    alert("PGN content logged to console. See console for PGN (actual download not implemented).");
  };


  return (
    <div className="w-full flex flex-col items-center">
      <Card className="shadow-xl border-border overflow-hidden bg-card w-full max-w-lg rounded-lg">
        <CardContent ref={boardContainerRef} className="p-0"> {/* No padding in CardContent */}
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
              dropOffBoard="snapback" // Pieces snap back if dropped off board
            />
          ) : (
            // Consistent skeleton size based on common board constraints
            <Skeleton className="aspect-square w-full h-auto min-h-[300px] mx-auto rounded-sm" style={{maxWidth: '560px'}}/>
          )}
        </CardContent>
      </Card>

      {/* Controls Panel */}
      <div className="mt-3 p-3 bg-card rounded-lg shadow-md w-full max-w-lg flex flex-wrap justify-center items-center gap-1 sm:gap-2">
        <Button variant="outline" size="default" onClick={handleGoToStart} disabled={currentFenIndex === 0} aria-label="Go to Start">
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handlePreviousMove} disabled={currentFenIndex === 0} aria-label="Previous Move">
          <Rewind className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handleNextMove} disabled={currentFenIndex >= fenHistory.length - 1} aria-label="Next Move">
          <FastForward className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="default" onClick={handleGoToEnd} disabled={currentFenIndex >= fenHistory.length - 1} aria-label="Go to End">
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

      {/* Move History Display */}
      {isMounted && sanMoveHistory.length > 0 && (
         <Card className="mt-3 p-2 bg-card rounded-lg shadow-md w-full max-w-lg">
            <CardContent className="p-0">
                <h3 className="font-headline text-md font-semibold mb-1 text-center text-card-foreground">Move History</h3>
                <ScrollArea className="h-auto max-h-[60px] w-full rounded-md border border-border p-2 text-sm bg-background">
                    <div className="font-mono whitespace-nowrap text-xs sm:text-sm text-foreground">
                        {moveHistoryForDisplay || "No moves yet."}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

