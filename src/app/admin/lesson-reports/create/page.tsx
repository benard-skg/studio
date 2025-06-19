"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import LessonReportForm from '@/components/forms/lesson-report-form';
import type { Metadata } from 'next';
import withAuth from '@/components/auth/withAuth'; // Import withAuth HOC

export const metadata: Metadata = {
  title: 'Create Lesson Report - LCA Admin',
  description: 'Document chess lesson details and student progress.',
};

function CreateLessonReportPageContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <LessonReportForm />
      </main>
      <Footer />
    </div>
  );
}

export default withAuth(CreateLessonReportPageContent); // Wrap component
