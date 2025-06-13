
import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// --- Configuration (Hardcoded as requested) ---
const CONTENTFUL_SPACE_ID = "htjrh4mjuk93";
const CONTENTFUL_ACCESS_TOKEN = "OOGdUgBWVYfhwdmQDxQoJHR6OkdAbZ8BwOJKjUDWPAk";
const CONTENTFUL_CONTENT_TYPE_ID = 'blog';
// --- End Configuration ---

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  // This console.error is intentional for critical setup issues.
  console.error(
    '[Contentful] CRITICAL ERROR: Hardcoded Contentful Space ID or Access Token is empty. Please provide valid credentials.'
  );
}

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

const EXPECTED_FIELD_IDS = {
  title: 'title',
  slug: 'slug',
  thumbnail: 'thumbnail',
  featuredImage: 'featuredImage',
  text: 'text',
};

const parseContentfulBlogPost = (blogPostEntry: Entry<any>): BlogPost | null => {
  if (!blogPostEntry || !blogPostEntry.sys || !blogPostEntry.sys.id) {
    return null;
  }

  const entryId = blogPostEntry.sys.id;

  const requiredFieldChecks = [
    { id: EXPECTED_FIELD_IDS.title, type: 'string', nameForLog: 'Title' },
    { id: EXPECTED_FIELD_IDS.slug, type: 'string', nameForLog: 'Slug' },
    { id: EXPECTED_FIELD_IDS.thumbnail, type: 'asset', nameForLog: 'Thumbnail' },
    { id: EXPECTED_FIELD_IDS.featuredImage, type: 'asset', nameForLog: 'Featured Image' },
    { id: EXPECTED_FIELD_IDS.text, type: 'richtext', nameForLog: 'Text' },
  ];

  for (const fieldCheck of requiredFieldChecks) {
    const fieldValue = blogPostEntry.fields[fieldCheck.id];
    if (!fieldValue) return null;

    if (fieldCheck.type === 'asset') {
      if (!fieldValue.sys || !fieldValue.fields || !fieldValue.fields.file || !fieldValue.fields.file.url) {
        return null;
      }
    } else if (fieldCheck.type === 'richtext') {
      if (!fieldValue.nodeType || fieldValue.nodeType !== 'document' || !fieldValue.content) {
        return null;
      }
    }
  }
  
  let excerpt = '';
  const richTextContent = blogPostEntry.fields[EXPECTED_FIELD_IDS.text] as Document | undefined;
  if (richTextContent && richTextContent.content) {
    const firstParagraphNode = richTextContent.content.find(
      (node: any) => node.nodeType === 'paragraph' && node.content && node.content.length > 0 && node.content[0].nodeType === 'text' && node.content[0].value
    );
    if (firstParagraphNode && firstParagraphNode.content[0].value) {
      excerpt = firstParagraphNode.content[0].value.substring(0, 150) + '...';
    }
  }

  const parsedPost: BlogPost = {
    id: entryId,
    title: blogPostEntry.fields[EXPECTED_FIELD_IDS.title] as string,
    slug: blogPostEntry.fields[EXPECTED_FIELD_IDS.slug] as string,
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    thumbnail: blogPostEntry.fields[EXPECTED_FIELD_IDS.thumbnail] as ContentfulAsset,
    featuredImage: blogPostEntry.fields[EXPECTED_FIELD_IDS.featuredImage] as ContentfulAsset,
    content: blogPostEntry.fields[EXPECTED_FIELD_IDS.text] as Document,
    excerpt: excerpt,
  };
  return parsedPost;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
     return [];
  }
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
      include: 2, 
    });

    if (entries.items.length === 0) {
      // Intentionally kept for debugging Contentful setup
      console.warn(`[Contentful] getBlogPosts: No items returned from Contentful for content_type '${CONTENTFUL_CONTENT_TYPE_ID}'. Ensure posts are published and the Content Type ID is correct.`);
    }

    const parsedPosts = entries.items
      .map(parseContentfulBlogPost)
      .filter(Boolean) as BlogPost[];
    
    return parsedPosts;
  } catch (error) {
    // Intentionally kept for debugging Contentful setup
    console.error(
      '[Contentful] getBlogPosts: Error fetching or parsing blog posts:', error
    );
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
 if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
     return null;
  }
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      [`fields.${EXPECTED_FIELD_IDS.slug}`]: slug,
      limit: 1,
      include: 2,
    });

    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      return parsedPost;
    }
    return null;
  } catch (error) {
    // Intentionally kept for debugging Contentful setup
    console.error(
      `[Contentful] getBlogPostBySlug: Error fetching blog post with slug ${slug}:`, error
    );
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<{ slug: string }[]> {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
     return [];
  }
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      select: [`fields.${EXPECTED_FIELD_IDS.slug}`],
      include: 0,
    });
    const slugs = entries.items
      .map(item => item.fields[EXPECTED_FIELD_IDS.slug] as string)
      .filter(Boolean)
      .map(slug => ({ slug }));
    return slugs;
  } catch (error)
{
    // Intentionally kept for debugging Contentful setup
    console.error('[Contentful] getAllBlogPostSlugs: Error fetching slugs:', error);
    return [];
  }
}

export async function getLatestBlogPost(): Promise<BlogPost | null> {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return null;
  }
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
      limit: 1,
      include: 2,
    });

    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      return parsedPost;
    }
    return null;
  } catch (error) {
     // Intentionally kept for debugging Contentful setup
    console.error('[Contentful] getLatestBlogPost: Error fetching latest blog post:', error);
    return null;
  }
}
