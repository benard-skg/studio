import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2, Award, Briefcase } from 'lucide-react';

const coachData = {
  name: "K.G.",
  title: "Certified Chess Coach & Strategist",
  bio: "With over a decade of competitive chess experience and a passion for teaching, K.G. is dedicated to helping players of all levels elevate their game. K.G. believes in a personalized approach, focusing on individual strengths and weaknesses to build a comprehensive understanding of chess strategy and tactics.",
  experience: [
    "10+ years of competitive chess playing",
    "5+ years of coaching students from beginner to advanced levels",
    "Expert in opening theory, middlegame strategy, and endgame technique",
  ],
  credentials: [
    "Certified National Chess Instructor",
    "FIDE Rated Player",
    "Regular contributor to leading chess publications",
  ],
  imageSrc: "https://placehold.co/400x400.png",
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
              />
            </div>
            <div className="md:w-2/3">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">{coachData.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="font-body text-base leading-relaxed">
                  {coachData.bio}
                </p>
                
                <div>
                  <h3 className="font-headline text-xl font-semibold mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-accent" />
                    Experience
                  </h3>
                  <ul className="font-body list-disc list-inside space-y-1 text-base">
                    {coachData.experience.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-semibold mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-accent" />
                    Credentials
                  </h3>
                  <ul className="font-body list-disc list-inside space-y-1 text-base">
                    {coachData.credentials.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
