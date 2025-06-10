
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
          <Skeleton className="h-10 w-2/5 sm:w-1/3 mb-4 sm:mb-0" /> {/* Title: Manage Events */}
          <Skeleton className="h-10 w-48 rounded-md" /> {/* Add New Event Button */}
        </header>

        <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
          <div className="p-4 sm:p-6">
            {/* Table Header Skeleton */}
            <div className="hidden sm:flex justify-between items-center pb-3 border-b border-border mb-3">
              <Skeleton className="h-5 w-1/6" /> {/* Date */}
              <Skeleton className="h-5 w-1/6" /> {/* Time */}
              <Skeleton className="h-5 w-2/6" /> {/* Title */}
              <Skeleton className="h-5 w-1/6" /> {/* Type */}
              <Skeleton className="h-5 w-1/12" /> {/* Actions (text label) */}
            </div>

            {/* Table Rows Skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-border last:border-b-0">
                {/* For mobile view, stack them or show simplified */}
                <div className="w-full sm:w-1/6 mb-2 sm:mb-0">
                  <Skeleton className="h-4 w-3/4 sm:w-full" /> {/* Date */}
                </div>
                <div className="w-full sm:w-1/6 mb-2 sm:mb-0">
                  <Skeleton className="h-4 w-1/2 sm:w-full" /> {/* Time */}
                </div>
                <div className="w-full sm:w-2/6 mb-2 sm:mb-0">
                  <Skeleton className="h-4 w-full" /> {/* Title */}
                </div>
                <div className="w-full sm:w-1/6 mb-2 sm:mb-0">
                  <Skeleton className="h-4 w-2/3 sm:w-full hidden md:block" /> {/* Type */}
                </div>
                <div className="flex space-x-1 w-full sm:w-auto justify-end sm:justify-start">
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
