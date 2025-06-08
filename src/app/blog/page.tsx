
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts, type BlogPost } from '@/lib/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - kgchess',
  description: 'Read the latest articles, news, and insights from kgchess.',
};

export default function BlogIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight">
            Our Blog
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Stay updated with the latest articles, news, and insights from the world of chess and our coaching experiences.
          </p>
        </header>

        {blogPosts.length === 0 ? (
          <p className="text-center font-body text-muted-foreground text-xl">
            No blog posts yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {blogPosts.map((post) => (
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
                  <p className="font-body text-sm text-muted-foreground line-clamp-4">
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
        )}
      </main>
      <Footer />
    </div>
  );
}
