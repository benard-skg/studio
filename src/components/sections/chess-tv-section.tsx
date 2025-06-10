
"use client";

import { useEffect, useState, useRef } from 'react';
import { ChessBoard } from 'kokopu-react';
import { Chess } from 'chess.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Tv } from 'lucide-react';
import ChessTVSectionLoader from './chess-tv-section-loader';
import { Skeleton } from '@/components/ui/skeleton';

const LICHESS_USERNAME_KEY = 'lichessTvUsername';
const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessTVSection() {
  const [lichessUsername, setLichessUsername] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [fen, setFen] = useState<string>(DEFAULT_FEN); // Initialize with default FEN
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing ChessTV...");
  const chessJsInstance = useRef(new Chess());
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Component has mounted on client
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      console.log('[ChessTV] Found username in localStorage:', storedUsername);
      setLichessUsername(storedUsername);
      // setIsLoading(true) will be handled by the next useEffect if username is set
    } else {
      console.log('[ChessTV] No username found in localStorage.');
      setStatusMessage("Lichess username not set. Configure in Admin Settings.");
      setFen(DEFAULT_FEN);
      setIsLoading(false); // No username, so initial loading is done.
    }
  }, []);

  useEffect(() => {
    if (!lichessUsername) {
      // This handles the case where username is not set or cleared.
      // Ensure UI reflects default state if no username.
      if (isMounted) { // Only update state if component is mounted to avoid SSR issues with setIsLoading
          setStatusMessage("Lichess username not set. Configure in Admin Settings.");
          setFen(DEFAULT_FEN);
          setGameData(null);
          setIsLoading(false); // No username means no stream to load.
      }
      return; // Do not proceed to fetch if no username
    }

    // Username is set, proceed to fetch.
    setIsLoading(true);
    setError(null);
    setGameData(null);
    // fen can remain DEFAULT_FEN until a game FEN is actually received
    setStatusMessage(`Attempting to connect to Lichess for ${lichessUsername}...`);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchStream = async () => {
      try {
        console.log(`[ChessTV] Fetching games for user: ${lichessUsername}`);
        const response = await fetch(
          `https://lichess.org/api/games/user/${lichessUsername}?ongoing=true&pgnInJson=true&opening=true&tags=true`,
          { signal }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[ChessTV] Lichess API error: ${response.status}`, errorText);
          throw new Error(`Lichess API Error: ${response.status}. ${errorText.substring(0, 100)}`);
        }
        if (!response.body) {
          console.error('[ChessTV] Response body is null.');
          throw new Error('No response body from Lichess API.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let gameFound = false;

        setStatusMessage(`Connected. Waiting for game data for ${lichessUsername}...`);

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[ChessTV] Stream finished.');
            if (!gameFound) {
                setStatusMessage(`No ongoing games found for ${lichessUsername}. Displaying default board.`);
                setFen(DEFAULT_FEN);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\\n'); // Lichess NDJSON uses \n
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const jsonData = JSON.parse(line);
              console.log('[ChessTV] Received JSON data chunk:', jsonData);
              
              if (jsonData.fen) {
                if (!gameFound) {
                    console.log('[ChessTV] First game data with FEN received:', jsonData);
                    setGameData(jsonData);
                    setFen(jsonData.fen);
                    chessJsInstance.current = new Chess(jsonData.fen);
                    setStatusMessage("Live game feed active.");
                    gameFound = true;
                } else if (gameData && jsonData.id === gameData.id) {
                    console.log('[ChessTV] FEN updated for current game:', jsonData.fen);
                    setFen(jsonData.fen);
                    chessJsInstance.current.load(jsonData.fen);
                }
              } else if (!gameFound && jsonData.id && jsonData.players) {
                console.log('[ChessTV] Received game data (no FEN in this chunk):', jsonData);
                setGameData(jsonData);
                setStatusMessage("Game info received, FEN may follow or showing initial state.");
              }
            } catch (e) {
              console.warn('[ChessTV] Failed to parse NDJSON line:', line, e);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[ChessTV] Fetch aborted');
          setStatusMessage("Stream connection closed. Displaying default board.");
        } else {
          console.error('[ChessTV] Error fetching or processing stream:', err);
          setError(err.message || 'Failed to fetch or process Lichess stream.');
          setStatusMessage(`Error: ${err.message || 'Failed to connect.'}`);
        }
        setFen(DEFAULT_FEN); // Revert to default FEN on error or abort
      } finally {
        setIsLoading(false);
        if (!gameFound && !error && lichessUsername) { // Check lichessUsername here
             setStatusMessage( prevStatus => prevStatus.startsWith("Error") ? prevStatus : `No active games currently found for ${lichessUsername}. Displaying default board.`);
             setFen(DEFAULT_FEN);
        }
      }
    };

    fetchStream();

    return () => {
      console.log('[ChessTV] Cleaning up ChessTVSection stream effect. Aborting fetch.');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [lichessUsername, isMounted]); // isMounted ensures this effect runs after client mount if username is already set from localStorage


  if (isLoading || !isMounted) { // Show loader if still loading or not yet mounted
     return <ChessTVSectionLoader />;
  }
  
  const whitePlayer = gameData?.players?.white?.user?.name || gameData?.players?.white?.userId;
  const blackPlayer = gameData?.players?.black?.user?.name || gameData?.players?.black?.userId;
  const gameStatus = gameData?.status;
  const gameUrl = gameData?.id ? `https://lichess.org/${gameData.id}` : null;

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
              {lichessUsername ? `Live from Lichess: ${lichessUsername}` : "Live Lichess Games"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div className="aspect-square w-full max-w-[400px] sm:max-w-[480px] md:max-w-[520px] mx-auto my-2 rounded-md overflow-hidden shadow-inner border border-border/50">
              {isMounted && fen ? (
                <ChessBoard fen={fen} />
              ) : (
                <Skeleton className="aspect-square w-full h-full" /> // Placeholder while board mounts
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1 text-center">
              {error && (
                <div className="flex items-center justify-center text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{statusMessage}</p>
                </div>
              )}
              {!error && gameData && whitePlayer && blackPlayer && (
                <>
                  <div className="flex justify-between items-center mb-1 px-2">
                    <span className="font-semibold text-foreground">White:</span>
                    <span className="text-muted-foreground truncate">{whitePlayer}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 px-2">
                    <span className="font-semibold text-foreground">Black:</span>
                    <span className="text-muted-foreground truncate">{blackPlayer}</span>
                  </div>
                </>
              )}
              {!error && gameData && gameStatus && (
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="font-semibold text-foreground">Status:</span>
                  <span className="text-muted-foreground capitalize">{gameStatus}</span>
                </div>
              )}
              {!error && !gameData && ( // This covers "no username" or "no active game"
                 <div className="text-muted-foreground py-2 text-xs">
                    <p>{statusMessage}</p>
                 </div>
              )}
              {gameUrl && (
                <a 
                    href={gameUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full text-center text-xs text-accent hover:underline py-1 mt-1"
                >
                    View on Lichess
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
