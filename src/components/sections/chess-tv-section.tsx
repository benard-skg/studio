
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
  const [lastRawStreamObject, setLastRawStreamObject] = useState<string | null>("Log box initialized.");

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
      setLastRawStreamObject("No Lichess username found in localStorage.");
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

    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    streamControllerRef.current = new AbortController();
    const { signal } = streamControllerRef.current;

    setStatusMessage(`Attempting to connect to Lichess for ${lichessUsername}...`);
    if (!gameFoundInStream) setPosition(DEFAULT_FEN); // Only reset if no game was ever found this session
    setGameDetails(null); 
    setError(null);
    // Do not reset gameFoundInStream here, let it persist if a game was previously found
    
    let buffer = '';

    const fetchStream = async () => {
      setLastRawStreamObject(prev => `fetchStream started for ${lichessUsername}.\n---\n${prev?.substring(0,500)}`);
      try {
        const apiUrl = `https://lichess.org/api/games/user/${lichessUsername}?ongoing=true&pgnInJson=true&tags=true&moves=true`;
        setLastRawStreamObject(prev => `Fetching URL: ${apiUrl}\n---\n${prev?.substring(0,500)}`);
        
        const response = await fetch(apiUrl, {
          signal,
          headers: { 'Accept': 'application/x-ndjson' }
        });
        setLastRawStreamObject(prev => `Fetch response status: ${response.status}\n---\n${prev?.substring(0,500)}`);

        if (!response.ok) {
          let errorMsg = `Lichess API error: ${response.statusText} (Status: ${response.status})`;
          if (response.status === 404) errorMsg = `User "${lichessUsername}" not found or no ongoing games.`;
          setStatusMessage(errorMsg); setError(errorMsg);
          if (!gameFoundInStream) setPosition(DEFAULT_FEN);
          return;
        }
        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess."); setError("No response body from Lichess stream.");
          if (!gameFoundInStream) setPosition(DEFAULT_FEN);
          return;
        }

        setStatusMessage(`Connected to Lichess for ${lichessUsername}. Waiting for game data...`);
        setLastRawStreamObject(prev => `Connected. Reader created. Waiting for stream data...\n---\n${prev?.substring(0,500)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        setLastRawStreamObject(prev => `Entering stream read loop...\n---\n${prev?.substring(0,500)}`);
        while (true) {
          setLastRawStreamObject(prev => `Loop iteration: Before reader.read()\n---\n${prev?.substring(0,500)}`);
          const { done, value } = await reader.read();
          setLastRawStreamObject(prev => `reader.read() resolved. Done: ${done}. Value received: ${value ? 'Yes' : 'No'}\n---\n${prev?.substring(0,500)}`);

          if (done) {
            setLastRawStreamObject(prev => `Stream ended (done=true). gameFoundInStream: ${gameFoundInStream}\n---\n${prev?.substring(0,500)}`);
            if (!gameFoundInStream) {
              setStatusMessage(`Stream ended. No specific game FEN found for ${lichessUsername} in this session.`);
            } else {
              setStatusMessage(`Stream ended for ${lichessUsername}. Last processed game state shown.`);
            }
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          // Log raw chunk before buffer processing for immediate feedback
          setLastRawStreamObject(prev => `Received chunk (first 100 chars): ${chunk.substring(0,100)}...\n---\n${prev?.substring(0,500)}`);
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            let gameData: Partial<LichessGameData> | null = null;
            try {
              gameData = JSON.parse(line) as Partial<LichessGameData>;
              const loggableGameData = JSON.stringify(gameData, null, 2);
              setLastRawStreamObject(loggableGameData.substring(0, 1000) + (loggableGameData.length > 1000 ? "\n...(truncated)" : ""));

              let fenToSet: string | undefined = undefined;
              let fenSource: 'current' | 'initial' | null = null;

              if (gameData && typeof gameData.fen === 'string' && gameData.fen.trim() !== '') {
                fenToSet = gameData.fen;
                fenSource = 'current';
              } else if (gameData && typeof gameData.initialFen === 'string' && gameData.initialFen.trim() !== '') {
                fenToSet = gameData.initialFen;
                fenSource = 'initial';
              }

              if (fenToSet) {
                setPosition(fenToSet);
                setGameFoundInStream(true); 
                setError(null); 
              }

              if (gameData && gameData.id && gameData.players?.white?.user && gameData.players?.black?.user) {
                setGameDetails({
                  id: gameData.id,
                  players: gameData.players,
                  status: gameData.status,
                  speed: gameData.speed,
                  perf: gameData.perf,
                  variant: gameData.variant,
                  initialFen: gameData.initialFen,
                  fen: gameData.fen,
                });
                 if (fenSource === 'current') {
                    setStatusMessage(`Displaying live board for game ${gameData.id}.`);
                } else if (fenSource === 'initial') {
                    setStatusMessage(`Displaying initial board for game ${gameData.id}.`);
                } else if (gameFoundInStream) {
                    setStatusMessage(`Game details updated (ID: ${gameData.id}). Board shows last FEN.`);
                } else {
                     setStatusMessage(`Received game data (ID: ${gameData.id}), awaiting FEN...`);
                }
              } else if (gameData && gameData.id && !gameFoundInStream) {
                 setStatusMessage(`Processing game (ID: ${gameData.id}). Looking for FEN/Player details...`);
              } else if ((!gameData || !gameData.id) && !gameFoundInStream) {
                setStatusMessage(`Received stream data. No recognized game ID yet.`);
              }

            } catch (e: any) {
              const errorLinePreview = line.substring(0, 200) + (line.length > 200 ? '...' : '');
              setLastRawStreamObject(prev => `Error parsing line as JSON: ${e.message}\nRaw Line: ${errorLinePreview}\n---\n${prev?.substring(0,500)}`);
              if (!gameFoundInStream) { 
                setStatusMessage(`Stream data parse error. Waiting for valid game info...`);
              }
            }
          }
        }
      } catch (err: any) {
        setLastRawStreamObject(prev => `Error in fetchStream: ${err.name} - ${err.message}\n---\n${prev?.substring(0,500)}`);
        if (err.name === 'AbortError') {
          setStatusMessage("Lichess stream aborted.");
        } else {
          setStatusMessage(`Error fetching Lichess stream: ${err.message}`);
          setError(`Stream error: ${err.message}`);
          if (!gameFoundInStream) setPosition(DEFAULT_FEN);
        }
      }
    };

    if (boardWidth > 0) { // Ensure board width is calculated before fetching
        fetchStream();
    }

    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
    };
  }, [isMounted, lichessUsername, boardWidth]); // Re-added boardWidth as dep as fetchStream depends on it implicitly for responsiveness


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
  const gameInfoAvailable = !!(gameDetails && gameDetails.id && gameDetails.players?.white?.user && gameDetails.players?.black?.user);

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
                  key={position + boardWidth + (gameDetails?.id || 'defaultgame')} 
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
            
            {(!gameInfoAvailable && !error && lichessUsername && statusMessage) && (
                 <p className="font-body text-xs text-center text-muted-foreground mt-2 px-2">{statusMessage}</p>
             )}


            {lichessUsername && gameDetails?.id && (
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" asChild className="text-accent text-xs">
                  <a href={`https://lichess.org/${gameDetails.id}`} target="_blank" rel="noopener noreferrer">
                    View Game ({gameDetails.id}) on Lichess <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            )}

            {lichessUsername && ( 
              <div className="mt-4 p-2 border border-dashed border-muted-foreground rounded-md">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Stream Log:</p>
                <ScrollArea className="h-[100px] w-full">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all p-1 bg-muted/50 rounded-sm">
                    {lastRawStreamObject || "No data received yet..."}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

