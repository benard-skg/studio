
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { blogPosts, type BlogPost } from '@/lib/blog-data';
import type { Metadata, ResolvingMetadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Function to find a blog post by slug
function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found - kgchess Blog',
      description: 'The blog post you are looking for could not be found.',
    };
  }

  return {
    title: `${post.title} - kgchess Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.imageSrc ? [post.imageSrc] : [],
      type: 'article',
      publishedTime: post.date, // Assuming date is in a format OpenGraph understands
    },
  };
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Triggers the not-found.js or default Next.js 404 page
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>

          <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto">
            <header className="mb-8">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-3">
                {post.title}
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Published on {post.date}
              </p>
            </header>

            {post.imageSrc && (
              <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={post.imageSrc}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority // Prioritize loading the main blog image
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  data-ai-hint={post.imageAiHint}
                />
              </div>
            )}
            
            {/* Render HTML content */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Optional: Create a not-found.tsx in this directory or app directory
// to customize the 404 page for blog posts specifically.
