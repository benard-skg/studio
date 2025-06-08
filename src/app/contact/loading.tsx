
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function ContactLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* ContactSection Skeleton */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" /> {/* Icon */}
              <Skeleton className="h-10 w-1/2 mx-auto mb-2" /> {/* Title */}
              <Skeleton className="h-6 w-3/4 mx-auto" /> {/* Subtitle */}
            </div>

            <div className="flex flex-col items-center my-6">
              <Skeleton className="h-10 w-10 rounded-full mb-2" /> {/* WhatsApp Icon */}
              <Skeleton className="h-4 w-24" /> {/* Chat on WhatsApp text */}
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-8 p-8 border rounded-xl shadow-lg bg-card mt-8">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-24 w-full rounded-md" /> {/* Textarea */}
                </div>
                <Skeleton className="h-11 w-full rounded-md" /> {/* Button */}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
