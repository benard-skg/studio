import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import PackageShowcaseSection from '@/components/sections/package-showcase-section';
import TestimonialsSection from '@/components/sections/testimonials-section';
import BlogSection from '@/components/sections/blog-section';
import ContactSection from '@/components/sections/contact-section';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20"> {/* Add pt-20 to account for fixed navbar height */}
        <HeroSection />
        <CoachProfileSection />
        <PackageShowcaseSection />
        <TestimonialsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
