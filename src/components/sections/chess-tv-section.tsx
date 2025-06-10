
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

// Define style objects outside the component for stable references
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
  const [gameDetails, setGameDetails] = useState<Partial<LichessGameData>>({});
  const [gameFoundInStream, setGameFoundInStream] = useState(false); // True if any valid game object with an ID is processed
  const [error, setError] = useState<string | null>(null);
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
      setGameDetails({});
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
        setGameDetails({});
        setGameFoundInStream(false);
        setError(null);
        setLastRawStreamObject(prev => `Stream effect: No lichessUsername. Resetting state.\n---\n${prev?.substring(0,500)}`);
      }
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
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
    setGameFoundInStream(false); 
    setError(null);
    // Do not reset position to DEFAULT_FEN here if a game was previously found, 
    // allow it to persist until a new FEN comes or stream ends without a game.
    // setPosition(DEFAULT_FEN); 
    setGameDetails({});

    setLastRawStreamObject(prev => `Stream effect: Initializing fetch for ${lichessUsername}. gameFoundInStream state (before fetch): ${gameFoundInStream}\n---\n${prev?.substring(0,500)}`);
    
    const fetchStream = async () => {
      let localGameFoundInStreamFlag = false; 
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
          if (!gameFoundInStream && !localGameFoundInStreamFlag) setPosition(DEFAULT_FEN); 
          return;
        }
        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess."); setError("No response body from Lichess stream.");
          if (!gameFoundInStream && !localGameFoundInStreamFlag) setPosition(DEFAULT_FEN);
          return;
        }

        setStatusMessage(`Connected to Lichess for ${lichessUsername}. Waiting for first data chunk...`);
        setLastRawStreamObject(prev => `Connected. Reader created. Waiting for stream data...\n---\n${prev?.substring(0,500)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        setLastRawStreamObject(prev => `Entering stream read loop...\n---\n${prev?.substring(0,500)}`);
        while (true) {
          setLastRawStreamObject(prev => `Loop iteration: Before reader.read()\n---\n${prev?.substring(0,500)}`);
          const { done, value } = await reader.read();
          setLastRawStreamObject(prev => `reader.read() resolved. Done: ${done}. Value received: ${value ? 'Yes' : 'No'}\n---\n${prev?.substring(0,500)}`);
          
          const rawChunk = value ? decoder.decode(value, { stream: true }) : "";
          if (rawChunk) {
             setLastRawStreamObject(prev => `Received chunk (first 100 chars): ${rawChunk.substring(0,100)}...\n---\n${prev?.substring(0,500)}`);
          }


          if (done) {
            const finalStatus = localGameFoundInStreamFlag 
                ? `Lichess stream ended for ${lichessUsername}. Last game details shown.`
                : `Stream ended. No specific game data found for ${lichessUsername} in this session. Board shows default position.`;
            setStatusMessage(finalStatus);
            if (!localGameFoundInStreamFlag) setPosition(DEFAULT_FEN); // If no game was ever found, ensure board is default
            setLastRawStreamObject(prev => `Stream ended (done=true). localGameFoundInStreamFlag: ${localGameFoundInStreamFlag}\n---\n${prev?.substring(0,500)}`);
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
              const loggableGameData = JSON.stringify(gameData, null, 0); 
              setLastRawStreamObject(loggableGameData.substring(0, 1000) + (loggableGameData.length > 1000 ? "\n...(truncated)" : ""));

              if (gameData && gameData.id) { // Process if we have a game ID
                localGameFoundInStreamFlag = true; 
                setGameFoundInStream(true); 

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
                  setError(null); 
                } else if (!fenToSet && localGameFoundInStreamFlag) {
                  // If we've identified a game but this specific update lacks a FEN,
                  // we don't change the board from its current state (could be previous FEN or default)
                  // but we still update game details.
                }


                // Always update game details if players info is present
                if (gameData.players?.white?.user && gameData.players?.black?.user) {
                  const newGameDetails = {
                    id: gameData.id,
                    players: gameData.players,
                    status: gameData.status,
                    speed: gameData.speed,
                    perf: gameData.perf,
                    variant: gameData.variant,
                    winner: gameData.winner,
                  };
                  setGameDetails(newGameDetails); 
                  
                  if (fenSource === 'current') {
                      setStatusMessage(`Displaying live board for game ${gameData.id}.`);
                  } else if (fenSource === 'initial') {
                      setStatusMessage(`Displaying initial board for game ${gameData.id}.`);
                  } else {
                       setStatusMessage(`Received game details (ID: ${gameData.id}), but no FEN in this update. Board may show previous or default position.`);
                       // If no FEN was *ever* set for *any* game in this stream session, and this object doesn't have one,
                       // ensure board is default. Otherwise, keep current position.
                       if (!position || position === DEFAULT_FEN) setPosition(DEFAULT_FEN);
                  }
                } else {
                   setStatusMessage(`Game update (ID: ${gameData.id}). Board may show last known FEN or default.`);
                }
              } else if (!localGameFoundInStreamFlag) { 
                setStatusMessage(`Received stream data. No recognized game ID yet. Board shows default position.`);
                setPosition(DEFAULT_FEN);
              }

            } catch (e: any) {
              const errorLinePreview = line.substring(0, 200) + (line.length > 200 ? '...' : '');
              setLastRawStreamObject(prev => `Error parsing line as JSON: ${e.message}\nRaw Line: ${errorLinePreview}\n---\n${prev?.substring(0,500)}`);
              if (!localGameFoundInStreamFlag) { 
                setStatusMessage(`Stream data parse error. Waiting for valid game info... Board shows default position.`);
                setPosition(DEFAULT_FEN);
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
  const gameInfoAvailable = gameFoundInStream && gameDetails?.id && gameDetails?.players?.white?.user && gameDetails?.players?.black?.user;
  
  let headerStatusMessage = statusMessage;
  if (gameInfoAvailable) {
    if (position !== DEFAULT_FEN) {
      headerStatusMessage = `Displaying ${gameDetails.fen ? 'live' : 'initial'} board for game ${gameDetails.id}.`;
    } else {
      headerStatusMessage = `Game details for ${gameDetails.id} shown. Board shows default position (no FEN in stream).`;
    }
  }


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
                   - Status: {gameDetails?.status || "Ongoing"}
                   {gameDetails?.winner && ` - Winner: ${gameDetails.winner}`}
                </p>
                 <p className="font-body text-xs text-center text-muted-foreground mt-1 px-2">{headerStatusMessage}</p>
              </div>
            ) : (
              <CardDescription className="font-body text-sm text-center text-muted-foreground">
                {headerStatusMessage}
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
                  key="lichess-tv-static-key" 
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
            
            {gameFoundInStream && gameDetails?.id && ( 
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

