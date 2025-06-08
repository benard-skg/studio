
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts, type BlogPost } from '@/lib/blog-data';
import { Newspaper } from 'lucide-react';

const MAX_PREVIEW_POSTS = 3; // Number of posts to show in the preview

export default function BlogSection() {
  const postsToDisplay = blogPosts.slice(0, MAX_PREVIEW_POSTS);

  if (postsToDisplay.length === 0) {
    return null; // Don't render the section if there are no posts
  }

  return (
    <section id="blog" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Newspaper className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Latest From The Blog
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Insights, news, and updates from our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {postsToDisplay.map((post) => (
            <Card key={post.slug} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-[16/9] relative w-full">
                  <Image
                    src={post.imageSrc}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={post.imageAiHint}
                  />
                </div>
              </Link>
              <CardHeader>
                <Link href={`/blog/${post.slug}`}>
                  <CardTitle className="font-headline text-xl font-extrabold tracking-tighter leading-tight hover:text-accent transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
                <CardDescription className="font-body text-sm pt-1">{post.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-body text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto font-body text-sm text-accent hover:text-accent/80">
                  <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {blogPosts.length > MAX_PREVIEW_POSTS && (
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
