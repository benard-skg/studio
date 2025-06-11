
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLatestBlogPost, getBlogPosts } from '@/lib/contentful'; // Updated to get latest post
import type { BlogPost } from '@/lib/types';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

// Revalidate this component's data periodically (e.g., every hour)
export const revalidate = 3600;

const linkClasses = "transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-1 focus:ring-ring rounded-sm";

export default async function BlogSection() {
  const latestPost: BlogPost | null = await getLatestBlogPost();
  // Fetch all posts to determine if "View All Posts" button should be shown
  const allPosts: BlogPost[] = await getBlogPosts(); 

  if (!latestPost) {
    return null; // Don't render the section if there are no posts
  }

  const postsToDisplay = [latestPost]; // We only want to display the latest one here

  return (
    <section id="blog" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Newspaper className="mx-auto h-12 w-12 text-accent mb-4" />
          <Link href="/blog" className={cn("inline-block p-1 -m-1",linkClasses)}>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight hover:text-accent">
              Latest From The Blog
            </h2>
          </Link>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Our most recent insight, news, or update.
          </p>
        </div>

        {/* Grid container for a single, centered, larger card */}
        <div className="flex justify-center">
          {postsToDisplay.map((post) => (
            <Card 
              key={post.slug} 
              className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden w-full max-w-2xl mx-auto" // Increased max-width
            >
              {post.featuredImage && post.featuredImage.fields.file.url && (
                <Link href={`/blog/${post.slug}`} className={cn("block", linkClasses)}>
                  <div className="aspect-[16/9] relative w-full">
                    <Image
                      src={`https:${post.featuredImage.fields.file.url}`}
                      alt={post.featuredImage.fields.title || post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
              )}
              <CardHeader>
                <Link href={`/blog/${post.slug}`} className={cn("p-0.5 -m-0.5", linkClasses)}>
                  <CardTitle className="font-headline text-xl font-extrabold tracking-tighter leading-tight hover:text-accent">
                    {post.title}
                  </CardTitle>
                </Link>
                <CardDescription className="font-body text-sm pt-1">{post.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-4"> {/* Adjusted padding */}
                <p className="font-body text-sm text-muted-foreground line-clamp-4"> {/* Increased line-clamp */}
                  {post.excerpt}
                </p>
              </CardContent>
              {/* CardFooter with "Read More" button removed */}
            </Card>
          ))}
        </div>
        {allPosts.length > 1 && ( // Show button if there's more than one post in total
           <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all transform hover:scale-105 rounded-lg px-8 py-3 text-lg">
              <Link href="/blog">View All Posts</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
