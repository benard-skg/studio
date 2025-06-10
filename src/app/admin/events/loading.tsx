
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { CalendarPlus } from 'lucide-react';

export default function AdminEventsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <Skeleton className="h-12 w-3/5 mb-4 sm:mb-0" /> {/* Title: Manage Events */}
          <Skeleton className="h-10 w-48 rounded-md" /> {/* Add New Event Button */}
        </header>

        <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
          <div className="p-4 space-y-3"> {/* Simulating table header */}
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-2/6" />
              <Skeleton className="h-5 w-1/6 hidden md:block" />
              <Skeleton className="h-5 w-1/12" />
            </div>
            {[...Array(3)].map((_, i) => ( // Simulating 3 table rows
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-2/6" />
                <Skeleton className="h-5 w-1/6 hidden md:block" />
                <div className="flex space-x-1">
                    <Skeleton className="h-8 w-8 rounded-md" /> {/* View button */}
                    <Skeleton className="h-8 w-8 rounded-md" /> {/* Edit button */}
                    <Skeleton className="h-8 w-8 rounded-md" /> {/* Delete button */}
                </div>
              </div>
            ))}
          </div>
        </div>
         <div className="mt-8 flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
            <Skeleton className="h-10 w-10 rounded-full mb-3" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

    