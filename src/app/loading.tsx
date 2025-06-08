
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Skeleton className="h-8 w-32" /> {/* Logo placeholder */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex space-x-6">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-9 w-9 rounded-md" /> {/* Theme toggle placeholder */}
              <div className="md:hidden">
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Mobile menu placeholder */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/2" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-3/4" /> {/* Subtitle/paragraph placeholder */}
          <div className="space-y-4 mt-8">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="py-8 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-5 w-1/3 mx-auto" />
        </div>
      </footer>
    </div>
  );
}
