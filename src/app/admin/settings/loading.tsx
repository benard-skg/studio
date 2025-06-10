
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Settings, UserCircle, Save } from 'lucide-react';

export default function AdminSettingsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full mb-4" /> {/* Settings Icon */}
          <Skeleton className="h-10 w-3/5 mx-auto mb-2" /> {/* Title: Admin Settings */}
          <Skeleton className="h-5 w-2/5 mx-auto" />      {/* Subtitle */}
        </header>

        <div className="max-w-lg mx-auto shadow-lg border border-border bg-card p-6 rounded-xl">
          {/* Card Header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Skeleton className="h-6 w-6 rounded-full mr-2" /> {/* UserCircle Icon */}
              <Skeleton className="h-7 w-3/4" /> {/* Card Title: ChessTV Lichess Username */}
            </div>
            <Skeleton className="h-4 w-full mb-1" /> {/* Card Description Line 1 */}
            <Skeleton className="h-4 w-5/6" />      {/* Card Description Line 2 */}
          </div>

          {/* Card Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" /> {/* Label: Lichess Username */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Input Field */}
            </div>
            <Skeleton className="h-10 w-full rounded-md" /> {/* Save Button */}
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" /> {/* Current username display placeholder */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
