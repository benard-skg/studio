
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar'; 
import Footer from '@/components/layout/footer';   

export default function BlogPostLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8">
            <Skeleton className="h-9 w-36 rounded-md" /> {/* Back to blog button placeholder */}
          </div>

          <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto">
            <header className="mb-8 space-y-3">
              <Skeleton className="h-12 w-full" /> {/* Title placeholder line 1 */}
              <Skeleton className="h-10 w-3/4" />  {/* Title placeholder line 2 */}
              <Skeleton className="h-5 w-1/3 pt-2" />       {/* Date placeholder */}
            </header>

            <Skeleton className="relative w-full aspect-[16/9] mb-8 rounded-lg" /> {/* Featured image placeholder */}
            
            <div className="space-y-3 mt-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <div className="pt-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
