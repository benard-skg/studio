
"use client";

import { useEffect, useState, useRef } from 'react';
import { ChessBoard } from 'kokopu-react';
import { Chess } from 'chess.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Tv } from 'lucide-react';
import ChessTVSectionLoader from './chess-tv-section-loader';

const LICHESS_USERNAME_KEY = 'lichessTvUsername';
const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Standard starting FEN

export default function ChessTVSection() {
  const [lichessUsername, setLichessUsername] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [fen, setFen] = useState<string | null>(DEFAULT_FEN); // Default to starting position
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing ChessTV...");
  const chessJsInstance = useRef(new Chess());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      console.log('[ChessTV] Found username in localStorage:', storedUsername);
      setLichessUsername(storedUsername);
    } else {
      console.log('[ChessTV] No username found in localStorage.');
      setStatusMessage("Lichess username not set for live games. Configure in Admin Settings.");
      setIsLoading(false);
      setFen(DEFAULT_FEN); // Ensure default FEN is set if no username
    }
  }, []);

  useEffect(() => {
    if (!lichessUsername) {
      // If username becomes null after being set (e.g., cleared from admin), reset to default
      if (isLoading && !localStorage.getItem(LICHESS_USERNAME_KEY)) { // only if still in initial loading phase without a username
         setStatusMessage("Lichess username not set for live games. Configure in Admin Settings.");
         setIsLoading(false);
      }
      setFen(DEFAULT_FEN);
      setGameData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    // Don't reset FEN to null here, keep DEFAULT_FEN until a game is found
    // setFen(DEFAULT_FEN); // Keep this or allow it to be overridden by live game
    setGameData(null);
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
                setFen(DEFAULT_FEN); // Explicitly set to default if no game found
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\\n');
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const jsonData = JSON.parse(line);
              console.log('[ChessTV] Received JSON data chunk:', jsonData);
              
              if (jsonData.fen) { // Check if the current chunk has FEN
                if (!gameFound) { // First game object with FEN
                    console.log('[ChessTV] First game data with FEN received:', jsonData);
                    setGameData(jsonData);
                    setFen(jsonData.fen);
                    chessJsInstance.current = new Chess(jsonData.fen);
                    setStatusMessage("Live game feed active.");
                    gameFound = true;
                } else if (gameData && jsonData.id === gameData.id) { // Subsequent FEN update for the *same* game
                    console.log('[ChessTV] FEN updated for current game:', jsonData.fen);
                    setFen(jsonData.fen);
                    chessJsInstance.current.load(jsonData.fen);
                }
                 // If it's a new game ID, we are sticking to the first game found in this model.
              } else if (!gameFound && jsonData.id && jsonData.players) {
                // Received a game object but maybe no FEN yet, or it's just general game info.
                // Store it if it's the first one, hoping a FEN might come or it's a completed game summary.
                console.log('[ChessTV] Received game data (no FEN in this chunk):', jsonData);
                setGameData(jsonData); // Store game data
                setStatusMessage("Game info received, waiting for FEN or displaying initial state.");
                // Keep fen as DEFAULT_FEN or last known FEN until a new one arrives
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
          setFen(DEFAULT_FEN);
          return;
        }
        console.error('[ChessTV] Error fetching or processing stream:', err);
        setError(err.message || 'Failed to fetch or process Lichess stream.');
        setStatusMessage(`Error: ${err.message || 'Failed to connect.'}`);
        setFen(DEFAULT_FEN); // Revert to default FEN on error
      } finally {
        setIsLoading(false);
        if (!gameFound && !error && lichessUsername) {
             setStatusMessage( prevStatus => prevStatus.startsWith("Error") ? prevStatus : `No active games currently found for ${lichessUsername}. Displaying default board.`);
             setFen(DEFAULT_FEN); // Ensure default FEN if no game and no error
        } else if (!lichessUsername && !error) {
            setStatusMessage("Lichess username not set. Displaying default board.");
            setFen(DEFAULT_FEN);
        }
      }
    };

    fetchStream();

    return () => {
      console.log('[ChessTV] Cleaning up ChessTVSection effect. Aborting fetch.');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [lichessUsername]);


  if (isLoading) {
     return <ChessTVSectionLoader />;
  }

  if (error && !lichessUsername) { // If error occurred before username was even processed
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-lg mx-auto shadow-lg border-destructive bg-destructive/10">
            <CardHeader className="text-center">
              <Tv className="mx-auto h-10 w-10 text-destructive mb-2" />
              <CardTitle className="font-headline text-3xl text-destructive">ChessTV Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center font-body py-8 text-destructive">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{statusMessage}</p>
              </div>
               <p className="text-xs mt-2">{error}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  // Game details (only show if gameData is available)
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
              {fen ? (
                <ChessBoard fen={fen} />
              ) : ( /* This fallback should ideally not be hit if isLoading is false and FEN defaults */
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="ml-2 font-body">Loading board...</p>
                </div>
              )}
            </div>
            <div className="font-body text-sm mt-3 px-1">
              {gameData && whitePlayer && blackPlayer && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">White:</span>
                    <span className="text-muted-foreground truncate">{whitePlayer}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Black:</span>
                    <span className="text-muted-foreground truncate">{blackPlayer}</span>
                  </div>
                </>
              )}
              {gameData && gameStatus && (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Status:</span>
                  <span className="text-muted-foreground capitalize">{gameStatus}</span>
                </div>
              )}
              {!gameData && statusMessage && (
                 <div className="text-center text-muted-foreground py-2 text-xs">
                    <p>{statusMessage}</p>
                    {error && <p className="text-destructive mt-1">Details: {error}</p>}
                 </div>
              )}
              {gameUrl && (
                <a 
                    href={gameUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full text-center text-xs text-accent hover:underline py-1"
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

    