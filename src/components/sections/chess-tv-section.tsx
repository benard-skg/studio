
"use client";

import { useEffect, useState, useRef } from 'react';
import { ChessBoard } from 'kokopu-react';
import { Chess } from 'chess.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Tv } from 'lucide-react';
import ChessTVSectionLoader from './chess-tv-section-loader'; // Assuming you have this

const LICHESS_USERNAME_KEY = 'lichessTvUsername';

export default function ChessTVSection() {
  const [lichessUsername, setLichessUsername] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [fen, setFen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing ChessTV...");
  const chessJsInstance = useRef(new Chess());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      console.log('[ChessTV] Found username in localStorage:', storedUsername);
      setLichessUsername(storedUsername);
    } else {
      console.log('[ChessTV] No username found in localStorage.');
      setStatusMessage("Lichess username not set. Please configure in Admin Settings.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!lichessUsername) {
      if (localStorage.getItem(LICHESS_USERNAME_KEY)) { // Check again in case of race condition
        setLichessUsername(localStorage.getItem(LICHESS_USERNAME_KEY));
      } else {
        setStatusMessage("Lichess username not set. Please configure in Admin Settings.");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setGameData(null);
    setFen(null);
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
                setStatusMessage(`No ongoing games found for ${lichessUsername} at the moment, or stream ended before game start.`);
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const jsonData = JSON.parse(line);
               if (!gameFound) { // Process the first valid game object
                console.log('[ChessTV] Received game data chunk:', jsonData);
                gameFound = true;
                setGameData(jsonData);
                setStatusMessage("Game data received. Processing...");

                if (jsonData.fen) {
                  setFen(jsonData.fen);
                  chessJsInstance.current = new Chess(jsonData.fen);
                  console.log('[ChessTV] Initial FEN set:', jsonData.fen);
                  setStatusMessage("Board displayed. Waiting for updates if stream continues.");
                } else if (jsonData.status && jsonData.status !== 'started') {
                   setStatusMessage(`Game found but status is: ${jsonData.status}. May not be live FEN stream.`);
                } else {
                   setStatusMessage("Game data received, but no initial FEN. Waiting for FEN if stream provides it.");
                }
              } else if (jsonData.fen && gameFound) { 
                // If the stream *does* provide subsequent FEN updates for the *same game*
                setFen(jsonData.fen);
                chessJsInstance.current.load(jsonData.fen); // Load new FEN into chess.js
                console.log('[ChessTV] FEN updated:', jsonData.fen);
              }
              // This endpoint seems to stream one game object per line if there are multiple games.
              // We'll focus on the first one marked as ongoing.
              // For true live FEN updates of a *single game*, Lichess uses /api/board/game/stream/{gameId}
              // This endpoint might just list games. If so, it'll show the first one's initial state.
            } catch (e) {
              console.warn('[ChessTV] Failed to parse NDJSON line:', line, e);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[ChessTV] Fetch aborted');
          setStatusMessage("Stream connection closed.");
          return;
        }
        console.error('[ChessTV] Error fetching or processing stream:', err);
        setError(err.message || 'Failed to fetch or process Lichess stream.');
        setStatusMessage(`Error: ${err.message || 'Failed to connect.'}`);
      } finally {
        setIsLoading(false);
        if (!gameFound && !error && lichessUsername) {
             setStatusMessage( prevStatus => prevStatus.startsWith("Error") ? prevStatus : `No active games currently found for ${lichessUsername}.`);
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


  if (!lichessUsername && !isLoading) {
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-lg mx-auto shadow-lg border-border">
            <CardHeader className="text-center">
              <Tv className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-3xl">ChessTV</CardTitle>
              <CardDescription className="font-body">Live Lichess Games</CardDescription>
            </CardHeader>
            <CardContent className="text-center font-body py-8">
              <div className="flex items-center justify-center text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{statusMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
  
  if (isLoading && !fen) { // Show loader only if we are truly in an initial loading phase without any board
     return <ChessTVSectionLoader />;
  }


  if (error) {
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
  
  if (!fen && !isLoading && lichessUsername) { // No FEN but not loading, and username is set
    return (
      <section id="chesstv" className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <Card className="max-w-lg mx-auto shadow-lg border-border">
            <CardHeader className="text-center">
              <Tv className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-3xl">ChessTV</CardTitle>
              <CardDescription className="font-body">Live Lichess Games for {lichessUsername}</CardDescription>
            </CardHeader>
            <CardContent className="text-center font-body py-8">
              <div className="flex items-center justify-center text-muted-foreground">
                {statusMessage.startsWith("Error") || statusMessage.startsWith("No active games") || statusMessage.startsWith("Lichess username not set") ? 
                    <AlertCircle className="h-5 w-5 mr-2"/> : 
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                <p>{statusMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }


  const whitePlayer = gameData?.players?.white?.user?.name || gameData?.players?.white?.userId || 'White';
  const blackPlayer = gameData?.players?.black?.user?.name || gameData?.players?.black?.userId || 'Black';
  const gameStatus = gameData?.status || 'Ongoing';
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
              Live from Lichess: {lichessUsername}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 bg-card">
            <div className="aspect-square w-full max-w-[400px] sm:max-w-[480px] md:max-w-[520px] mx-auto my-2 rounded-md overflow-hidden shadow-inner border border-border/50">
              {fen ? (
                <ChessBoard fen={fen} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="ml-2 font-body">Loading board...</p>
                </div>
              )}
            </div>
             <div className="font-body text-sm mt-3 px-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-foreground">White:</span>
                <span className="text-muted-foreground truncate">{whitePlayer}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-foreground">Black:</span>
                <span className="text-muted-foreground truncate">{blackPlayer}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-foreground">Status:</span>
                <span className="text-muted-foreground capitalize">{gameStatus}</span>
              </div>
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

    