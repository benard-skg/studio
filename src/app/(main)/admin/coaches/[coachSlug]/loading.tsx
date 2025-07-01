
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Separator } from '@/components/ui/separator';

export default function CoachAdminProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full shrink-0" />
            <div className="space-y-2 text-center md:text-left pt-2">
              <Skeleton className="h-10 w-48 md:w-72" /> {/* Coach Name */}
              <Skeleton className="h-6 w-36 md:w-56" /> {/* Coach Title */}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Lesson Reports Section Skeleton */}
        <section className="mb-12">
          <Skeleton className="h-9 w-1/3 mb-6" /> {/* Section Title */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border rounded-lg bg-card shadow-sm space-y-3">
                <Skeleton className="h-6 w-3/4" /> {/* Report Title/Student Name */}
                <Skeleton className="h-4 w-1/2" /> {/* Date/Topic */}
                <Skeleton className="h-4 w-full" /> {/* Details line 1 */}
                <Skeleton className="h-4 w-5/6" /> {/* Details line 2 */}
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Placeholder Articles Section Skeleton */}
        <section className="mb-12">
          <Skeleton className="h-9 w-1/3 mb-6" /> {/* Section Title */}
          <Skeleton className="h-5 w-2/3" /> {/* Coming soon text */}
        </section>
        
        <Separator className="my-8" />

        {/* Placeholder Calendar Section Skeleton */}
         <section className="mb-12">
          <Skeleton className="h-9 w-1/3 mb-6" /> {/* Section Title */}
          <Skeleton className="h-5 w-2/3" /> {/* Coming soon text */}
        </section>

      </main>
      <Footer />
    </div>
  );
}

    