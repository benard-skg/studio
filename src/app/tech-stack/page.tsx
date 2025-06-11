
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Wind, BrainCircuit, Database, Code, Server, BookOpen, Settings2, Palette, GitMerge, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';

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
  { name: 'Next.js', icon: NextJsLogo, description: 'The React framework for building full-stack web applications with server-side rendering and static site generation.' },
  { name: 'React', icon: ReactLogo, description: 'A JavaScript library for building user interfaces based on components.' },
  { name: 'ShadCN UI', icon: Layers, description: 'A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.' },
  { name: 'Tailwind CSS', icon: Wind, description: 'A utility-first CSS framework for rapidly building custom user interfaces directly in your markup.' },
  { name: 'TypeScript', icon: Code, description: 'A superset of JavaScript that adds static types, improving code quality and developer experience.' },
  { name: 'Genkit (Firebase AI)', icon: BrainCircuit, description: 'A toolkit for building AI-powered features, integrated with Firebase for seamless deployment and management.' },
  { name: 'Firebase', icon: FirebaseLogo, description: 'A comprehensive platform from Google for building web and mobile applications, used here for App Hosting.' },
  { name: 'Contentful', icon: BookOpen, description: 'A headless Content Management System (CMS) used for managing blog posts and other dynamic content.' },
  { name: 'JSONBin.io', icon: Database, description: 'A simple and free JSON storage service, used for contact form submissions and event data in this prototype.' },
  { name: 'Lucide Icons', icon: Palette, description: 'A beautiful and consistent open-source icon library.' },
  { name: 'Firebase Studio', icon: MonitorSmartphone, description: 'The AI-powered development environment where this app is being built. Facilitates conversational coding and rapid prototyping.' },
];

export default function TechStackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <Link href="/" className="inline-block mb-4">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight hover:text-accent transition-colors">
              kgchess - Tech Stack
            </h1>
          </Link>
        </header>

        <section className="max-w-3xl mx-auto mb-12 bg-card border border-border rounded-xl p-6 shadow-lg">
          <p className="font-body text-lg leading-relaxed text-muted-foreground mb-2">
            Hey there! This app, <strong className="text-foreground">kgchess</strong>, was prototyped by <strong className="text-foreground">KG</strong> (that&apos;s me, your friendly AI coding partner here in <Link href="https://firebase.google.com/studio" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Firebase Studio</Link>) alongside my human collaborator.
          </p>
          <p className="font-body text-base leading-relaxed text-muted-foreground mb-2">
            It&apos;s been an interesting journey, largely put together using a mobile device (yes, you read that right!), so it&apos;s definitely an ongoing project and still evolving.
          </p>
          <p className="font-body text-base leading-relaxed text-muted-foreground">
            Think of it as a cool concept car – fun to look at, showcases some neat ideas (like this very page!), but perhaps don&apos;t enter your most sensitive data just yet. Security, polish, and full feature sets are all part of the "coming soon" roadmap as this prototype matures. 😉
          </p>
        </section>

        <section>
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">Core Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <Card key={tech.name} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                  <tech.icon className="h-8 w-8 text-accent shrink-0" />
                  <CardTitle className="font-headline text-xl">{tech.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="font-body text-sm">{tech.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
