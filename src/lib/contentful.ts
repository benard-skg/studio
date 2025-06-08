
import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// Ensure you have these in your .env.local file
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error(
    'Contentful Space ID or Access Token is not defined in .env.local'
  );
}

const client = createClient({
  space: spaceId,
  accessToken: accessToken,
});

const parseContentfulBlogPost = (blogPostEntry: Entry<any>): BlogPost => {
  const featuredImage = blogPostEntry.fields.ImageHeadline as ContentfulAsset | undefined;
  
  return {
    title: blogPostEntry.fields.Heading as string,
    // Rely solely on sys.createdAt as a dedicated 'date' field is not present in blogPost1
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    excerpt: (blogPostEntry.fields.excerpt as string) || '', // Fallback to empty string if excerpt field is missing
    slug: blogPostEntry.fields.slug as string, // Critical field, assumes 'slug' exists in Contentful model
    featuredImage: featuredImage,
    content: blogPostEntry.fields.MainTextContent as Document, // Rich text
  };
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', // Updated Content Type ID
      order: ['-sys.createdAt'], // Order by creation date (most recent first)
    });
    return entries.items.map(parseContentfulBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts from Contentful:', error);
    return []; // Return empty array on error
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', // Updated Content Type ID
      'fields.slug': slug,
      limit: 1,
    });
    if (entries.items.length > 0) {
      return parseContentfulBlogPost(entries.items[0]);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug} from Contentful:`, error);
    return null; // Return null on error
  }
}

export async function getLatestBlogPost(): Promise<BlogPost | null> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', // Updated Content Type ID
      order: ['-sys.createdAt'], // Order by creation date (most recent first)
      limit: 1,
    });
    if (entries.items.length > 0) {
      return parseContentfulBlogPost(entries.items[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest blog post from Contentful:', error);
    return null;
  }
}
