// Simple not-found page for Next.js app directory routing
// No client-side hooks are used here

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-lg">Sorry, the page you are looking for does not exist.</p>
      <a href="/" className="text-accent underline">Go back home</a>
    </div>
  );
}
