
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { getBlogPostBySlug, getAllBlogPostSlugs } from '@/lib/contentful';
import type { BlogPost } from '@/lib/types';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types'; // Changed BLOCKS.HYPERLINK to INLINES.HYPERLINK contextually
import type { Metadata, ResolvingMetadata } from 'next';

// Revalidate this page (e.g., every 10 seconds)
export const revalidate = 10;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found - LCA Blog',
      description: 'The article you are looking for could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  let openGraphImages = previousImages;
  if (post.featuredImage?.fields?.file?.url) {
    openGraphImages = [`https:${post.featuredImage.fields.file.url}`, ...previousImages];
  }


  return {
    title: `${post.title} - LCA Blog`,
    description: post.excerpt || 'Read this article from LCA.',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Read this article from LCA.',
      images: openGraphImages,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const asset = node.data?.target as any;
      if (asset && asset.fields?.file?.url && asset.fields.file.contentType.startsWith('image/')) {
        const imageUrl = `https:${asset.fields.file.url}`;
        const altText = asset.fields.description || asset.fields.title || 'Embedded blog image';
        return `<div style="margin: 1.5rem 0; text-align: center;"><img src="${imageUrl}" alt="${altText}" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /></div>`;
      }
      return '';
    },
    [BLOCKS.PARAGRAPH]: (node: any, next: (nodes: any) => string) => `<p class="my-4 font-body text-base leading-relaxed">${next(node.content)}</p>`,
    [BLOCKS.HEADING_1]: (node: any, next: (nodes: any) => string) => `<h1 class="font-headline text-3xl sm:text-4xl font-extrabold mt-10 mb-5">${next(node.content)}</h1>`,
    [BLOCKS.HEADING_2]: (node: any, next: (nodes: any) => string) => `<h2 class="font-headline text-2xl sm:text-3xl font-bold mt-8 mb-4">${next(node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (node: any, next: (nodes: any) => string) => `<h3 class="font-headline text-xl sm:text-2xl font-semibold mt-6 mb-3">${next(node.content)}</h3>`,
    [BLOCKS.HEADING_4]: (node: any, next: (nodes: any) => string) => `<h4 class="font-headline text-lg sm:text-xl font-semibold mt-5 mb-2">${next(node.content)}</h4>`,
    [BLOCKS.UL_LIST]: (node: any, next: (nodes: any) => string) => `<ul class="list-disc list-inside space-y-1 pl-4 my-4 font-body">${next(node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (node: any, next: (nodes: any) => string) => `<ol class="list-decimal list-inside space-y-1 pl-4 my-4 font-body">${next(node.content)}</ol>`,
    [BLOCKS.QUOTE]: (node: any, next: (nodes: any) => string) => `<blockquote class="border-l-4 border-accent pl-4 italic my-4 font-body text-muted-foreground">${next(node.content)}</blockquote>`,
    [INLINES.HYPERLINK]: (node: any, next: (nodes: any) => string) => {
        const href = node.data.uri;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-medium">${next(node.content)}</a>`;
    }
  },
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const htmlContent = post && post.content && typeof post.content === 'object' && post.content.nodeType === 'document'
    ? documentToHtmlString(post.content, richTextOptions)
    : '';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto">
            <header className="mb-8">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-3">
                {post.title}
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Published on {post.date}
              </p>
            </header>

            {post.featuredImage && post.featuredImage.fields.file.url && (
              <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={`https:${post.featuredImage.fields.file.url}`}
                  alt={post.featuredImage.fields.description || post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                />
              </div>
            )}

            {typeof htmlContent === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <p>Error: Content could not be rendered.</p>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
