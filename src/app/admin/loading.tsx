
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function AdminLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 text-center">
          <Skeleton className="h-12 w-3/5 mx-auto mb-2" /> {/* Title */}
          <Skeleton className="h-5 w-2/5 mx-auto" />      {/* Subtitle */}
        </header>

        <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
          <div className="p-4 space-y-3"> {/* Simulating table header */}
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-2/6 hidden md:block" />
              <Skeleton className="h-5 w-1/12" />
            </div>
            {[...Array(3)].map((_, i) => ( // Simulating 3 table rows
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-2/6 hidden md:block" />
                <Skeleton className="h-8 w-8 rounded-md" /> {/* Action button */}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
