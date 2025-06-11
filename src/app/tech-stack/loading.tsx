
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function TechStackLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <Skeleton className="h-14 md:h-16 w-1/2 mx-auto mb-3" /> {/* Title placeholder */}
        </header>

        <section className="max-w-3xl mx-auto mb-12 bg-card border border-border rounded-xl p-6 shadow-lg">
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-11/12 mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-10/12" />
        </section>

        <section>
          <Skeleton className="h-10 w-1/3 mx-auto mb-8" /> {/* Section Title placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shadow-md rounded-xl bg-card p-4">
                <div className="flex items-center space-x-3 pb-3 mb-2">
                  <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon placeholder */}
                  <Skeleton className="h-6 w-3/4" /> {/* Tech Name placeholder */}
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
