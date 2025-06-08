
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function AboutLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* CoachProfileSection Skeleton */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" /> {/* Icon */}
              <Skeleton className="h-10 w-1/2 mx-auto mb-2" /> {/* Title */}
              <Skeleton className="h-6 w-1/3 mx-auto" /> {/* Subtitle */}
            </div>

            <div className="space-y-12">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="overflow-hidden shadow-xl rounded-lg bg-card">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-64 md:h-full object-cover" /> {/* Image */}
                    </div>
                    <div className="md:w-2/3 p-6 space-y-6">
                      <div>
                        <Skeleton className="h-8 w-3/4 mb-1" /> {/* Name */}
                        <Skeleton className="h-4 w-1/2 mb-0.5" /> {/* ID */}
                        <Skeleton className="h-4 w-1/2" /> {/* ID */}
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <div className="pl-4 space-y-2 mt-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-11/12" />
                          <Skeleton className="h-5 w-10/12" />
                        </div>
                        <Skeleton className="h-5 w-full mt-3" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    </div>
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
