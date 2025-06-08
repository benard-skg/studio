
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

export default function AdminLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 text-center">
          <Skeleton className="h-12 w-3/5 mx-auto mb-2" /> {/* Title */}
          <Skeleton className="h-5 w-2/5 mx-auto" />      {/* Subtitle */}
        </header>

        <div className="mb-6 text-center">
           <Skeleton className="h-8 w-1/2 mx-auto" /> {/* Last Loaded Timestamp Placeholder */}
        </div>

        <div className="shadow-xl rounded-lg overflow-hidden border border-border bg-card">
          <Table>
            <TableCaption className="py-4 font-body text-sm text-muted-foreground bg-card border-t border-border">
              <Skeleton className="h-4 w-1/3 mx-auto" /> {/* Caption */}
            </TableCaption>
            <TableHeader className="bg-card/50">
              <TableRow>
                <TableHead className="font-headline text-card-foreground w-[5%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground w-[25%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground text-right w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                <TableHead className="font-headline text-card-foreground text-center w-[10%]"><Skeleton className="h-5 w-full" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="border-b border-border last:border-b-0">
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
