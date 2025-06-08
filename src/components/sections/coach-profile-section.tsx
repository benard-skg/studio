
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';

const coachData = {
  name: "Mahomole S.K",
  title: "Certified Chess Coach & Strategist",
  imageSrc: "https://i.ibb.co/GzyZvGj/20250512-215848.jpg",
  imageAlt: "Portrait of Coach Mahomole S.K.",
  imageAiHint: "chess coach portrait"
};

export default function CoachProfileSection() {
  return (
    <section id="profile" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <UserCircle2 className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Meet Your Coach
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            {coachData.title}
          </p>
        </div>

        <Card className="overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-1/3 relative h-64 md:h-auto"> {/* Added relative and min-height for parent of fill image */}
              <Image
                src={coachData.imageSrc}
                alt={coachData.imageAlt}
                fill
                style={{ objectFit: 'cover' }}
                className="w-full h-full" // ClassName object-cover might be redundant with style but harmless
                data-ai-hint={coachData.imageAiHint}
                priority // Ensure coach image loads quickly
                sizes="(max-width: 768px) 100vw, 33vw" // Example sizes, adjust as needed
              />
            </div>
            <div className="md:w-2/3">
              <CardHeader>
                <div>
                  <CardTitle className="font-headline text-3xl font-extrabold tracking-tighter leading-tight">
                    {coachData.name}
                  </CardTitle>
                  <p className="font-body text-sm text-muted-foreground leading-tight mt-1">
                    193019609 (Chess SA ID)
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-tight mt-0.5">
                    14310155 (FIDE ID)
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="font-body text-base leading-relaxed space-y-4">
                  <p>
                    With <strong>over 20 years of competitive chess experience</strong> and <strong>5+ years coaching students</strong>, I bring deep tactical knowledge and a passion for nurturing talent. I’ve:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>
                      <strong>Represented Limpopo at national levels</strong> (Junior Teams: <em>2001–2012</em> / Senior Team &amp; Polokwane Chess Club).
                    </li>
                    <li>
                      <strong>Ranked as a top player</strong> for Polokwane Chess Club (First Team).
                    </li>
                    <li>
                      <strong>Certified Level-1 National Chess Instructor</strong> (FIDE-rated).
                    </li>
                  </ul>
                  <p>
                    My coaching blends <strong>elite tournament insights</strong> with structured training to help players <em>think sharper, react faster, and win more</em>.
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
