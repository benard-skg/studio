
import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// --- Configuration (Embedded as requested) ---
const CONTENTFUL_SPACE_ID = 'htjrh4mjuk93';
const CONTENTFUL_ACCESS_TOKEN = 'OOGdUgBWVYfhwdmQDxQoJHR6OkdAbZ8BwOJKjUDWPAk';
const CONTENTFUL_CONTENT_TYPE_ID = 'blog'; // Updated from "Blog"
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
    console.log(`[Contentful] getBlogPosts: Fetching entries with Content Type ID: ${CONTENTFUL_CONTENT_TYPE_ID}`);
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      order: ['-sys.createdAt'],
    });

    console.log(`[Contentful] getBlogPosts: Received ${entries.items.length} raw items from Contentful.`);

    const parsedPosts = entries.items
      .map(parseContentfulBlogPost)
      .filter(Boolean) as BlogPost[];
    
    console.log(`[Contentful] getBlogPosts: Successfully parsed ${parsedPosts.length} blog posts.`);
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
    console.log(`[Contentful] getBlogPostBySlug: Fetching entry with slug '${slug}' and Content Type ID: ${CONTENTFUL_CONTENT_TYPE_ID}`);
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
         console.log(`[Contentful] getBlogPostBySlug: Failed to parse post for slug '${slug}'.`);
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
  try {
    console.log(`[Contentful] getAllBlogPostSlugs: Fetching slugs with Content Type ID: ${CONTENTFUL_CONTENT_TYPE_ID}`);
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: CONTENTFUL_CONTENT_TYPE_ID,
      select: ['fields.Slug'], // Only fetch the slug field
    });
    const slugs = entries.items
      .map(item => item.fields.Slug as string)
      .filter(Boolean)
      .map(slug => ({ slug }));
    console.log(`[Contentful] getAllBlogPostSlugs: Found ${slugs.length} slugs.`);
    return slugs;
  } catch (error) {
    console.error('[Contentful] getAllBlogPostSlugs: Error fetching slugs:', error);
    return [];
  }
}

// New function to get the latest blog post
export async function getLatestBlogPost(): Promise<BlogPost | null> {
  try {
    console.log(`[Contentful] getLatestBlogPost: Fetching latest entry with Content Type ID: ${CONTENTFUL_CONTENT_TYPE_ID}`);
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
        console.log(`[Contentful] getLatestBlogPost: Failed to parse latest post.`);
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
