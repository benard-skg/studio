
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { FileText } from 'lucide-react';

export default function ViewLessonReportLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Card Header Skeleton */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <div className="flex items-center mb-2">
                        <Skeleton className="h-7 w-7 rounded-full mr-3" /> {/* Icon placeholder for FileText */}
                        <Skeleton className="h-8 w-3/4" /> {/* Title: Lesson Report Details */}
                    </div>
                    <Skeleton className="h-4 w-1/2" />      {/* Description: Student | Coach */}
                </div>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                    <Skeleton className="h-9 w-20 rounded-md" /> {/* Edit Button */}
                    <Skeleton className="h-9 w-28 rounded-md" /> {/* Download Button */}
                    <Skeleton className="h-9 w-24 rounded-md" /> {/* Delete Button */}
                </div>
            </div>
          </div>

          {/* Form Content Skeleton */}
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center mb-3">
                    <Skeleton className="h-5 w-5 rounded-full mr-2" /> {/* Section Icon */}
                    <Skeleton className="h-6 w-1/3" /> {/* Section Title */}
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1"><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-5 w-full" /></div>
                    <div className="space-y-1"><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-5 w-full" /></div>
                </div>
                 <div className="space-y-1 mt-2">
                    <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label for rich text area */}
                    <Skeleton className="h-12 w-full" /> {/* Rich text area (e.g. key concepts) */}
                </div>
                { section !== 4 && <Skeleton className="h-px w-full my-4" /> /* Separator */}
              </div>
            ))}
            <Skeleton className="h-3 w-1/4 mx-auto mt-6" /> {/* Report ID */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    