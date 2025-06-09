
import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// --- Configuration (Embedded as requested) ---
const CONTENTFUL_SPACE_ID = 'htjrh4mjuk93';
const CONTENTFUL_ACCESS_TOKEN = 'OOGdUgBWVYfhwdmQDxQoJHR6OkdAbZ8BwOJKjUDWPAk';
const CONTENTFUL_CONTENT_TYPE_ID = 'blog'; // User confirmed this ID
// --- End Configuration ---

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    '[Contentful] CRITICAL ERROR: Contentful Space ID or Access Token is not defined.'
  );
  // In a real app, you might throw an error or handle this more gracefully
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
  console.log(`[Contentful] parseContentfulBlogPost: Processing entry ID ${entryId}. Raw fields:`, JSON.stringify(blogPostEntry.fields, null, 2));


  const requiredFieldsDefinition: { name: string; type: 'string' | 'asset' | 'richtext' }[] = [
    { name: 'Title', type: 'string' },
    { name: 'Slug', type: 'string' },
    { name: 'Thumbnail', type: 'asset' },
    { name: 'Featured Image', type: 'asset' }, // Note the space
    { name: 'Text', type: 'richtext' },
  ];

  for (const fieldDef of requiredFieldsDefinition) {
    const fieldName = fieldDef.name;
    const fieldValue = blogPostEntry.fields[fieldName];
    if (!fieldValue) {
      console.warn(
        `[Contentful] parseContentfulBlogPost: Entry ID ${entryId} is MISSING required field '${fieldName}'. Skipping entry.`
      );
      return null;
    }
    // Basic type check for assets - more robust checks could be added
    if (fieldDef.type === 'asset' && (!fieldValue.sys || !fieldValue.fields || !fieldValue.fields.file)) {
      console.warn(
        `[Contentful] parseContentfulBlogPost: Entry ID ${entryId} has field '${fieldName}', but it does not appear to be a valid Contentful asset (missing sys, fields, or fields.file). Skipping entry. Value:`, fieldValue
      );
      return null;
    }
    // Basic type check for rich text - more robust checks could be added
    if (fieldDef.type === 'richtext' && (!fieldValue.nodeType || fieldValue.nodeType !== 'document' || !fieldValue.content)) {
        console.warn(
        `[Contentful] parseContentfulBlogPost: Entry ID ${entryId} has field '${fieldName}', but it does not appear to be a valid Contentful rich text document. Skipping entry. Value:`, fieldValue
      );
      return null;
    }
  }
  
  // Simple excerpt generation from the start of the rich text content (first paragraph)
  let excerpt = '';
  const richTextContent = blogPostEntry.fields.Text as Document | undefined;
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
  console.log(`[Contentful] parseContentfulBlogPost: Successfully parsed entry ID ${entryId}.`);
  return parsedPost;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  console.log(`[Contentful] getBlogPosts: Fetching entries with Content Type ID: '${CONTENTFUL_CONTENT_TYPE_ID}'`);
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
    });

    console.log(`[Contentful] getBlogPosts: Received ${entries.items.length} raw items from Contentful.`);

    if (entries.items.length === 0) {
        console.warn(`[Contentful] getBlogPosts: No items returned from Contentful for content_type '${CONTENTFUL_CONTENT_TYPE_ID}'. Ensure posts are published and the Content Type ID is correct.`);
    }

    const parsedPosts = entries.items
      .map(parseContentfulBlogPost)
      .filter(Boolean) as BlogPost[]; // Filter out nulls from failed parses
    
    console.log(`[Contentful] getBlogPosts: Successfully parsed ${parsedPosts.length} blog posts out of ${entries.items.length} raw items.`);
    return parsedPosts;
  } catch (error) {
    console.error(
      '[Contentful] getBlogPosts: Error fetching or parsing blog posts:', error
    );
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log(`[Contentful] getBlogPostBySlug: Fetching entry with slug '${slug}' and Content Type ID: '${CONTENTFUL_CONTENT_TYPE_ID}'`);
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      'fields.Slug': slug,
      limit: 1,
    });

    console.log(`[Contentful] getBlogPostBySlug: Received ${entries.items.length} raw items for slug '${slug}'.`);

    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      if (parsedPost) {
         console.log(`[Contentful] getBlogPostBySlug: Successfully parsed post ID ${parsedPost.id} for slug '${slug}'.`);
      } else {
         console.warn(`[Contentful] getBlogPostBySlug: Failed to parse post for slug '${slug}'. Check raw fields and required field names.`);
      }
      return parsedPost;
    }
    console.log(`[Contentful] getBlogPostBySlug: No post found for slug '${slug}'.`);
    return null;
  } catch (error) {
    console.error(
      `[Contentful] getBlogPostBySlug: Error fetching blog post with slug ${slug}:`, error
    );
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<{ slug: string }[]> {
  console.log(`[Contentful] getAllBlogPostSlugs: Fetching slugs with Content Type ID: '${CONTENTFUL_CONTENT_TYPE_ID}'`);
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      select: ['fields.Slug'], // Only fetch the slug field
    });
    const slugs = entries.items
      .map(item => item.fields.Slug as string)
      .filter(Boolean) // Ensure slug exists
      .map(slug => ({ slug }));
    console.log(`[Contentful] getAllBlogPostSlugs: Found ${slugs.length} slugs.`);
    return slugs;
  } catch (error) {
    console.error('[Contentful] getAllBlogPostSlugs: Error fetching slugs:', error);
    return [];
  }
}

// New function to get the latest blog post - used in BlogSection (if you re-add it)
export async function getLatestBlogPost(): Promise<BlogPost | null> {
  console.log(`[Contentful] getLatestBlogPost: Fetching latest entry with Content Type ID: '${CONTENTFUL_CONTENT_TYPE_ID}'`);
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
      limit: 1,
    });

    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      if (parsedPost) {
        console.log(`[Contentful] getLatestBlogPost: Successfully parsed latest post ID ${parsedPost.id}.`);
      } else {
        console.warn(`[Contentful] getLatestBlogPost: Failed to parse latest post.`);
      }
      return parsedPost;
    }
    console.log(`[Contentful] getLatestBlogPost: No posts found.`);
    return null;
  } catch (error) {
    console.error('[Contentful] getLatestBlogPost: Error fetching latest blog post:', error);
    return null;
  }
}
