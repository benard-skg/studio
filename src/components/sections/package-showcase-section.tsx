// This component is not currently used in the application.
// It can be safely removed or kept for future use if package showcases are planned.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const packages = [
  {
    name: "Beginner's Gambit",
    price: "$99",
    frequency: "/month",
    description: "Perfect for new players looking to understand the fundamentals of chess.",
    features: [
      "4 one-on-one sessions (1 hour each)",
      "Personalized opening repertoire basics",
      "Introduction to key tactical motifs",
      "Weekly puzzle assignments",
    ],
    aiHint: "chess board beginner"
  },
  {
    name: "Intermediate Strategy",
    price: "$199",
    frequency: "/month",
    description: "Develop deeper strategic understanding and refine your middlegame play.",
    features: [
      "4 one-on-one sessions (1.5 hours each)",
      "Advanced opening analysis",
      "Middlegame planning and positional play",
      "In-depth game analysis",
      "Access to curated study materials",
    ],
    aiHint: "chess strategy book"
  },
  {
    name: "Advanced Mastery",
    price: "$349",
    frequency: "/month",
    description: "For serious players aiming for tournament success and peak performance.",
    features: [
      "Unlimited one-on-one sessions (flexible scheduling)",
      "Customized tournament preparation",
      "Advanced endgame studies",
      "Psychological aspects of chess mastery",
      "Direct line support with coach",
    ],
    aiHint: "chess tournament trophy"
  },
];

export default function PackageShowcaseSection() {
  return (
    <section id="packages" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Package className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            Coaching Packages
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Choose the plan that best suits your chess journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.name} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader className="bg-card">
                <CardTitle className="font-headline text-2xl">{pkg.name}</CardTitle>
                <CardDescription className="font-body text-sm">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4 pt-4">
                <div className="text-center">
                  <span className="font-headline text-4xl font-bold">{pkg.price}</span>
                  <span className="font-body text-muted-foreground">{pkg.frequency}</span>
                </div>
                <ul className="font-body space-y-2 text-sm">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-card pt-4">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-md">
                  <Link href="#contact">Choose Plan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
