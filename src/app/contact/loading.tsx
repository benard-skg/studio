
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function ContactLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center justify-center px-4">
        <div className="py-16 md:py-24 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" /> {/* Icon placeholder */}
          <Skeleton className="h-10 w-3/4 mx-auto mb-4" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Subtitle placeholder */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
