import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar'; 
import Footer from '@/components/layout/footer';   

export default function BlogLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <Skeleton className="h-14 md:h-16 w-3/4 mx-auto mb-3" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-1/2 mx-auto" />    {/* Subtitle placeholder */}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col shadow-lg rounded-xl overflow-hidden bg-card border-border">
              <Skeleton className="aspect-[16/9] w-full" /> {/* Image placeholder */}
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" /> {/* Title placeholder */}
                <Skeleton className="h-4 w-1/4" /> {/* Date placeholder */}
                <Skeleton className="h-4 w-full" /> {/* Excerpt line 1 */}
                <Skeleton className="h-4 w-5/6" />   {/* Excerpt line 2 */}
                <Skeleton className="h-5 w-24 mt-2" />      {/* Read more placeholder */}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
