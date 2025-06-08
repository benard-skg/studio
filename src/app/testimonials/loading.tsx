
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function TestimonialsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* TestimonialsSection Skeleton */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" /> {/* Icon */}
              <Skeleton className="h-10 w-1/2 mx-auto mb-2" /> {/* Title */}
              <Skeleton className="h-6 w-1/3 mx-auto" /> {/* Subtitle */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="md:col-start-2 lg:col-start-2">
                <div className="shadow-lg rounded-xl overflow-hidden bg-card h-full flex flex-col">
                  <div className="p-6 text-center flex flex-col flex-grow">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" /> {/* Avatar */}
                    <Skeleton className="h-8 w-8 mx-auto mb-4" /> {/* Quote Icon */}
                    <div className="space-y-2 mb-4 flex-grow">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-5 w-5 rounded-full mx-0.5" />
                      ))}
                    </div>
                    <Skeleton className="h-6 w-1/3 mx-auto" /> {/* Name */}
                  </div>
                </div>
              </div>
            </div>
             <div className="mt-12 text-center">
                <Skeleton className="h-11 w-48 rounded-md mx-auto" /> {/* View All Button Placeholder */}
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
