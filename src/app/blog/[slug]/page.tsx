
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { getBlogPostBySlug, getAllBlogPostSlugs } from '@/lib/contentful';
import type { BlogPost } from '@/lib/types';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Metadata, ResolvingMetadata } from 'next';
// import { Button } from '@/components/ui/button'; // Button no longer needed
// import Link from 'next/link'; // Link no longer needed for back button
// import { ArrowLeft } from 'lucide-react'; // ArrowLeft no longer needed

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

// Simplified richTextOptions for debugging
const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const asset = node.data?.target as any;
      if (asset && asset.fields?.file?.url && asset.fields.file.contentType.startsWith('image/')) {
        const imageUrl = `https:${asset.fields.file.url}`;
        const altText = asset.fields.description || asset.fields.title || 'Embedded blog image';
        // Ensure this returns an HTML string
        return `<div style="margin: 1.5rem 0; text-align: center;"><img src="${imageUrl}" alt="${altText}" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" /></div>`;
      }
      return ''; 
    },
    // Temporarily remove other custom renderers to isolate the issue
    // [BLOCKS.PARAGRAPH]: (node: any, children: any) => `<p class="my-4 font-body text-base leading-relaxed">${children}</p>`,
    // [BLOCKS.HEADING_2]: (node: any, children: any) => `<h2 class="font-headline text-2xl sm:text-3xl font-bold mt-8 mb-4">${children}</h2>`,
    // [BLOCKS.HEADING_3]: (node: any, children: any) => `<h3 class="font-headline text-xl sm:text-2xl font-semibold mt-6 mb-3">${children}</h3>`,
    // [BLOCKS.UL_LIST]: (node: any, children: any) => `<ul class="list-disc list-inside space-y-1 pl-4 my-4 font-body">${children}</ul>`,
    // [BLOCKS.OL_LIST]: (node: any, children: any) => `<ol class="list-decimal list-inside space-y-1 pl-4 my-4 font-body">${children}</ol>`,
    // [BLOCKS.QUOTE]: (node: any, children: any) => `<blockquote class="border-l-4 border-accent pl-4 italic my-4 font-body text-muted-foreground">${children}</blockquote>`,
  },
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Ensure post.content is defined and is a Document object before passing
  const htmlContent = post && post.content && typeof post.content === 'object' && post.content.nodeType === 'document'
    ? documentToHtmlString(post.content, richTextOptions) 
    : '';

  // For debugging on the server side (if you could see logs)
  // console.log("Type of post.content:", typeof post?.content);
  // console.log("Is post.content a Document:", post?.content?.nodeType === 'document');
  // console.log("Generated htmlContent (first 100 chars):", typeof htmlContent, htmlContent.substring(0, 100));


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* "Back to Articles" button removed */}
          {/* <div className="mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Link>
            </Button>
          </div> */}

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
            
            {/* Ensure htmlContent is a string before rendering */}
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
