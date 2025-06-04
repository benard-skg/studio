
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollText, CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { blogPosts, type BlogPost } from '@/lib/blog-data'; // Import from centralized data

function BlogPostCard({ post }: { post: BlogPost }) { // Use BlogPost type
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden h-full">
      <Link href={`/blog/${post.slug}`} aria-label={`Read more about ${post.title}`}>
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
        <Link href={`/blog/${post.slug}`} aria-label={`Read more about ${post.title}`}>
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
          <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
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
             {/* Display first post prominently, or adjust logic as needed. For now, let's ensure it's centered if it's the only one initially visible. */}
             <div className={blogPosts.length === 1 ? "md:col-span-2 lg:col-span-3 flex justify-center" : (blogPosts.length > 1 ? "md:col-start-2 lg:col-start-2" : "md:col-start-2 lg:col-start-2")}>
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
                    "w-auto mx-auto hover:no-underline bg-card text-card-foreground border-border"
                  )}
                >
                  {openAccordionItem === 'more-blog-posts' ? 'Show Less' : 'View All Posts'}
                </AccordionTrigger>
              </div>
              <AccordionContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Ensure we don't repeat the first post if it was already shown above */}
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
