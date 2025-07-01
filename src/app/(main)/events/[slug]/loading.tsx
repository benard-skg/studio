
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar'; 
import Footer from '@/components/layout/footer';   

export default function EventLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <Skeleton className="h-12 w-3/4 mb-4" /> {/* Title placeholder */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-5 w-40" /> {/* Date placeholder */}
            <Skeleton className="h-5 w-28" /> {/* Time placeholder */}
            <Skeleton className="h-5 w-20" /> {/* Type placeholder */}
          </div>
        </header>

        <section className="mb-8">
          <Skeleton className="h-8 w-1/3 mb-4" /> {/* Section title placeholder */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </section>
        
        <Skeleton className="h-5 w-24 mt-12 mx-auto" /> {/* Event ID placeholder */}

      </main>
      <Footer />
    </div>
  );
}
