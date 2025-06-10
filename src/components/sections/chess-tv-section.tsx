
"use client";

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tv, User, AlertCircle, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const LICHESS_USERNAME_KEY = 'lichessTvUsername';

interface LichessUser {
  name: string;
  id: string;
  rating?: number;
}
interface LichessPlayer {
  user?: LichessUser; // User can be undefined for AI or anonymous games
  rating?: number;
}
interface LichessGameData {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  status: string;
  fen: string;
  players: {
    white: LichessPlayer;
    black: LichessPlayer;
  };
  // Add other fields if needed
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
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      setLichessUsername(storedUsername);
      setStatusMessage(`Lichess username "${storedUsername}" loaded.`);
    } else {
      setStatusMessage("No Lichess username set. Please configure in Admin > Settings.");
      setPosition(DEFAULT_FEN);
      setGameDetails(null);
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
      // window.addEventListener('resize', calculateSize);
      // return () => window.removeEventListener('resize', calculateSize);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !lichessUsername || boardWidth === 0) {
      if (isMounted && !lichessUsername) {
        setStatusMessage("No Lichess username set for ChessTV.");
        setPosition(DEFAULT_FEN);
        setGameDetails(null);
        setGameFoundInStream(false);
      }
      return;
    }

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
    let buffer = '';

    const fetchStream = async () => {
      try {
        const response = await fetch(
          `https://lichess.org/api/games/user/${lichessUsername}?ongoing=true&moves=false&pgnInJson=false&tags=true&clocks=false&evals=false&opening=false&literate=true`,
          { signal }
        );

        if (!response.ok) {
          if (response.status === 404) {
             setStatusMessage(`User "${lichessUsername}" not found or no ongoing games.`);
             setError(`Lichess user "${lichessUsername}" not found or no games in progress.`);
          } else {
            setStatusMessage(`Error connecting to Lichess: ${response.status}`);
            setError(`Lichess API error: ${response.statusText} (Status: ${response.status})`);
          }
          setPosition(DEFAULT_FEN);
          return;
        }

        if (!response.body) {
          setStatusMessage("Failed to get readable stream from Lichess.");
          setError("No response body from Lichess stream.");
          setPosition(DEFAULT_FEN);
          return;
        }
        
        setStatusMessage(`Connected to Lichess for ${lichessUsername}. Waiting for game data...`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (!gameFoundInStream) {
              setStatusMessage(`No live games found for ${lichessUsername} currently.`);
            } else {
              setStatusMessage(`Stream ended for ${lichessUsername}.`);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n'); // Corrected: split by actual newline
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const gameData = JSON.parse(line) as LichessGameData;
              if (gameData && gameData.fen && gameData.id && gameData.players) {
                if (!gameFoundInStream) {
                  setStatusMessage(`Live game found for ${lichessUsername}.`);
                  setGameFoundInStream(true);
                }
                setPosition(gameData.fen);
                setGameDetails({
                  id: gameData.id,
                  players: gameData.players,
                  status: gameData.status,
                  speed: gameData.speed,
                  perf: gameData.perf,
                });
                setError(null);
              }
            } catch (e) {
              console.warn("Error parsing NDJSON line:", e, "Line:", line);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setStatusMessage("Lichess stream aborted.");
        } else {
          setStatusMessage(`Error fetching Lichess stream: ${err.message}`);
          setError(`Stream error: ${err.message}`);
          setPosition(DEFAULT_FEN);
        }
      }
    };

    fetchStream();

    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
    };
  }, [isMounted, lichessUsername, boardWidth]);


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
              <div ref={boardContainerRef} className="w-full max-w-[520px] mx-auto my-2" style={{ minHeight: '300px' }}>
                 <Skeleton className="aspect-square w-full h-auto min-h-[280px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
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
             {gameDetails?.players ? (
              <div className="font-body text-xs text-center text-muted-foreground space-y-0.5">
                <p>
                  <User className="inline h-3 w-3 mr-1" /> W: <strong>{gameDetails.players.white?.user?.name || 'N/A'}</strong> 
                  {gameDetails.players.white?.rating && ` (${gameDetails.players.white.rating})`}
                </p>
                <p>
                  <User className="inline h-3 w-3 mr-1" /> B: <strong>{gameDetails.players.black?.user?.name || 'N/A'}</strong> 
                  {gameDetails.players.black?.rating && ` (${gameDetails.players.black.rating})`}
                </p>
                <p className="text-xs capitalize pt-1">
                  {gameDetails.speed} {gameDetails.perf} - Status: {gameDetails.status}
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
              style={{ minHeight: boardWidth > 0 ? `${boardWidth}px` : '300px' }}
            >
              <Chessboard
                id="LichessTVBoard"
                key={position} 
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
            </div>
            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                <p>{error}</p>
              </div>
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
            {/* Show status message at the bottom only if a game is not yet found or there's no username */}
            {lichessUsername && !gameFoundInStream && !error && statusMessage && (
                 <p className="font-body text-xs text-center text-muted-foreground mt-2 px-2">{statusMessage}</p>
             )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

