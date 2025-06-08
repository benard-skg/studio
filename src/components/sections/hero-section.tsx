
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center py-20 bg-secondary">
      <Image
        src="https://i.ibb.co/qY9FppW0/Stock-Cake-Digital-Queen-Rising-1749057820.jpg"
        alt="Abstract chess background"
        fill
        style={{ objectFit: 'cover' }}
        className="opacity-30 dark:opacity-20"
        data-ai-hint="chess abstract"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw" // Example sizes, adjust as needed
      />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
          Master Your Chess Game
        </h1>
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Unlock your potential with personalized chess coaching from kgchess. Strategy, tactics, and mindset – all tailored to your success.
        </p>
        <div className="flex flex-col space-y-4 max-w-xs mx-auto sm:max-w-sm">
          <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all transform hover:scale-105 rounded-lg px-8 py-3 text-lg">
            <Link href="/classes">Explore Classes</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full transition-all transform hover:scale-105 rounded-lg px-8 py-3 text-lg">
            <Link href="/contact">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
