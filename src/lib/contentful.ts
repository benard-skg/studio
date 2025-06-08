
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
  const slugField = blogPostEntry.fields.slug as string | undefined;
  const entryId = blogPostEntry.sys.id;
  
  return {
    title: blogPostEntry.fields.Heading as string,
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    excerpt: (blogPostEntry.fields.excerpt as string) || '', // Fallback to empty string if excerpt field is missing
    // Ensure slug is always a string; fallback to system ID if slug field is missing/empty.
    // This is crucial for key props and for link hrefs.
    slug: slugField || entryId, 
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
    // Attempt to fetch by slug field first.
    const entriesByFieldSlug: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', 
      'fields.slug': slug,
      limit: 1,
    });

    if (entriesByFieldSlug.items.length > 0) {
      return parseContentfulBlogPost(entriesByFieldSlug.items[0]);
    }
    
    // Fallback: If no post is found by `fields.slug`, and if the provided slug might be a sys.id,
    // try fetching directly by entry ID. This makes routes like /blog/entry_id work.
    try {
        const entryById = await client.getEntry(slug, { content_type: 'blogPost1'});
        if (entryById) {
            return parseContentfulBlogPost(entryById);
        }
    } catch (idError: any) {
        // If getEntry also fails (e.g. slug is neither a valid field.slug nor a valid sys.id).
        // Contentful's client.getEntry throws an error if not found, so we check the error name.
        if (idError && idError.name === 'NotFound') {
            console.warn(`Blog post with slug or ID '${slug}' not found.`);
        } else {
            console.warn(`Error attempting to fetch blog post by ID '${slug}':`, idError);
        }
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

