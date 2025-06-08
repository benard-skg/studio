
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

const parseContentfulBlogPost = (blogPostEntry: Entry<any>): BlogPost | null => {
  if (!blogPostEntry || !blogPostEntry.sys || !blogPostEntry.sys.id) {
    console.warn('Attempted to parse an invalid Contentful entry:', blogPostEntry);
    return null;
  }

  const entryId = blogPostEntry.sys.id;
  const title = blogPostEntry.fields.Heading as string;
  const content = blogPostEntry.fields.MainTextContent as Document;

  if (!title || !content) {
    console.warn(`Contentful entry ${entryId} is missing 'Heading' or 'MainTextContent'. Skipping.`);
    return null;
  }

  const featuredImage = blogPostEntry.fields.ImageHeadline as ContentfulAsset | undefined;
  
  let finalSlug: string;
  const slugIDValue = blogPostEntry.fields.slugID;

  if (typeof slugIDValue === 'number') {
    finalSlug = String(slugIDValue);
  } else {
    // Fallback to sys.id if slugID is not a number or missing
    finalSlug = entryId;
  }
  
  return {
    title: title,
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    excerpt: (blogPostEntry.fields.excerpt as string) || '', // Fallback to empty string if excerpt field is missing
    slug: finalSlug, 
    featuredImage: featuredImage,
    content: content,
  };
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1',
      order: ['-sys.createdAt'], 
    });
    return entries.items.map(parseContentfulBlogPost).filter(Boolean) as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts from Contentful:', error);
    return []; 
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Attempt to fetch by slugID field first (expecting slug to be a string representation of an integer)
    const slugAsNumber = parseInt(slug, 10);
    if (!isNaN(slugAsNumber)) {
      const entriesBySlugID: EntryCollection<any> = await client.getEntries({
        content_type: 'blogPost1',
        'fields.slugID': slugAsNumber,
        limit: 1,
      });

      if (entriesBySlugID.items.length > 0) {
        const parsedPost = parseContentfulBlogPost(entriesBySlugID.items[0]);
        if (parsedPost) return parsedPost;
      }
    }
    
    // Fallback: If no post is found by `fields.slugID` (or if slug wasn't parsable as a number),
    // try fetching directly by entry ID (assuming slug might be a sys.id).
    try {
        const entryById = await client.getEntry(slug, { content_type: 'blogPost1'});
        if (entryById) {
            const parsedPost = parseContentfulBlogPost(entryById);
            if (parsedPost) return parsedPost;
        }
    } catch (idError: any) {
        if (idError && idError.name === 'NotFound') {
            // This is an expected case if the slug is neither a valid fields.slugID nor a valid sys.id
        } else {
            console.warn(`Error attempting to fetch blog post by sys.id '${slug}':`, idError);
        }
    }
    
    console.warn(`Blog post with slug or ID '${slug}' not found after checking slugID and sys.id.`);
    return null;
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug} from Contentful:`, error);
    return null; 
  }
}

export async function getLatestBlogPost(): Promise<BlogPost | null> {
  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', 
      order: ['-sys.createdAt'],
      limit: 1,
    });
    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      return parsedPost; // This can be null if parsing fails
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest blog post from Contentful:', error);
    return null;
  }
}
