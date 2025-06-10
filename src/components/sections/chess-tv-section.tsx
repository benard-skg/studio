
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

// Define style objects outside the component to ensure stable identity
const boardStyle = {
  borderRadius: '4px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};
const darkSquareStyle = { backgroundColor: '#B58863' };
const lightSquareStyle = { backgroundColor: '#F0D9B5' };


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
      setLastRawStreamObject(prev => `localStorage username: ${storedUsername}\n---\n${prev?.substring(0, 500)}`);
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
      // Optional: Add resize listener if dynamic resizing is needed
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
        setLastRawStreamObject(prev => `Stream effect: No lichessUsername. Resetting state.\n---\n${prev?.substring(0,500)}`);
      }
      return;
    }

    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      setLastRawStreamObject(prev => `Stream effect: Aborting previous stream controller.\n---\n${prev?.substring(0,500)}`);
    }
    streamControllerRef.current = new AbortController();
    const { signal } = streamControllerRef.current;

    setStatusMessage(`Attempting to connect to Lichess for ${lichessUsername}...`);
    
    // Reset gameFoundInStream for this new stream attempt, but not position/details
    // if a game was already found and we're just reconnecting/restarting stream for same user.
    // However, Lichess user changing should reset everything.
    // The setGameFoundInStream(false) is already handled if lichessUsername is null.
    // For a new username, we want to ensure a clean slate for gameFoundInStream.
    setGameFoundInStream(false); 
    // Don't reset position to DEFAULT_FEN immediately if a game was previously shown for this user.
    // setError(null); // Clear previous errors for this new attempt

    setLastRawStreamObject(prev => `Stream effect: Initializing fetch for ${lichessUsername}. gameFoundInStream state (before fetch): ${gameFoundInStream}\n---\n${prev?.substring(0,500)}`);
    
    let buffer = '';

    const fetchStream = async () => {
      let localGameFoundInStreamFlag = false; // Local flag for this specific fetch instance
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
          if (response.status === 404) errorMsg = `User "${lichessUsername}" not found or no ongoing games. Check username.`;
          setStatusMessage(errorMsg); setError(errorMsg);
          if (!gameFoundInStream) setPosition(DEFAULT_FEN);
          return;
        }
        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess."); setError("No response body from Lichess stream.");
          if (!gameFoundInStream) setPosition(DEFAULT_FEN);
          return;
        }

        setStatusMessage(`Connected to Lichess for ${lichessUsername}. Waiting for first data chunk...`);
        setLastRawStreamObject(prev => `Connected. Reader created. Waiting for stream data...\n---\n${prev?.substring(0,500)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        setLastRawStreamObject(prev => `Entering stream read loop...\n---\n${prev?.substring(0,500)}`);
        while (true) {
          setLastRawStreamObject(prev => `Loop iteration: Before reader.read()\n---\n${prev?.substring(0,500)}`);
          const { done, value } = await reader.read();
          const rawChunk = value ? decoder.decode(value, { stream: true }) : "";
          
          setLastRawStreamObject(prev => `reader.read() resolved. Done: ${done}. Value received: ${value ? 'Yes' : 'No'}\n---\n${prev?.substring(0,500)}`);
          if (rawChunk) {
             setLastRawStreamObject(prev => `Received chunk (first 100 chars): ${rawChunk.substring(0,100)}...\n---\n${prev?.substring(0,500)}`);
          }

          if (done) {
            setLastRawStreamObject(prev => `Stream ended (done=true). localGameFoundInStreamFlag: ${localGameFoundInStreamFlag}\n---\n${prev?.substring(0,500)}`);
            if (localGameFoundInStreamFlag) {
                setStatusMessage(`Lichess stream ended for ${lichessUsername}. Last processed game details may be shown.`);
            } else {
                setStatusMessage(`Stream ended. No game data was found for ${lichessUsername} in this session.`);
            }
            break;
          }
          
          buffer += rawChunk;
          const lines = buffer.split('\n'); 
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            let gameData: Partial<LichessGameData> | null = null;
            try {
              gameData = JSON.parse(line) as Partial<LichessGameData>;
              const loggableGameData = JSON.stringify(gameData, null, 2);
              setLastRawStreamObject(loggableGameData.substring(0, 1000) + (loggableGameData.length > 1000 ? "\n...(truncated)" : ""));

              if (gameData && gameData.id) {
                localGameFoundInStreamFlag = true; // Set local flag
                setGameFoundInStream(true); // Set React state

                let fenToSet: string | undefined = undefined;
                let fenSource: 'current' | 'initial' | null = null;

                if (typeof gameData.fen === 'string' && gameData.fen.trim() !== '') {
                  fenToSet = gameData.fen;
                  fenSource = 'current';
                } else if (typeof gameData.initialFen === 'string' && gameData.initialFen.trim() !== '') {
                  fenToSet = gameData.initialFen;
                  fenSource = 'initial';
                }

                if (fenToSet) {
                  setPosition(fenToSet);
                  // setGameFoundInStream(true); // Already set if gameData.id
                  setError(null); 
                }

                if (gameData.players?.white?.user && gameData.players?.black?.user) {
                  const newGameDetails = {
                    id: gameData.id,
                    players: gameData.players,
                    status: gameData.status,
                    speed: gameData.speed,
                    perf: gameData.perf,
                    variant: gameData.variant,
                    initialFen: gameData.initialFen,
                    fen: gameData.fen, 
                  };
                  setGameDetails(newGameDetails);
                  
                  if (fenSource === 'current') {
                      setStatusMessage(`Displaying live board for game ${gameData.id}.`);
                  } else if (fenSource === 'initial') {
                      setStatusMessage(`Displaying initial board for game ${gameData.id}.`);
                  } else { 
                      setStatusMessage(`Game details updated (ID: ${gameData.id}). Board shows last known FEN.`);
                  }
                } else if (localGameFoundInStreamFlag) { 
                   setStatusMessage(`Game update (ID: ${gameData.id}). Board may show last known FEN.`);
                }
              } else if (!localGameFoundInStreamFlag) { 
                setStatusMessage(`Received stream data. No recognized game ID yet.`);
              }

            } catch (e: any) {
              const errorLinePreview = line.substring(0, 200) + (line.length > 200 ? '...' : '');
              setLastRawStreamObject(prev => `Error parsing line as JSON: ${e.message}\nRaw Line: ${errorLinePreview}\n---\n${prev?.substring(0,500)}`);
              if (!localGameFoundInStreamFlag) {
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
          if (!localGameFoundInStreamFlag && !gameFoundInStream) setPosition(DEFAULT_FEN);
        }
      }
    };

    fetchStream();
    
    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
        setLastRawStreamObject(prev => `Stream effect cleanup: Aborted stream controller.\n---\n${prev?.substring(0,500)}`);
      }
    };
  }, [isMounted, lichessUsername]);


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
                 <p className="font-body text-xs text-center text-muted-foreground mt-1 px-2">{statusMessage}</p>
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
                  key={gameDetails?.id || lichessUsername || 'lichess-tv-board'} 
                  position={position}
                  boardWidth={boardWidth}
                  arePiecesDraggable={false}
                  animationDuration={200}
                  boardOrientation="white"
                  customBoardStyle={boardStyle}
                  customDarkSquareStyle={darkSquareStyle}
                  customLightSquareStyle={lightSquareStyle}
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
            
            {(!gameInfoAvailable && !error && lichessUsername && statusMessage && !statusMessage.toLowerCase().includes("displaying") && !statusMessage.toLowerCase().includes("connected") && !statusMessage.toLowerCase().includes("ended")) && (
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

