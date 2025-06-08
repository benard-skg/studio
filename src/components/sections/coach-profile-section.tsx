
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';

const coachesData = [
  {
    name: "Mahomole S.K",
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
    name: "Mahomole T.R",
    title: "Certified Chess Coach & Strategist",
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Portrait of Coach Mahomole T.R.",
    imageAiHint: "chess instructor profile",
    chessSaId: "189019610",
    fideId: "14303884",
    profileInfo: `Lorem ipsum dolor sit amet, <strong>consectetur adipiscing elit</strong>. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    <ul class="list-disc list-inside space-y-1 pl-4">
      <li>
        <strong>Passionate about developing young talent</strong> and fostering a love for the game.
      </li>
      <li>
        Specializes in <strong>opening theory and tactical sharpness</strong>.
      </li>
      <li>
        Believes in a <strong>personalized approach to coaching</strong>, adapting to each student's unique learning style.
      </li>
    </ul>
    My goal is to empower students with the skills and confidence to <em>excel in chess and beyond</em>.`
  },
  {
    name: "Mahomole M.J",
    title: "Certified Chess Coach & Strategist",
    imageSrc: "https://placehold.co/600x400.png",
    imageAlt: "Portrait of Coach Mahomole M.J.",
    imageAiHint: "chess teacher face",
    chessSaId: "162019603",
    fideId: "14303876",
    profileInfo: `Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. <strong>Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante</strong>. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
    <ul class="list-disc list-inside space-y-1 pl-4">
      <li>
        Focuses on <strong>endgame mastery and strategic planning</strong>.
      </li>
      <li>
        Extensive experience in <strong>tournament play and preparation</strong>.
      </li>
      <li>
        Emphasizes the <strong>psychological aspects of competitive chess</strong>.
      </li>
    </ul>
    Dedicated to helping students achieve their full potential by <em>building a strong foundation and a winning mindset</em>.`
  },
];

export default function CoachProfileSection() {
  return (
    <section id="profile" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <UserCircle2 className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Meet Our Coaches
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Certified Chess Coaches & Strategists
          </p>
        </div>

        <div className="space-y-12">
          {coachesData.map((coach, index) => (
            <Card key={index} className="overflow-hidden shadow-xl">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image
                    src={coach.imageSrc}
                    alt={coach.imageAlt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="w-full h-full"
                    data-ai-hint={coach.imageAiHint}
                    priority={index === 0} // Prioritize the first coach's image
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="md:w-2/3">
                  <CardHeader>
                    <div>
                      <CardTitle className="font-headline text-3xl font-extrabold tracking-tighter leading-tight">
                        {coach.name}
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
