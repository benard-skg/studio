
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
// import BlogSection from '@/components/sections/blog-section'; // Removed
// import ContactSection from '@/components/sections/contact-section'; // Removed
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20"> {/* Add pt-20 to account for fixed navbar height */}
        <HeroSection />
        <CoachProfileSection />
        <ClassShowcaseSection />
        {/* <BlogSection /> */} {/* Removed */}
        {/* <ContactSection /> */} {/* Removed */}
        {/* You can add a placeholder or new content here if desired */}
      </main>
      <Footer />
    </div>
  );
}
