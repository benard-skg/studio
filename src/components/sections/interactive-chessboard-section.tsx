
"use client";

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Chess, type Move } from 'chess.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw, Rewind, FastForward, Repeat, SkipBack, SkipForward, Download, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isValid } from 'date-fns';
import { slugify } from '@/lib/utils';

const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const lichessLightSquareStyle: React.CSSProperties = { backgroundColor: '#F0D9B5' };
const lichessDarkSquareStyle: React.CSSProperties = { backgroundColor: '#B58863' };

const boardBaseStyle: React.CSSProperties = {
  borderRadius: '0.125rem',
  boxShadow: 'none',
};

const selectedSquareStyle: React.CSSProperties = { background: "rgba(255, 255, 0, 0.4)" };
const legalMoveSquareStyle: React.CSSProperties = { background: "rgba(144, 238, 144, 0.5)" };
const lastMoveHighlightStyle: React.CSSProperties = { background: "rgba(205, 133, 63, 0.5)" }; // Peru, slightly transparent

export default function InteractiveChessboardSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [game, setGame] = useState(new Chess(initialFen));
  const [position, setPosition] = useState(initialFen);
  const [boardWidth, setBoardWidth] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Record<string, React.CSSProperties>>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);

  const [fenHistory, setFenHistory] = useState<string[]>([initialFen]);
  const [currentFenIndex, setCurrentFenIndex] = useState(0);
  
  const [sanMoveHistory, setSanMoveHistory] = useState<string[]>([]);
  const [currentSanMoveIndex, setCurrentSanMoveIndex] = useState<number>(-1);

  const [moveHistoryForDisplay, setMoveHistoryForDisplay] = useState<string>("");

  const [isPgnDialogOpen, setIsPgnDialogOpen] = useState(false);
  const [pgnFormValues, setPgnFormValues] = useState({
    Event: "Casual Game",
    Site: "Local Analysis",
    Date: format(new Date(), 'yyyy-MM-dd'),
    Round: "?",
    White: "White",
    Black: "Black",
    WhiteElo: "?",
    BlackElo: "?",
    Result: "*",
  });

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

  const updateMoveHistoryDisplay = useCallback(() => {
    let fullHistoryString = "";
    const activeSanMoves = sanMoveHistory; // Always use the full SAN history for display

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
  }, [sanMoveHistory]);

  useEffect(() => {
    updateMoveHistoryDisplay();
  }, [updateMoveHistoryDisplay]);


  const updateGameAndHistoryStates = useCallback((newGameInstance: Chess, moveResult: Move | null) => {
    const newFen = newGameInstance.fen();
    
    // Truncate future FEN history if making a new move after undoing
    const newFenHistory = fenHistory.slice(0, currentFenIndex + 1);
    newFenHistory.push(newFen);
    setFenHistory(newFenHistory);
    const newCurrentFenIndex = newFenHistory.length - 1;
    setCurrentFenIndex(newCurrentFenIndex);

    if (moveResult) {
      // Truncate future SAN history
      const newSanMoves = sanMoveHistory.slice(0, currentSanMoveIndex + 1);
      newSanMoves.push(moveResult.san);
      setSanMoveHistory(newSanMoves);
      setCurrentSanMoveIndex(newSanMoves.length - 1);
      setLastMoveSquares({ from: moveResult.from, to: moveResult.to });
    } else {
      setLastMoveSquares(null);
    }
    
    setPosition(newFen);
    setGame(newGameInstance);
  }, [fenHistory, currentFenIndex, sanMoveHistory, currentSanMoveIndex]);

  const safeGameMutate = useCallback((modify: (g: Chess) => Move | null) => {
    const gameInstanceForMove = new Chess(position); 
    const moveResult = modify(gameInstanceForMove);

    if (moveResult) {
      updateGameAndHistoryStates(gameInstanceForMove, moveResult);
    }
    return moveResult;
  }, [position, updateGameAndHistoryStates]);

  const getSquareOptionsToDisplay = useCallback(() => {
    const newOptions: Record<string, React.CSSProperties> = {};
    // Apply last move highlight first, so selection/legal moves can override if needed on those squares
    if (lastMoveSquares) {
      newOptions[lastMoveSquares.from] = { ...lastMoveHighlightStyle };
      newOptions[lastMoveSquares.to] = { ...lastMoveHighlightStyle };
    }

    if (!selectedSquare) return newOptions;

    const tempGame = new Chess(position);
    const currentMoves = tempGame.moves({ square: selectedSquare, verbose: true }) as Move[];
    
    currentMoves.forEach((move) => {
      newOptions[move.to] = { ...newOptions[move.to], ...legalMoveSquareStyle }; // Merge, don't overwrite lastMove
    });

    // Highlight selected square last to ensure it's on top if it was part of the last move
    if (currentMoves.length > 0 || tempGame.get(selectedSquare)) {
       newOptions[selectedSquare] = { ...newOptions[selectedSquare], ...selectedSquareStyle }; // Merge
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
    const gameForClick = new Chess(position);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
    } else {
      const piece = gameForClick.get(square);
      if (piece && piece.color === gameForClick.turn()) {
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
      
      const newSanIdx = newFenIdx - 1;
      setCurrentSanMoveIndex(newSanIdx);

      const newGameInstance = new Chess(targetFen);
      setGame(newGameInstance); 
      
      setSelectedSquare(null);
      
      if (newFenIdx > 0 && sanMoveHistory.length > newSanIdx && newSanIdx >=0 ) {
         const gameBeforeThisState = new Chess(fenHistory[newFenIdx - 1]);
         // Ensure the SAN move exists before trying to parse it
         if (sanMoveHistory[newSanIdx]) {
            const moveObject = gameBeforeThisState.move(sanMoveHistory[newSanIdx]);
            if(moveObject) {
                setLastMoveSquares({from: moveObject.from, to: moveObject.to});
            } else {
                // This can happen if SAN history and FEN history are desynced or move is invalid for prev state
                // For robustnes, might need to re-parse all SAN moves up to newSanIdx on gameBeforeThisState
                setLastMoveSquares(null);
            }
         } else {
             setLastMoveSquares(null);
         }
      } else {
        setLastMoveSquares(null);
      }
    }
  };

  const handleGoToStart = () => navigateHistory(0);
  const handlePreviousMove = () => navigateHistory(currentFenIndex - 1);
  const handleNextMove = () => navigateHistory(currentFenIndex + 1);
  const handleGoToEnd = () => navigateHistory(fenHistory.length - 1);
  const handleFlipBoard = () => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  
  const handlePgnFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPgnFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenPgnDialog = () => {
    console.log("handleOpenPgnDialog called");
    if (!pgnFormValues.Date || !isValid(new Date(pgnFormValues.Date))) {
      console.log("Setting default date in PGN form because current date is invalid or not set:", pgnFormValues.Date);
      setPgnFormValues(prev => ({ ...prev, Date: format(new Date(), 'yyyy-MM-dd') }));
    } else {
      console.log("PGN form date is already set and valid:", pgnFormValues.Date);
    }
    console.log("Setting isPgnDialogOpen to true");
    setIsPgnDialogOpen(true);
  };
  
  const handleGenerateAndDownloadPgn = () => {
    console.log("handleGenerateAndDownloadPgn called with form values:", pgnFormValues);
    let pgn = "";
    const headers = [
      { key: "Event", value: pgnFormValues.Event },
      { key: "Site", value: pgnFormValues.Site },
      { key: "Date", value: pgnFormValues.Date ? format(new Date(pgnFormValues.Date.replace(/-/g, '/')), 'yyyy.MM.dd') : "????.??.??" }, // Ensure YYYY.MM.DD
      { key: "Round", value: pgnFormValues.Round },
      { key: "White", value: pgnFormValues.White },
      { key: "Black", value: pgnFormValues.Black },
      { key: "Result", value: pgnFormValues.Result },
      { key: "WhiteElo", value: pgnFormValues.WhiteElo },
      { key: "BlackElo", value: pgnFormValues.BlackElo },
    ];

    headers.forEach(header => {
      if (header.value && header.value !== "?") {
        pgn += `[${header.key} "${header.value}"]\n`;
      }
    });
    pgn += "\n"; // Separator between headers and moves

    let moveText = "";
    for (let i = 0; i < sanMoveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      moveText += `${moveNumber}. ${sanMoveHistory[i]}`;
      if (sanMoveHistory[i+1]) {
        moveText += ` ${sanMoveHistory[i+1]}`;
      }
      if (i + 2 < sanMoveHistory.length) {
        moveText += " ";
      }
    }
    pgn += moveText.trim() + (pgnFormValues.Result !== "*" ? " " + pgnFormValues.Result : "");
    
    console.log("Generated PGN string:", pgn);

    const element = document.createElement("a");
    const file = new Blob([pgn], {type: 'application/x-chess-pgn'});
    element.href = URL.createObjectURL(file);
    const whiteName = slugify(pgnFormValues.White) || "white";
    const blackName = slugify(pgnFormValues.Black) || "black";
    element.download = `${slugify(pgnFormValues.Event) || "game"}_${whiteName}_vs_${blackName}.pgn`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setIsPgnDialogOpen(false);
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

      <Card className="mt-3 p-3 bg-card rounded-lg shadow-md w-full max-w-lg">
        <CardContent className="p-0">
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
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
                <Button variant="outline" size="default" onClick={handleOpenPgnDialog} aria-label="Download PGN">
                    <Download className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
      </Card>

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

      {/* PGN Download Dialog */}
      <Dialog open={isPgnDialogOpen} onOpenChange={setIsPgnDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">PGN Game Details</DialogTitle>
                <DialogDescription>
                    Enter the details for the PGN file.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-event" className="text-right font-body col-span-1">Event</Label>
                    <Input id="pgn-event" name="Event" value={pgnFormValues.Event} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-site" className="text-right font-body col-span-1">Site</Label>
                    <Input id="pgn-site" name="Site" value={pgnFormValues.Site} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-date" className="text-right font-body col-span-1">Date</Label>
                    <Input id="pgn-date" name="Date" type="date" value={pgnFormValues.Date} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-round" className="text-right font-body col-span-1">Round</Label>
                    <Input id="pgn-round" name="Round" value={pgnFormValues.Round} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-white" className="text-right font-body col-span-1">White</Label>
                    <Input id="pgn-white" name="White" value={pgnFormValues.White} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-black" className="text-right font-body col-span-1">Black</Label>
                    <Input id="pgn-black" name="Black" value={pgnFormValues.Black} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-whiteelo" className="text-right font-body col-span-1">WhiteElo</Label>
                    <Input id="pgn-whiteelo" name="WhiteElo" value={pgnFormValues.WhiteElo} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-blackelo" className="text-right font-body col-span-1">BlackElo</Label>
                    <Input id="pgn-blackelo" name="BlackElo" value={pgnFormValues.BlackElo} onChange={handlePgnFormChange} className="col-span-3 font-body" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pgn-result" className="text-right font-body col-span-1">Result</Label>
                    <Input id="pgn-result" name="Result" value={pgnFormValues.Result} onChange={handlePgnFormChange} className="col-span-3 font-body" placeholder="e.g., 1-0, 0-1, 1/2-1/2, or *" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPgnDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleGenerateAndDownloadPgn} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Save className="mr-2 h-4 w-4" /> Download PGN
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
