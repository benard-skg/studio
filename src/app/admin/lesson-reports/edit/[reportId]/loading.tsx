
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Edit3 } from 'lucide-react';

export default function EditLessonReportLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Card Header Skeleton */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center mb-2">
              <Skeleton className="h-8 w-8 rounded-full mr-3" /> {/* Icon placeholder for Edit3 */}
              <Skeleton className="h-8 w-3/4" /> {/* Title: Edit Lesson Report */}
            </div>
            <Skeleton className="h-4 w-1/2" />      {/* Description */}
          </div>

          {/* Form Content Skeleton */}
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4, 5].map((section) => (
              <div key={section} className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                <Skeleton className="h-6 w-1/3 mb-4" /> {/* Section Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" /> {/* Label */}
                  <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
                 <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" /> 
                  <Skeleton className="h-20 w-full rounded-md" /> {/* Textarea */}
                </div>
                { section !== 5 && <Skeleton className="h-px w-full my-4" /> /* Separator */}
              </div>
            ))}
            
            {/* Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {/* <Skeleton className="h-10 w-32 rounded-md" /> No Clear Draft button in edit usually */}
              <Skeleton className="h-10 w-40 rounded-md" /> {/* Update Report Button */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
