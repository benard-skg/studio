
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Layers, Wind, BrainCircuit, Database, Code, BookOpen, Palette, MonitorSmartphone, Rocket, Wrench, ExternalLink, ListChecks, Route } from 'lucide-react';
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

const deferredFeatures = [
    "PGN file processing and storage (beyond just filename)",
    "Direct PGN parsing and board replay from uploads in Lesson Reports",
    "PDF export for lesson reports",
    "Full student dashboard integration (linking reports, progress tracking)",
    "Lesson report editing functionality",
    "Advanced AI-driven analysis suggestions based on lesson reports",
    "Real-time collaborative analysis board features",
    "Linking reports to student dashboards from coach admin page",
    "Authentication and role-based access control for admin areas",
    "More robust error handling and data validation across all forms and API interactions"
];


export default function TechStackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        
        <section className="max-w-2xl mx-auto mb-10 bg-destructive/20 text-destructive dark:bg-destructive/15 dark:text-destructive-foreground/90 border border-destructive/30 rounded-xl p-6 shadow-lg animate-subtle-pulse-15s">
          <p className="font-body text-base leading-relaxed">
            This application is a prototype, largely developed using a mobile device. It is intended for demonstration purposes and may not include full security, polish, or feature completeness.
          </p>
        </section>

        <section className="mb-12">
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

        <Separator className="my-12" />

        <section className="mb-12">
          <Card className="bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 animate-double-subtle-pulse-5s">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center">
                <ListChecks className="mr-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
                Future Enhancements & Deferred Items
              </CardTitle>
              <CardDescription className="font-body text-amber-700 dark:text-amber-300">
                Features and improvements planned or discussed but not yet implemented.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 font-body text-sm">
                {deferredFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
        
        <Separator className="my-12" />
        
        <section className="mb-0 pb-0"> {/* Removed bottom margin */}
          <Card className="mb-0"> {/* Removed bottom margin */}
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center">
                <Rocket className="mr-3 h-6 w-6 text-accent" />
                Development Timeline (Placeholder)
              </CardTitle>
              <CardDescription className="font-body">
                A conceptual overview of the project's development phases. Please fill with actual data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Milestone 1 Example */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="font-headline text-xl mb-1 sm:mb-0">Version 0.1.0 - Initial Prototype</CardTitle>
                    <Badge variant="secondary" className="bg-green-600 text-white">Done</Badge>
                  </div>
                  <CardDescription className="font-body text-xs">Released: YYYY-MM-DD</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm mb-2">Key Features:</p>
                  <ul className="list-disc list-inside font-body text-sm space-y-1 text-muted-foreground">
                    <li>Basic Next.js setup with ShadCN UI.</li>
                    <li>Core pages: Home, About, Coaches, Classes.</li>
                    <li>Initial Contentful integration for Blog.</li>
                  </ul>
                  <div className="mt-3 flex space-x-2">
                    {/* <Button variant="outline" size="sm" asChild><Link href="#" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1.5"/>GitHub</Link></Button> */}
                    {/* <Button variant="outline" size="sm" asChild><Link href="#" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1.5"/>Live Demo</Link></Button> */}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Milestone 2 Example */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="font-headline text-xl mb-1 sm:mb-0">Version 0.2.0 - Admin & Interactivity</CardTitle>
                    <Badge variant="secondary" className="bg-blue-500 text-white">In Progress</Badge>
                  </div>
                  <CardDescription className="font-body text-xs">Target: YYYY-MM-DD</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm mb-2">Key Features:</p>
                  <ul className="list-disc list-inside font-body text-sm space-y-1 text-muted-foreground">
                    <li>Admin panel for contact submissions & settings.</li>
                    <li>Interactive Analysis Board.</li>
                    <li>Lesson Report creation for coaches.</li>
                    <li>JSONBin.io integration for dynamic data.</li>
                  </ul>
                   <div className="mt-3 flex space-x-2">
                     {/* <Button variant="outline" size="sm" asChild><Link href="#" target="_blank" rel="noopener noreferrer"><Wrench className="mr-1.5"/>View Tasks</Link></Button> */}
                  </div>
                </CardContent>
              </Card>
              
              {/* Add more milestones as needed */}

            </CardContent>
          </Card>
        </section>


      </main>
      <Footer />
    </div>
  );
}

