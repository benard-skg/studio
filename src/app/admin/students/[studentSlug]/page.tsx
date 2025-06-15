
"use client";

import { useParams, notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { UserCircle2, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function deslugify(slug: string): string {
  if (!slug) return "Student";
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentSlug = typeof params.studentSlug === 'string' ? params.studentSlug : undefined;

  if (!studentSlug) {
    notFound();
  }

  const studentName = deslugify(studentSlug);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <UserCircle2 className="mx-auto h-16 w-16 text-accent mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            {studentName}'s Profile
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3">
            Student details and lesson history.
          </p>
        </header>

        <Card className="max-w-2xl mx-auto shadow-lg border-border">
            <CardHeader>
                <CardTitle className="font-headline text-2xl font-black tracking-tighter flex items-center">
                    <Construction className="mr-3 h-6 w-6 text-amber-500" />
                    Page Under Construction
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-body text-muted-foreground mb-6">
                    This student profile page is currently a placeholder. More features and details will be added soon.
                </p>
                <Button asChild variant="outline">
                    <Link href="/admin/coaches">Back to Coach Profiles</Link>
                </Button>
            </CardContent>
        </Card>
        
        {/* Placeholder for future content like: */}
        {/* - List of lesson reports for this student */}
        {/* - Student's progress metrics */}
        {/* - Assigned homework or goals */}

      </main>
      <Footer />
    </div>
  );
}
