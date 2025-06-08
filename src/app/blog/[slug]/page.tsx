
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { getBlogPost, getBlogPosts } from '@/lib/contentful';
import type { BlogPost } from '@/lib/types';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { Metadata, ResolvingMetadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Revalidate this page every hour
export const revalidate = 3600; 

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found - LCA Blog',
      description: 'The blog post you are looking for could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${post.title} - LCA Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [`https:${post.featuredImage.fields.file.url}`, ...previousImages] : previousImages,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
    },
  };
}

// Generate static paths for all blog posts at build time (optional, but good for SEO and performance)
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const asset = node.data?.target as any; // Type assertion
      if (asset && asset.fields?.file?.url && asset.fields.file.contentType.startsWith('image/')) {
        return (
          <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={`https:${asset.fields.file.url}`}
              alt={asset.fields.title || 'Embedded blog image'}
              fill
              className="object-contain"
               sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
            />
          </div>
        );
      }
      return null; // Or some fallback for non-image assets
    },
    // You can add more custom renderers for other BLOCKS or INLINES here
    // For example, to style paragraphs:
    // [BLOCKS.PARAGRAPH]: (node, children) => `<p class="my-4 text-base leading-relaxed">${children}</p>`,
    // [BLOCKS.HEADING_2]: (node, children) => `<h2 class="text-2xl font-semibold mt-6 mb-3">${children}</h2>`,
    // [BLOCKS.HEADING_3]: (node, children) => `<h3 class="text-xl font-semibold mt-5 mb-2">${children}</h3>`,
  },
};


export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound(); // Triggers the not-found.js or default Next.js 404 page
  }

  const htmlContent = post.content ? documentToHtmlString(post.content, richTextOptions) : '';

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

            {post.featuredImage && (
              <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={`https:${post.featuredImage.fields.file.url}`}
                  alt={post.featuredImage.fields.title || post.title}
                  fill
                  className="object-cover"
                  priority // Prioritize loading the main blog image
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                />
              </div>
            )}
            
            {/* Render HTML content from Rich Text */}
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
