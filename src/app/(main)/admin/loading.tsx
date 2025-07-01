
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full mb-4" /> {/* Icon placeholder */}
          <Skeleton className="h-10 w-3/5 mx-auto mb-3" /> {/* Title */}
          <Skeleton className="h-5 w-2/5 mx-auto" />      {/* Subtitle */}
        </header>

        <div className="bg-card shadow-md rounded-lg p-6 border border-border text-center">
          <Skeleton className="h-5 w-3/4 mx-auto" /> {/* Placeholder text */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
