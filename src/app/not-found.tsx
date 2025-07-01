// src/app/not-found.tsx

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center rounded-full bg-accent p-4 animate-double-subtle-pulse-5s">
            <svg
              className="h-10 w-10 text-accent-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85l.007-.15V6c0-1.054-.816-1.918-1.85-1.995L18 4H6c-1.054 0-1.918.816-1.995 1.85L4 6v12c0 1.054.816 1.918 1.85 1.995L6 20z"
              />
            </svg>
          </span>
        </div>
        <h1 className="text-4xl font-headline font-bold mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-headline font-semibold mb-4">Page Not Found</h2>
        <p className="mb-6 text-muted-foreground font-body">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground font-body font-semibold shadow transition hover:bg-accent/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
