
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function ClassesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* ClassShowcaseSection Skeleton */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" /> {/* Icon */}
              <Skeleton className="h-10 w-1/2 mx-auto mb-2" /> {/* Title */}
              <Skeleton className="h-6 w-1/3 mx-auto" /> {/* Subtitle */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {[...Array(1)].map((_, i) => ( // Assuming 1 main class card for now
                <div key={i} className="flex flex-col shadow-lg rounded-xl overflow-hidden bg-card max-w-md mx-auto md:col-span-1 lg:col-span-1">
                  <div className="p-6 bg-card">
                    <Skeleton className="h-7 w-3/4 mb-1" /> {/* Name */}
                    <Skeleton className="h-4 w-1/2" /> {/* Description */}
                  </div>
                  <div className="p-6 flex-grow space-y-4">
                    <div className="text-center">
                      <Skeleton className="h-10 w-1/3 mx-auto mb-1" /> {/* Price */}
                      <Skeleton className="h-4 w-1/4 mx-auto" /> {/* Frequency */}
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-11/12" />
                      <Skeleton className="h-5 w-10/12" />
                      <Skeleton className="h-5 w-5/6" />
                    </div>
                    <Skeleton className="h-5 w-full pt-2" /> {/* Italic quote */}
                  </div>
                  <div className="p-6 bg-card border-t">
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Button */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
