
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Target, Eye, Lightbulb, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'About LCA - Our Mission and Vision',
  description: 'Learn more about LCA, our mission, vision, and commitment to chess excellence.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight">
            About LCA
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Elevating Chess Excellence, One Move at a Time.
          </p>
        </header>

        <section className="mb-16">
          <Card className="shadow-lg border-border bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center">
                <Target className="h-8 w-8 mr-3 text-accent" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground">
                At LCA, our mission is to provide top-tier chess coaching that empowers players of all levels to achieve their full potential. We foster a supportive learning environment where strategic thinking, tactical sharpness, and a love for the game flourish. We believe in personalized guidance to help each student master the complexities of chess and build confidence both on and off the board.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <Card className="shadow-lg border-border bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center">
                <Eye className="h-8 w-8 mr-3 text-accent" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground">
                Our vision is to be a leading center for chess education, recognized for our innovative coaching methods and the success of our students. We aim to cultivate a vibrant community of chess enthusiasts who are not only skilled players but also critical thinkers and lifelong learners, contributing positively to the world of chess.
              </p>
            </CardContent>
          </Card>
        </section>
        
        <Separator className="my-12" />

        <section className="mb-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Our Philosophy</h2>
            <div className="flex items-start mb-6">
              <Lightbulb className="h-10 w-10 text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h3 className="font-headline text-xl font-semibold mb-1">Innovative Learning</h3>
                <p className="font-body text-muted-foreground">
                  We embrace modern teaching techniques combined with timeless chess wisdom to create effective and engaging learning experiences.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-10 w-10 text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h3 className="font-headline text-xl font-semibold mb-1">Community Focused</h3>
                <p className="font-body text-muted-foreground">
                  LCA is more than just classes; it's a community. We encourage collaboration, sportsmanship, and mutual growth among our students.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Chess community event" 
              fill 
              className="object-cover"
              data-ai-hint="chess club event"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>

        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-center">Join Our Journey</h2>
            <p className="font-body text-lg text-muted-foreground text-center max-w-xl mx-auto">
                Whether you're a beginner taking your first steps or an experienced player aiming for new heights, LCA is here to guide you. Explore our classes and become part of our thriving chess family.
            </p>
             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                    <Image 
                        src="https://placehold.co/400x400.png" 
                        alt="Students learning chess" 
                        fill 
                        className="object-cover"
                        data-ai-hint="students learning"
                        sizes="(max-width: 640px) 100vw, 50vw"
                    />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                    <Image 
                        src="https://placehold.co/400x400.png" 
                        alt="Chess game in progress" 
                        fill 
                        className="object-cover"
                        data-ai-hint="chess game"
                        sizes="(max-width: 640px) 100vw, 50vw"
                    />
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
