
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { UserCircle2 } from 'lucide-react';

export default function StudentProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <header className="mb-10 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full mb-4" /> {/* Icon placeholder */}
          <Skeleton className="h-10 w-3/5 mx-auto mb-3" /> {/* Student Name */}
          <Skeleton className="h-5 w-2/5 mx-auto" />      {/* Subtitle */}
        </header>

        {/* Content Card Skeleton */}
        <div className="max-w-2xl mx-auto shadow-lg border border-border bg-card p-6 rounded-xl">
            <div className="flex items-center mb-4">
                <Skeleton className="h-8 w-8 rounded-full mr-3" /> 
                <Skeleton className="h-7 w-1/2" /> {/* Card Title placeholder */}
            </div>
            <div className="space-y-3 text-center">
                <Skeleton className="h-5 w-3/4 mx-auto" /> 
                <Skeleton className="h-5 w-full mx-auto" />
                <Skeleton className="h-10 w-40 mx-auto mt-4 rounded-md" /> {/* Button placeholder */}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
