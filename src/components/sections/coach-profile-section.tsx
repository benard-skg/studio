
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';

const coachData = {
  name: "K.G.",
  title: "Certified Chess Coach & Strategist",
  imageSrc: "https://i.ibb.co/GzyZvGj/20250512-215848.jpg", 
  imageAlt: "Portrait of Coach K.G.",
  imageAiHint: "chess coach portrait"
};

export default function CoachProfileSection() {
  return (
    <section id="profile" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <UserCircle2 className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            Meet Your Coach
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            {coachData.title}
          </p>
        </div>

        <Card className="overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-1/3">
              <Image
                src={coachData.imageSrc}
                alt={coachData.imageAlt}
                width={400}
                height={400}
                className="object-cover w-full h-full"
                data-ai-hint={coachData.imageAiHint}
                priority // Ensure coach image loads quickly
              />
            </div>
            <div className="md:w-2/3">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">{coachData.name}</CardTitle>
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
