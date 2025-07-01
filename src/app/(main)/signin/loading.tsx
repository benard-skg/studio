
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { LogIn } from 'lucide-react';

export default function SignInLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar /> {/* Navbar will show its own loading state or placeholders */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card Header Skeleton */}
          <div className="p-6 text-center border-b border-border">
            <Skeleton className="mx-auto h-10 w-10 rounded-full mb-3" /> {/* Icon */}
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-1/2 mx-auto" />      {/* Description */}
          </div>
          {/* Card Content Skeleton */}
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-md" /> {/* Sign In Button */}
            <div className="px-8 text-center space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6 mx-auto" />
            </div>
            <Skeleton className="h-4 w-20 mx-auto mt-2" /> {/* Back to Home Link */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
