
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

        <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
          <Skeleton className="h-10 w-10 rounded-full mb-3" /> {/* Icon Placeholder */}
          <Skeleton className="h-8 w-1/2 mx-auto mb-2" /> {/* Message Title Placeholder */}
          <Skeleton className="h-5 w-3/4 mx-auto" /> {/* Message Body Placeholder */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
