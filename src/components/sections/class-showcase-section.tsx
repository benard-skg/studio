
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const classesData = [
  {
    name: "Introductory Class (0–1500 Rating)",
    price: "R999",
    frequency: "/month",
    description: "Introductory Class (0–1500 Rating)",
    features: [
      "4 one-on-one sessions (2.5 hours each)",
      "Personalized training plan(openings, endgames, tactics, and psychology)",
      "Weekly game analysis (online review of your games to correct mistakes)",
      "curated resources (study guides, puzzle sets, and demo videos).",
    ],
    aiHint: "chess board beginner"
  },
];

const titleLinkClasses = "transition-all duration-200 ease-out hover:text-accent active:text-accent/80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 p-0.5 -m-0.5";


export default function ClassShowcaseSection() {
  const gridContainerClasses = classesData.length === 1
    ? "flex justify-center" // For a single, larger, centered card
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"; // For multiple cards

  return (
    <section id="classes" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <GraduationCap className="mx-auto h-12 w-12 text-accent mb-4" />
          <Link href="/classes" className={cn(titleLinkClasses, "inline-block")}>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter leading-tight text-foreground hover:text-accent">
                Coaching Classes
              </h2>
          </Link>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Choose the plan that best suits your chess journey.
          </p>
        </div>

        <div className={gridContainerClasses}>
          {classesData.map((cls) => (
            <Card
              key={cls.name}
              className={cn(
                "flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden", 
                classesData.length === 1 ? "w-full max-w-xl" : "max-w-md"
              )}
            >
              <CardHeader className="bg-card">
                <CardTitle className="font-headline text-xl md:text-2xl font-bold tracking-tighter leading-tight">{cls.name}</CardTitle>
                <CardDescription className="font-body text-sm">{cls.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4 pt-4">
                <div className="text-center">
                  <span className="font-headline text-4xl font-bold">{cls.price}</span>
                  <span className="font-body text-muted-foreground">{cls.frequency}</span>
                </div>
                <ul className="font-body space-y-2 text-sm">
                  {cls.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-sm text-muted-foreground mt-6 text-center italic">
                  "Learn not just to play—but to dominate."
                </p>
              </CardContent>
              <CardFooter className="bg-card pt-4">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80">
                  <Link href="/contact">Choose Plan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
