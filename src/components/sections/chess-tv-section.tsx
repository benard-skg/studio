
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
  const [gameFoundInStream, setGameFoundInStream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRawStreamObject, setLastRawStreamObject] = useState<string | null>("Log box initialized.");
  const [focusedGameId, setFocusedGameId] = useState<string | null>(null);

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
      setFocusedGameId(null);
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
      // Recalculate on resize for responsiveness
      window.addEventListener('resize', calculateSize);
      return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !lichessUsername) {
      setStatusMessage("No Lichess username. Set in Admin > Settings or user not playing.");
      setPosition(DEFAULT_FEN);
      setGameDetails({});
      setGameFoundInStream(false);
      setError(null);
      setFocusedGameId(null);
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
      return;
    }

    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    streamControllerRef.current = new AbortController();
    const { signal } = streamControllerRef.current;

    setStatusMessage(`Attempting to connect to Lichess TV for ${lichessUsername}...`);
    setGameFoundInStream(false); 
    setError(null);
    setGameDetails({}); 
    setFocusedGameId(null);
    
    setLastRawStreamObject(prev => `Stream effect: Initializing fetch for ${lichessUsername} (User TV Stream). focusedGameId reset.\n---\n${prev?.substring(0,500)}`);

    const fetchStream = async () => {
      let localGameFoundInStreamFlag = false;
      let currentFocusedGameId: string | null = null; 

      setLastRawStreamObject(prev => `fetchStream started for ${lichessUsername} (User TV Stream).\n---\n${prev?.substring(0,500)}`);
      try {
        //  NEW API ENDPOINT for User TV Stream
        const apiUrl = `https://lichess.org/api/tv/user/${lichessUsername}?pgnInJson=true&tags=true&moves=true&ongoing=true&nowPlaying=true`;
        setLastRawStreamObject(prev => `Fetching URL: ${apiUrl}\n---\n${prev?.substring(0,500)}`);
        
        const response = await fetch(apiUrl, {
          signal,
          headers: { 'Accept': 'application/x-ndjson' }
        });
        setLastRawStreamObject(prev => `Fetch response status: ${response.status}\n---\n${prev?.substring(0,500)}`);

        if (!response.ok) {
          let errorMsg = `Lichess API error: ${response.statusText} (Status: ${response.status})`;
          if (response.status === 404) errorMsg = `User "${lichessUsername}" not found or not currently on Lichess TV.`;
          setStatusMessage(errorMsg); setError(errorMsg);
          setPosition(DEFAULT_FEN); 
          return;
        }
        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess TV."); setError("No response body from Lichess TV stream.");
          setPosition(DEFAULT_FEN);
          return;
        }
        
        setStatusMessage(`Connected to Lichess TV for ${lichessUsername}. Waiting for game data...`);
        setLastRawStreamObject(prev => `Connected. Reader created. Waiting for stream data...\n---\n${prev?.substring(0,500)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        setLastRawStreamObject(prev => `Entering stream read loop...\n---\n${prev?.substring(0,500)}`);
        while (true) {
          setLastRawStreamObject(prev => `Loop iteration: Before reader.read()\n---\n${prev?.substring(0,500)}`);
          const { done, value } = await reader.read();
          const rawChunk = value ? decoder.decode(value, { stream: true }) : "";
          const truncatedChunkPreview = rawChunk.substring(0, 200) + (rawChunk.length > 200 ? "..." : "");
          setLastRawStreamObject(prev => `reader.read() resolved. Done: ${done}. Value received: ${value ? `Yes (chunk starts: ${truncatedChunkPreview})` : 'No'}\n---\n${prev?.substring(0,500)}`);
          
          if (done) {
            const finalStatus = localGameFoundInStreamFlag
              ? `Lichess TV stream ended for ${lichessUsername}. Last game (ID: ${currentFocusedGameId || 'N/A'}) details shown.`
              : `Stream ended. No specific game data found for ${lichessUsername} on Lichess TV in this session. Board shows default position.`;
            setStatusMessage(finalStatus);
            if (!localGameFoundInStreamFlag) setPosition(DEFAULT_FEN);
            setLastRawStreamObject(prev => `Stream ended (done=true). localGameFoundInStreamFlag: ${localGameFoundInStreamFlag}, focusedGameId in stream: ${currentFocusedGameId}\n---\n${prev?.substring(0,500)}`);
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

              if (gameData && gameData.id) {
                 if (!currentFocusedGameId) { 
                  currentFocusedGameId = gameData.id;
                  setFocusedGameId(gameData.id);
                  setLastRawStreamObject(prev => `Focusing on game ID: ${gameData?.id} from User TV stream.\n---\n${prev?.substring(0,500)}`);
                } else if (gameData.id !== currentFocusedGameId) {
                  setLastRawStreamObject(prev => `Skipping game ${gameData?.id} (focused on ${currentFocusedGameId})\n---\n${prev?.substring(0,500)}`);
                  continue; 
                }
                
                localGameFoundInStreamFlag = true; 
                setGameFoundInStream(true); 

                let fenToSet: string | undefined = undefined;
                if (typeof gameData.fen === 'string' && gameData.fen.trim() !== '') {
                  fenToSet = gameData.fen;
                } else if (typeof gameData.initialFen === 'string' && gameData.initialFen.trim() !== '') {
                  fenToSet = gameData.initialFen;
                }

                if (fenToSet) {
                  setPosition(fenToSet);
                  setError(null); 
                } else {
                  if (position === DEFAULT_FEN && gameData.id === currentFocusedGameId) {
                     setPosition(DEFAULT_FEN); 
                  }
                }
                
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
                  setStatusMessage(`Displaying details for focused game ${gameData.id}. Board: ${fenToSet ? 'Updated' : 'No FEN in this update'}.`);
                } else {
                  setGameDetails(prevDetails => ({ ...prevDetails, id: gameData.id, status: gameData.status, winner: gameData.winner }));
                  setStatusMessage(`Game update for focused game ${gameData.id}. Board: ${fenToSet ? 'Updated' : 'No FEN in this update'}. Player details might be partial.`);
                }

              } else if (!localGameFoundInStreamFlag && !currentFocusedGameId) { 
                setStatusMessage(`Received User TV stream data. Waiting for first game ID to focus on... Board shows default position.`);
                setPosition(DEFAULT_FEN);
              }

            } catch (e: any) {
              const errorLinePreview = line.substring(0, 200) + (line.length > 200 ? '...' : '');
              setLastRawStreamObject(prev => `Error parsing line: ${e.message}\nRaw Line: ${errorLinePreview}\n---\n${prev?.substring(0,500)}`);
              if (!localGameFoundInStreamFlag && !currentFocusedGameId) {
                setStatusMessage(`User TV stream data parse error. Waiting for valid game info... Board shows default position.`);
                setPosition(DEFAULT_FEN);
              }
            }
          }
        }
      } catch (err: any) {
        setLastRawStreamObject(prev => `Error in fetchStream (User TV): ${err.name} - ${err.message}\n---\n${prev?.substring(0,500)}`);
        if (err.name === 'AbortError') {
          setStatusMessage("Lichess User TV stream aborted.");
        } else {
          setStatusMessage(`Error fetching Lichess User TV stream: ${err.message}`);
          setError(`Stream error: ${err.message}`);
          if (!localGameFoundInStreamFlag) setPosition(DEFAULT_FEN);
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


  const whitePlayerName = gameDetails?.players?.white?.user?.name || 'White';
  const blackPlayerName = gameDetails?.players?.black?.user?.name || 'Black';
  
  const displayGameId = focusedGameId || gameDetails?.id; 
  const gameInfoAvailable = gameFoundInStream && displayGameId && gameDetails?.players?.white?.user && gameDetails?.players?.black?.user;

  let headerStatusMessage = statusMessage;
  if (gameInfoAvailable) {
    if (position !== DEFAULT_FEN) {
      headerStatusMessage = `Displaying ${gameDetails.fen ? 'live' : 'initial'} board for game ${displayGameId}.`;
    } else {
      headerStatusMessage = `Game details for ${displayGameId} shown. Board shows default position (no FEN in stream).`;
    }
  } else if (lichessUsername && !gameFoundInStream && !error && (statusMessage.startsWith("Attempting") || statusMessage.startsWith("Connected"))) {
     headerStatusMessage = `Connected to Lichess TV for ${lichessUsername}. Waiting for game data...`;
  } else if (!lichessUsername) {
    headerStatusMessage = "No Lichess username. Set in Admin > Settings.";
  }


  return (
    <section id="chesstv" className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto shadow-xl border-border overflow-hidden">
          <CardHeader className="bg-card p-4 border-b border-border">
            <div className="flex items-center justify-center mb-2">
              <Tv className="h-7 w-7 text-accent mr-2" />
              <CardTitle className="font-headline text-2xl text-center">Lichess User TV</CardTitle>
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
            
            {gameInfoAvailable && position === DEFAULT_FEN && (
              <div className="mt-2 p-2 bg-muted/70 border border-dashed border-border rounded-md text-xs text-muted-foreground text-center flex items-center justify-center">
                <Info className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                Board shows default position. Live FEN not in this stream update for game details above.
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {gameFoundInStream && displayGameId && ( 
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" asChild className="text-accent text-xs">
                  <a href={`https://lichess.org/${displayGameId}`} target="_blank" rel="noopener noreferrer">
                    View Game ({displayGameId}) on Lichess <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            )}
             {!gameFoundInStream && lichessUsername && position === DEFAULT_FEN && !error && (
                <div className="mt-2 p-2 bg-muted/70 border border-dashed border-border rounded-md text-xs text-muted-foreground text-center flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    <span>Waiting for {lichessUsername}'s game data from Lichess TV...</span>
                </div>
            )}


            {lichessUsername && ( 
              <div className="mt-4 p-2 border border-dashed border-muted-foreground rounded-md">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Stream Log (User TV):</p>
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

    
