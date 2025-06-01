import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center py-20 bg-secondary">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Abstract chess background"
        layout="fill"
        objectFit="cover"
        className="opacity-20"
        data-ai-hint="chess abstract"
        priority
      />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Master Your Chess Game
        </h1>
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Unlock your potential with personalized chess coaching from kgchess. Strategy, tactics, and mindset – all tailored to your success.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all transform hover:scale-105 rounded-lg px-8 py-3 text-lg">
            <Link href="#packages">Explore Packages</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="transition-all transform hover:scale-105 rounded-lg px-8 py-3 text-lg">
            <Link href="#contact">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
