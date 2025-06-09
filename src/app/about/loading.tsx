
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function AboutLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <Skeleton className="h-14 md:h-16 w-1/2 mx-auto mb-3" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-3/4 mx-auto" />    {/* Subtitle placeholder */}
        </header>

        <section className="mb-16">
          <div className="rounded-xl shadow-lg border border-border bg-card p-6">
            <div className="flex items-center mb-4">
              <Skeleton className="h-8 w-8 rounded-full mr-3" /> {/* Icon */}
              <Skeleton className="h-8 w-1/3" /> {/* Card Title */}
            </div>
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </section>

        <section className="mb-16">
           <div className="rounded-xl shadow-lg border border-border bg-card p-6">
            <div className="flex items-center mb-4">
              <Skeleton className="h-8 w-8 rounded-full mr-3" /> {/* Icon */}
              <Skeleton className="h-8 w-1/3" /> {/* Card Title */}
            </div>
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </section>
        
        <Skeleton className="h-px w-full my-12" /> {/* Separator */}

        <section className="mb-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Skeleton className="h-10 w-3/5 mb-6" /> {/* Section Title */}
            <div className="flex items-start mb-6">
              <Skeleton className="h-10 w-10 rounded-full mr-4 shrink-0" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
            </div>
            <div className="flex items-start">
              <Skeleton className="h-10 w-10 rounded-full mr-4 shrink-0" />
              <div>
                <Skeleton className="h-6 w-28 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>
          </div>
          <Skeleton className="aspect-video rounded-lg" /> {/* Image placeholder */}
        </section>

        <section>
            <Skeleton className="h-10 w-1/2 mx-auto mb-6" /> {/* Section Title */}
            <Skeleton className="h-5 w-3/4 mx-auto mb-8" /> {/* Paragraph */}
             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
