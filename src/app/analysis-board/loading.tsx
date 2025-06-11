
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function AnalysisBoardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center py-8">
        <div className="w-full max-w-lg">
          <Skeleton className="aspect-square w-full rounded-lg mb-6" /> {/* Board placeholder */}
          <div className="p-3 bg-card rounded-lg shadow-md flex justify-center space-x-2 flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" /> // Control button placeholder
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
