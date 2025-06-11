
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/utils'; // Import slugify

interface Coach {
  name: string;
  nickname?: string; // Added nickname
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageAiHint: string;
  chessSaId?: string;
  fideId?: string;
  profileInfo: string;
}

// Updated coach data with nicknames
export const allCoachesData: Coach[] = [ // Export for use in admin page
  {
    name: "Mahomole S.K",
    nickname: "KG",
    title: "Certified Chess Coach & Strategist",
    imageSrc: "https://i.ibb.co/GzyZvGj/20250512-215848.jpg",
    imageAlt: "Portrait of Coach Mahomole S.K.",
    imageAiHint: "chess coach portrait",
    chessSaId: "193019609",
    fideId: "14310155",
    profileInfo: `With <strong>over 20 years of competitive chess experience</strong> and <strong>5+ years coaching students</strong>, I bring deep tactical knowledge and a passion for nurturing talent. I’ve:
    <ul class="list-disc list-inside space-y-1 pl-4">
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
    My coaching blends <strong>elite tournament insights</strong> with structured training to help players <em>think sharper, react faster, and win more</em>.`
  },
  {
    name: "Mahomole M.J",
    nickname: "Joe",
    title: "Certified Chess Coach & Strategist",
    imageSrc: "https://i.ibb.co/RTDZx7fc/Screenshot-20250609-224422-You-Tube.jpg",
    imageAlt: "Portrait of Coach Mahomole M.J.",
    imageAiHint: "chess instructor photo",
    chessSaId: "162019603",
    fideId: "14303876",
    profileInfo: `Experienced in higher-level strategy and tournament play, I focus on refining students' games for competitive success. Key areas of my coaching are:
    <ul class="list-disc list-inside space-y-1 pl-4">
      <li>
        Focuses on <strong>endgame mastery and strategic planning</strong> for complex positions.
      </li>
      <li>
        Extensive experience in <strong>tournament play and preparation techniques</strong>.
      </li>
      <li>
        Emphasizes the <strong>psychological aspects of competitive chess</strong>, including resilience and focus.
      </li>
    </ul>
    Dedicated to helping students achieve their full potential by <em>building a strong foundation and a winning mindset</em>.`
  },
  {
    name: "Mahomole T.R",
    nickname: "Tebogo",
    title: "Certified Chess Coach & Strategist",
    imageSrc: "https://i.ibb.co/fJBTzr1/IMG-20250119-WA0000-41538-e1738142791424-780x470.jpg",
    imageAlt: "Portrait of Coach Mahomole T.R.",
    imageAiHint: "chess coach profile",
    chessSaId: "189019610",
    fideId: "14303884",
    profileInfo: `With a strong background in competitive chess and a focus on youth development, I specialize in building foundational skills and tactical awareness. My approach includes:
    <ul class="list-disc list-inside space-y-1 pl-4">
      <li>
        <strong>Passionate about developing young talent</strong> and fostering a love for the game.
      </li>
      <li>
        Specializes in <strong>opening theory and tactical sharpness</strong> tailored for improving players.
      </li>
      <li>
        Believes in a <strong>personalized approach to coaching</strong>, adapting to each student's unique learning style and goals.
      </li>
    </ul>
    My goal is to empower students with the skills and confidence to <em>excel in chess and beyond</em>.`
  },
];

interface CoachProfileSectionProps {
  displayMode?: "all" | "singleRandom";
}

export default function CoachProfileSection({ displayMode = "all" }: CoachProfileSectionProps) {
  const [coachesToDisplay, setCoachesToDisplay] = useState<Coach[]>(
    displayMode === "all" ? allCoachesData : [] 
  );

  useEffect(() => {
    if (displayMode === "singleRandom") {
      if (allCoachesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * allCoachesData.length);
        setCoachesToDisplay([allCoachesData[randomIndex]]);
      } else {
        setCoachesToDisplay([]);
      }
    } else {
      setCoachesToDisplay(allCoachesData);
    }
  }, [displayMode]);

  if (coachesToDisplay.length === 0 && displayMode === "singleRandom") {
    return null; 
  }
  
  return (
    <section id="profile" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <UserCircle2 className="mx-auto h-12 w-12 text-accent mb-4" />
          {displayMode === 'all' ? (
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
              Meet Our Coaches
            </h2>
          ) : (
            <Link href="/coaches" className="inline-block">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight hover:text-accent transition-colors duration-300">
                Meet Our Coaches
              </h2>
            </Link>
          )}
          <p className="font-body text-lg text-muted-foreground mt-2">
            Certified Chess Coaches & Strategists
          </p>
        </div>

        <div className="space-y-12">
          {coachesToDisplay.map((coach, index) => (
            <Card key={coach.name} className="overflow-hidden shadow-xl">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image
                    src={coach.imageSrc}
                    alt={coach.imageAlt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="w-full h-full"
                    data-ai-hint={coach.imageAiHint}
                    priority={index === 0 && displayMode === "all"} 
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="md:w-2/3">
                  <CardHeader>
                    <div>
                      <CardTitle className="font-headline text-3xl font-extrabold tracking-tighter leading-tight">
                        <Link href={`/admin/coaches/${slugify(coach.name)}`} className="hover:text-accent transition-colors">
                          {coach.name} {coach.nickname && `(${coach.nickname})`}
                        </Link>
                      </CardTitle>
                      {coach.chessSaId && (
                        <p className="font-body text-sm text-muted-foreground leading-tight mt-1">
                          Chess SA ID: {coach.chessSaId}
                        </p>
                      )}
                      {coach.fideId && (
                        <p className="font-body text-sm text-muted-foreground leading-tight mt-0.5">
                          FIDE ID: {coach.fideId}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div 
                      className="font-body text-base leading-relaxed space-y-4 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: coach.profileInfo }} 
                    />
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

    