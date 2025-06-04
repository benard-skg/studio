
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BlogSection from '@/components/sections/blog-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chess Blog - Insights & Strategy - kgchess',
  description: 'Discover chess tips, analysis, and strategy updates from the kgchess blog.',
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}
