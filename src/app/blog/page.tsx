
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBlogPosts } from '@/lib/contentful';
import type { BlogPost } from '@/lib/types';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Articles - LCA',
  description: 'Read the latest articles, strategy tips, and insights from the LCA team.',
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const blogPosts: BlogPost[] = await getBlogPosts();

  const gridContainerClasses = blogPosts.length === 1
    ? "flex justify-center"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter leading-tight">
            Articles from LCA Team
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Stay updated with our latest chess strategies, game analyses, and coaching insights.
          </p>
        </header>

        {blogPosts.length === 0 ? (
          <p className="text-center font-body text-muted-foreground text-xl py-10">
            No articles published yet. Check back soon!
          </p>
        ) : (
          <div className={gridContainerClasses}>
            {blogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Card
                  className={cn(
                    "flex flex-col shadow-lg group-hover:shadow-xl group-hover:bg-accent/5 group-active:bg-accent/10 group-active:scale-95 transition-all duration-300 overflow-hidden bg-card border-border h-full",
                    blogPosts.length === 1 && "w-full max-w-2xl"
                  )}
                >
                  {post.thumbnail && post.thumbnail.fields.file.url && (
                      <div className="aspect-[16/9] relative w-full">
                        <Image
                          src={`https:${post.thumbnail.fields.file.url}`}
                          alt={post.thumbnail.fields.description || post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                  )}
                  <CardHeader>
                      <CardTitle className="font-headline text-xl md:text-2xl font-black tracking-tighter leading-tight group-hover:text-accent transition-colors">
                        {post.title}
                      </CardTitle>
                    <CardDescription className="font-body text-sm pt-1">{post.date}</CardDescription>
                  </CardHeader>
                  {post.excerpt && (
                     <CardContent className="flex-grow pb-4">
                      <p className="font-body text-sm text-muted-foreground line-clamp-4">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
