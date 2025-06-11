
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Layers, Wind, BrainCircuit, Database, Code, BookOpen, Palette, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link'; // Link import might not be needed if no other links are present

export const metadata: Metadata = {
  title: 'Tech Stack - kgchess',
  description: 'Learn about the technologies used to build the kgchess application.',
};

const NextJsLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="1em" height="1em" viewBox="0 0 76 65" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
  </svg>
);

const ReactLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="1em" height="1em" viewBox="-10.5 -9.45 21 18.9" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="0" cy="0" r="2" fill="currentColor"></circle>
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="10" ry="4.5"></ellipse>
      <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
      <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
    </g>
  </svg>
);

const FirebaseLogo = (props: React.SVGProps<SVGSVGElement>) => (
 <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6.724 18.755L12 1.25l5.276 17.505-3.085-9.216-2.191 7.148-2.191-7.148L6.724 18.755zm-3.639-9.93L12 22.75l8.915-13.925-3.64 4.046-1.94-1.84-3.335 4.04-1.94-1.84-3.64 4.046zM12 14.388l1.94-6.337L12 3.612l-1.94 4.44L12 14.388z" fillRule="evenodd"/>
  </svg>
);

const technologies = [
  { name: 'Next.js', icon: NextJsLogo },
  { name: 'React', icon: ReactLogo },
  { name: 'ShadCN UI', icon: Layers },
  { name: 'Tailwind CSS', icon: Wind },
  { name: 'TypeScript', icon: Code },
  { name: 'Genkit (Firebase AI)', icon: BrainCircuit },
  { name: 'Firebase', icon: FirebaseLogo },
  { name: 'Lucide Icons', icon: Palette },
  { name: 'Firebase Studio', icon: MonitorSmartphone },
];

export default function TechStackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading removed */}
        
        <section className="max-w-2xl mx-auto mb-10 bg-destructive/15 text-destructive-foreground/90 border border-destructive/30 rounded-xl p-6 shadow-lg animate-subtle-pulse-15s">
          <p className="font-body text-base leading-relaxed">
            This application is a prototype, largely developed using a mobile device. It is intended for demonstration purposes and may not include full security, polish, or feature completeness.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-center">Core Technologies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {technologies.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                <tech.icon className="h-10 w-10 text-accent mb-2 shrink-0" />
                <span className="font-headline text-base text-center break-words">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
