
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Layers, Wind, BrainCircuit, Database, Code, BookOpen, Palette, MonitorSmartphone, Rocket, Wrench, ExternalLink, ListChecks, Route, Server, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'Tech Stack & Project Info - kgchess',
  description: 'Learn about the technologies used to build the kgchess application and its development journey.',
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
  { name: 'Next.js', icon: NextJsLogo, description: "Full-stack React framework for server-side rendering, static site generation, and API routes." },
  { name: 'React', icon: ReactLogo, description: "JavaScript library for building user interfaces." },
  { name: 'Firebase', icon: FirebaseLogo, description: "Backend platform for Authentication, Firestore (database), Storage, and App Hosting." },
  { name: 'Firestore', icon: Database, description: "NoSQL document database for storing dynamic application data." },
  { name: 'ShadCN UI', icon: Layers, description: "Reusable UI components built with Radix UI and Tailwind CSS." },
  { name: 'Tailwind CSS', icon: Wind, description: "Utility-first CSS framework for rapid UI development." },
  { name: 'TypeScript', icon: Code, description: "Statically typed superset of JavaScript for improved code quality." },
  { name: 'Genkit (Firebase AI)', icon: BrainCircuit, description: "Toolkit for building AI-powered features (planned/experimental)." },
  { name: 'Lucide Icons', icon: Palette, description: "Beautifully simple and consistent open-source icon set." },
  { name: 'Contentful', icon: BookOpen, description: "Headless CMS for managing blog content."},
  { name: 'Firebase Studio', icon: MonitorSmartphone, description: "Development environment used for building this application." },
];


export default function TechStackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">

        <section className="max-w-2xl mx-auto mb-10 bg-sky-500/15 text-sky-900 dark:text-sky-200 border border-sky-500/30 p-6 shadow-lg">
          <p className="font-body text-base leading-relaxed">
            Beta Version: This application is in early production. Some features are still under development or being refined.
          </p>
        </section>

        <header className="mb-12 text-center">
            <Server className="mx-auto h-12 w-12 text-accent mb-4" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter leading-tight">
                Application Technology & Info
            </h1>
        </header>

        <section className="mb-12">
          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tighter mb-6 text-center">Core Technologies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <Card key={tech.name} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-card border-border h-full">
                <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                  <tech.icon className="h-8 w-8 text-accent shrink-0" />
                  <CardTitle className="font-headline text-lg font-bold tracking-tighter">{tech.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="font-body text-sm text-muted-foreground">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-0 pb-0">
          <Card className="mb-0">
            <CardHeader>
              <CardTitle className="font-headline text-xl font-bold tracking-tighter flex items-center">
                <Rocket className="mr-3 h-6 w-6 text-accent" />
                Development Timeline
              </CardTitle>
              <CardDescription className="font-body">
                An overview of the project's development phases and key implemented features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="font-headline text-lg font-bold tracking-tighter mb-1 sm:mb-0">Version 0.1.0 - Initial Prototype</CardTitle>
                    <Badge variant="secondary" className="bg-green-600 text-white">Done</Badge>
                  </div>
                  <CardDescription className="font-body text-xs">Completed: Approx. May 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm mb-2">Key Features:</p>
                  <ul className="list-disc list-inside font-body text-sm space-y-1 text-muted-foreground">
                    <li>Basic Next.js setup with ShadCN UI & Tailwind CSS.</li>
                    <li>Core pages: Home, About, Coaches, Classes, Contact.</li>
                    <li>Contentful integration for Blog (listing & detail pages).</li>
                    <li>Basic layout, navigation (Navbar, Footer), and theme toggle (dark/light).</li>
                    <li>Initial project structure and component organization.</li>
                  </ul>
                </CardContent>
              </Card>

              <Separator />

              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="font-headline text-lg font-bold tracking-tighter mb-1 sm:mb-0">Version 0.2.0 - Firebase Integration & Core Functionality</CardTitle>
                    <Badge variant="secondary" className="bg-green-600 text-white">Done</Badge>
                  </div>
                  <CardDescription className="font-body text-xs">Completed: July 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm mb-2">Key Features:</p>
                  <ul className="list-disc list-inside font-body text-sm space-y-1 text-muted-foreground">
                    <li>Firebase project setup: Firestore for dynamic data.</li>
                    <li>Admin section for Events: CRUD operations.</li>
                    <li>Admin section for Lesson Reports: Create, View, Edit, Delete.</li>
                    <li>Client-side PDF download for Lesson Reports.</li>
                    <li>Coach admin profiles listing their lesson reports.</li>
                    <li>Interactive Analysis Board page with PGN download.</li>
                    <li>Event Calendar on homepage, fetching data from Firestore.</li>
                    <li>Lichess TV embed on homepage.</li>
                    <li>Deployment to Firebase App Hosting.</li>
                    <li>UI/UX refinements: click effects, toast notifications, typography adjustments, loading states.</li>
                  </ul>
                </CardContent>
              </Card>
               <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="font-headline text-lg font-bold tracking-tighter mb-1 sm:mb-0">Version 0.3.0 - AI & Polish</CardTitle>
                    <Badge variant="secondary" className="bg-purple-500 text-white">Planned</Badge>
                  </div>
                  <CardDescription className="font-body text-xs">Target: Q3/Q4 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm mb-2">Key Features:</p>
                  <ul className="list-disc list-inside font-body text-sm space-y-1 text-muted-foreground">
                    <li>Genkit integration for AI-powered features (e.g., basic analysis hints).</li>
                    <li>Firebase Authentication for user roles (Admin, Coach, Student).</li>
                    <li>Refined UI/UX and improved error handling.</li>
                    <li>Comprehensive Firestore security rules.</li>
                    <li>User profile management for coaches and students.</li>
                    <li>Notifications (email/in-app) for events or report submissions.</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}

    