
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { blogPosts, BlogPost } from '@/lib/blog-data';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found - kgchess',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return {
    title: `${post.title} - kgchess Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.imageSrc, // Ensure this is an absolute URL for OpenGraph
          width: 600,
          height: 400,
          alt: post.title,
        },
      ],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound(); // This will render the nearest not-found.tsx or a default Next.js 404 page
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <header className="mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              <span>Published on {post.date}</span>
            </div>
          </header>

          {post.imageSrc && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.imageSrc}
                alt={`Image for ${post.title}`}
                width={768}
                height={432} // Assuming a 16:9 aspect ratio, adjust as needed
                className="w-full h-auto object-cover"
                data-ai-hint={post.imageAiHint}
                priority // Consider if this image is LCP
              />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none font-body space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
           {/* 
            Note: Using dangerouslySetInnerHTML requires trusting the HTML content. 
            For user-generated content or Markdown from less trusted sources, 
            you'd typically use a Markdown parser that sanitizes the output.
            For this MVP with hardcoded trusted HTML, it's acceptable.
           */}
        </article>
      </main>
      <Footer />
    </div>
  );
}

// Optional: If you want to statically generate these pages at build time
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}
