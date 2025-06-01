
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollText, CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const blogPosts = [
  {
    title: "Mastering the Sicilian Defense: Key Ideas",
    date: "October 26, 2023",
    excerpt: "An in-depth look at common structures and strategic plans in the Sicilian Defense, one of chess's most popular openings.",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "chess opening strategy",
    slug: "/blog/sicilian-defense-ideas"
  },
  {
    title: "Endgame Essentials: Rook and Pawn Endings",
    date: "November 5, 2023",
    excerpt: "Unlock the secrets to navigating complex rook and pawn endgames, a critical skill for any serious chess player.",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "chess endgame pawn",
    slug: "/blog/rook-pawn-endgames"
  },
  {
    title: "The Art of Calculation: Improving Your Tactical Vision",
    date: "November 18, 2023",
    excerpt: "Learn effective techniques to enhance your calculation abilities and spot winning combinations with greater accuracy.",
    imageSrc: "https://placehold.co/600x400.png",
    imageAiHint: "chess tactics puzzle",
    slug: "/blog/improving-calculation"
  },
];

function BlogPostCard({ post }: { post: typeof blogPosts[0] }) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden h-full">
      <Link href={post.slug} aria-label={`Read more about ${post.title}`}>
        <Image
          src={post.imageSrc}
          alt={`Blog post image for ${post.title}`}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint={post.imageAiHint}
        />
      </Link>
      <CardHeader>
        <Link href={post.slug} aria-label={`Read more about ${post.title}`}>
          <CardTitle className="font-headline text-xl hover:text-accent transition-colors">{post.title}</CardTitle>
        </Link>
        <div className="flex items-center text-xs text-muted-foreground pt-1">
          <CalendarDays className="h-4 w-4 mr-1.5" />
          <span>{post.date}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="font-body text-sm line-clamp-3">{post.excerpt}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0 text-accent hover:underline">
          <Link href={post.slug}>Read More &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BlogSection() {
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>();

  return (
    <section id="blog" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <ScrollText className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            Chess Insights & Strategy
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Tips, analysis, and updates from the world of chess.
          </p>
        </div>

        {blogPosts.length > 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="md:col-start-2 lg:col-start-2"> {/* Center the single preview card */}
                <BlogPostCard post={blogPosts[0]} />
             </div>
           </div>
        )}

        {blogPosts.length > 1 && (
          <Accordion 
            type="single" 
            collapsible 
            value={openAccordionItem} 
            onValueChange={setOpenAccordionItem}
            className="mt-8"
          >
            <AccordionItem value="more-blog-posts" className="border-none">
              <div className="text-center">
                <AccordionTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    "w-auto mx-auto hover:no-underline bg-card text-card-foreground border-border" // Added background for better visibility on bg-secondary
                  )}
                >
                  {openAccordionItem === 'more-blog-posts' ? 'Show Less' : 'View All Posts'}
                </AccordionTrigger>
              </div>
              <AccordionContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts.slice(1).map((post) => (
                    <BlogPostCard key={post.title} post={post} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        {blogPosts.length === 0 && (
          <p className="text-center font-body text-muted-foreground">No blog posts yet.</p>
        )}
      </div>
    </section>
  );
}
