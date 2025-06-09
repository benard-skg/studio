import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// --- Configuration (Embedded as requested) ---
const CONTENTFUL_SPACE_ID = 'htjrh4mjuk93';
const CONTENTFUL_ACCESS_TOKEN = 'OOGdUgBWVYfhwdmQDxQoJHR6OkdAbZ8BwOJKjUDWPAk';
const CONTENTFUL_CONTENT_TYPE_ID = 'Blog';
// --- End Configuration ---

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    '[Contentful] CRITICAL ERROR: Contentful Space ID or Access Token is not defined.'
  );
  throw new Error(
    'Contentful Space ID or Access Token is not defined.'
  );
}

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

const parseContentfulBlogPost = (blogPostEntry: Entry<any>): BlogPost | null => {
  if (!blogPostEntry || !blogPostEntry.sys || !blogPostEntry.sys.id) {
    console.warn(
      '[Contentful] parseContentfulBlogPost: Attempted to parse an invalid or incomplete Contentful entry:',
      blogPostEntry
    );
    return null;
  }

  const entryId = blogPostEntry.sys.id;

  const requiredFields: Record<string, string> = {
    Title: 'title',
    Slug: 'slug',
    Thumbnail: 'thumbnail',
    'Featured Image': 'featuredImage', // Note the space in the Contentful field name
    Text: 'content',
  };

  for (const fieldName of Object.keys(requiredFields)) {
    if (!blogPostEntry.fields[fieldName]) {
      console.warn(
        `[Contentful] parseContentfulBlogPost: Entry ID ${entryId} is missing required field '${fieldName}'. Skipping.`
      );
      return null;
    }
  }
  
  // Simple excerpt generation from the start of the rich text content (first paragraph)
  let excerpt = '';
  if (blogPostEntry.fields.Text && blogPostEntry.fields.Text.content) {
    const firstParagraphNode = blogPostEntry.fields.Text.content.find(
      (node: any) => node.nodeType === 'paragraph' && node.content && node.content.length > 0 && node.content[0].nodeType === 'text'
    );
    if (firstParagraphNode && firstParagraphNode.content[0].value) {
      excerpt = firstParagraphNode.content[0].value.substring(0, 150) + '...';
    }
  }


  const parsedPost: BlogPost = {
    id: entryId,
    title: blogPostEntry.fields.Title as string,
    slug: blogPostEntry.fields.Slug as string,
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    thumbnail: blogPostEntry.fields.Thumbnail as ContentfulAsset,
    featuredImage: blogPostEntry.fields['Featured Image'] as ContentfulAsset, // Accessing field with space
    content: blogPostEntry.fields.Text as Document,
    excerpt: excerpt,
  };
  return parsedPost;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
    });

    const parsedPosts = entries.items
      .map(parseContentfulBlogPost)
      .filter(Boolean) as BlogPost[];
    
    return parsedPosts;
  } catch (error) {
    console.error(
      '[Contentful] getBlogPosts: Error fetching or parsing blog posts:', error
    );
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      'fields.Slug': slug,
      limit: 1,
    });

    if (entries.items.length > 0) {
      return parseContentfulBlogPost(entries.items[0]);
    }
    return null;
  } catch (error) {
    console.error(
      `[Contentful] getBlogPostBySlug: Error fetching blog post with slug ${slug}:`, error
    );
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      select: ['fields.Slug'], // Only fetch the slug field
    });
    return entries.items
      .map(item => item.fields.Slug as string)
      .filter(Boolean)
      .map(slug => ({ slug }));
  } catch (error) {
    console.error('[Contentful] getAllBlogPostSlugs: Error fetching slugs:', error);
    return [];
  }
}
