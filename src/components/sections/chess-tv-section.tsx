
"use client";

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv, User, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const LICHESS_USERNAME_KEY = 'lichessTvUsername';

interface LichessUser {
  name: string;
  id: string;
  flair?: string;
}
interface LichessPlayer {
  user?: LichessUser;
  rating?: number;
  ratingDiff?: number;
  provisional?: boolean;
}
interface LichessGameData {
  id?: string;
  rated?: boolean;
  variant?: string;
  speed?: string;
  perf?: string;
  createdAt?: number;
  lastMoveAt?: number;
  status?: string;
  source?: string;
  players?: { 
    white: LichessPlayer;
    black: LichessPlayer;
  };
  initialFen?: string;
  fen?: string; 
  winner?: string;
  moves?: string;
  pgn?: string;
  clock?: { initial: number; increment: number; totalTime: number };
}

export default function ChessTVSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(0);
  const [position, setPosition] = useState(DEFAULT_FEN);
  const [statusMessage, setStatusMessage] = useState("Initializing ChessTV...");
  const [lichessUsername, setLichessUsername] = useState<string | null>(null);
  const [gameDetails, setGameDetails] = useState<Partial<LichessGameData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameFoundInStream, setGameFoundInStream] = useState(false);
  const [lastRawStreamObject, setLastRawStreamObject] = useState<string | null>(null);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      setLichessUsername(storedUsername);
    } else {
      setStatusMessage("No Lichess username set. Configure in Admin > Settings.");
      setPosition(DEFAULT_FEN);
      setGameDetails(null);
      setGameFoundInStream(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const calculateSize = () => {
        if (boardContainerRef.current) {
          const containerWidth = boardContainerRef.current.offsetWidth;
          if (containerWidth > 0) {
            const calculated = Math.min(520, Math.max(250, containerWidth * 0.95));
            setBoardWidth(calculated);
          } else {
            setBoardWidth(300); 
          }
        } else {
          setBoardWidth(300); 
        }
      };
      calculateSize();
      // Optional: Add resize listener if needed, but be careful with performance
      // window.addEventListener('resize', calculateSize);
      // return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !lichessUsername) {
      if (isMounted && !lichessUsername) {
        setStatusMessage("No Lichess username. Set in Admin > Settings.");
        setPosition(DEFAULT_FEN);
        setGameDetails(null);
        setGameFoundInStream(false);
        setError(null);
      }
      return;
    }

    // Abort previous stream if username changes or component unmounts
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    streamControllerRef.current = new AbortController();
    const { signal } = streamControllerRef.current;

    setStatusMessage(`Attempting to connect to Lichess for ${lichessUsername}...`);
    setPosition(DEFAULT_FEN); 
    setGameDetails(null);
    setError(null);
    setGameFoundInStream(false);
    setLastRawStreamObject(null);
    let buffer = '';

    const fetchStream = async () => {
      try {
        const apiUrl = `https://lichess.org/api/games/user/${lichessUsername}?ongoing=true&pgnInJson=true&tags=true&moves=true`;
        const response = await fetch(apiUrl, { 
          signal,
          headers: {
            'Accept': 'application/x-ndjson', 
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
             setStatusMessage(`User "${lichessUsername}" not found or no ongoing games.`);
             setError(`Lichess user "${lichessUsername}" not found or no games in progress.`);
          } else {
            setStatusMessage(`Error connecting to Lichess: ${response.status}`);
            setError(`Lichess API error: ${response.statusText} (Status: ${response.status})`);
          }
          setPosition(DEFAULT_FEN);
          setGameFoundInStream(false);
          return;
        }

        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess.");
          setError("No response body from Lichess stream.");
          setPosition(DEFAULT_FEN);
          setGameFoundInStream(false);
          return;
        }
        
        setStatusMessage(`Connected to Lichess for ${lichessUsername}. Waiting for game data...`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (!gameFoundInStream) { 
              setStatusMessage(`Stream ended. No live game board identified for ${lichessUsername}. Default board shown.`);
            } else {
              setStatusMessage(`Stream ended for ${lichessUsername}. Last game state shown.`);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n'); 
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            let gameData: Partial<LichessGameData> | null = null;
            try {
              gameData = JSON.parse(line) as Partial<LichessGameData>;
              setLastRawStreamObject(JSON.stringify(gameData, null, 2)); 

              let fenToUse: string | undefined = undefined;

              if (gameData && typeof gameData.fen === 'string' && gameData.fen.trim() !== '') {
                fenToUse = gameData.fen;
              } else if (gameData && typeof gameData.initialFen === 'string' && gameData.initialFen.trim() !== '') {
                if (!gameFoundInStream || (gameDetails && gameDetails.id !== gameData.id)) {
                   fenToUse = gameData.initialFen;
                }
              }

              if (fenToUse) {
                setPosition(fenToUse);
                setGameFoundInStream(true); 
                setError(null); 
                if (typeof gameData.fen === 'string' && gameData.fen.trim() !== '') {
                    setStatusMessage(`Live game board updated for ${lichessUsername}.`);
                } else if (typeof gameData.initialFen === 'string') {
                    setStatusMessage(`Showing initial board for game ID ${gameData?.id || 'N/A'}.`);
                }
              }

              if (gameData && gameData.players && gameData.id) { // Check for id here too
                setGameDetails({
                  id: gameData.id,
                  players: gameData.players,
                  status: gameData.status,
                  speed: gameData.speed,
                  perf: gameData.perf,
                  variant: gameData.variant,
                  initialFen: gameData.initialFen, // Keep initialFen in details
                  fen: gameData.fen, // Keep current FEN if available
                });
              } else if (gameData && gameData.id && !gameFoundInStream) { 
                 setStatusMessage(`Receiving game update (ID: ${gameData.id}). Parsing details...`);
              }


            } catch (e: any) {
              setLastRawStreamObject(`Error parsing line as JSON: ${e.message}\nRaw Line: ${line}`);
              if (!gameFoundInStream) { 
                setStatusMessage(`Receiving non-JSON data or parse error. Waiting for structured game info...`);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // This is expected if the username changes or component unmounts
          setStatusMessage("Lichess stream aborted."); 
        } else {
          setStatusMessage(`Error fetching Lichess stream: ${err.message}`);
          setError(`Stream error: ${err.message}`);
          setPosition(DEFAULT_FEN);
          setGameFoundInStream(false);
        }
      }
    };

    if (boardWidth > 0) { // Ensure boardWidth is calculated before fetching
        fetchStream();
    }


    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
    };
  }, [isMounted, lichessUsername]); // Removed boardWidth from dependencies


  if (!isMounted || boardWidth === 0) {
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
            <CardHeader className="bg-card p-4 border-b border-border">
              <div className="flex items-center justify-center mb-2">
                <Tv className="h-7 w-7 text-accent mr-2" />
                <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
              </div>
              <CardDescription className="font-body text-sm text-center text-muted-foreground">
                Loading ChessTV...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 bg-card">
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2" style={{ minHeight: '280px' }}>
                 <Skeleton className="aspect-square w-full h-auto min-h-[280px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  const whitePlayerName = gameDetails?.players?.white?.user?.name || 'White';
  const blackPlayerName = gameDetails?.players?.black?.user?.name || 'Black';
  const gameInfoAvailable = !!(gameDetails && gameDetails.id && gameDetails.players); 

  return (
    <section id="chesstv" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-2">
              <Tv className="h-7 w-7 text-accent mr-2" />
              <CardTitle className="font-headline text-2xl text-center">ChessTV</CardTitle>
            </div>
             {gameInfoAvailable ? (
              <div className="font-body text-xs text-center text-muted-foreground space-y-0.5">
                <p>
                  <User className="inline h-3 w-3 mr-1" /> W: <strong>{whitePlayerName}</strong> 
                  {gameDetails?.players?.white?.rating && ` (${gameDetails.players.white.rating}${gameDetails.players.white.provisional ? '?' : ''})`}
                </p>
                <p>
                  <User className="inline h-3 w-3 mr-1" /> B: <strong>{blackPlayerName}</strong> 
                  {gameDetails?.players?.black?.rating && ` (${gameDetails.players.black.rating}${gameDetails.players.black.provisional ? '?' : ''})`}
                </p>
                <p className="text-xs capitalize pt-1">
                   {gameDetails?.variant && `${gameDetails.variant} `}
                   {gameDetails?.speed && `${gameDetails.speed} `} 
                   {gameDetails?.perf && `(${gameDetails.perf}) `}
                   - Status: {gameDetails?.status}
                </p>
              </div>
            ) : (
              <CardDescription className="font-body text-sm text-center text-muted-foreground">
                {statusMessage}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div
              ref={boardContainerRef}
              id="chess-tv-board-container"
              className="w-full max-w-[520px] mx-auto my-2 rounded-md overflow-hidden"
              style={{ minHeight: boardWidth > 0 ? `${boardWidth}px` : '280px' }}
            >
              {isMounted && boardWidth > 0 ? (
                <Chessboard
                  id="LichessTVBoard"
                  key={position + boardWidth} 
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
              ) : (
                <Skeleton className="aspect-square w-full h-auto min-h-[280px]" />
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {(!gameInfoAvailable && !error && statusMessage && !gameFoundInStream && lichessUsername) && (
                 <p className="font-body text-xs text-center text-muted-foreground mt-2 px-2">{statusMessage}</p>
             )}

            {lichessUsername && gameDetails?.id && ( 
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" asChild className="text-accent text-xs">
                  <a href={`https://lichess.org/${gameDetails.id}`} target="_blank" rel="noopener noreferrer">
                    View on Lichess <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            )}

            {lastRawStreamObject && (
              <div className="mt-4 p-2 border border-dashed border-muted-foreground rounded-md">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Last stream data chunk:</p>
                <ScrollArea className="h-[100px] w-full">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all p-1 bg-muted/50 rounded-sm">
                    {lastRawStreamObject}
                  </pre>
                </ScrollArea>
              </div>
            )}
            {!lastRawStreamObject && lichessUsername && !error && !gameFoundInStream && (
                <div className="mt-4 p-2 text-center">
                    <p className="text-xs text-muted-foreground">
                        <Info className="inline h-3 w-3 mr-1" />
                        Waiting for first data chunk from Lichess stream...
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

