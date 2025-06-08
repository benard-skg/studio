
import { createClient, type EntryCollection, type Entry } from 'contentful';
import type { BlogPost, ContentfulAsset } from './types';
import type { Document } from '@contentful/rich-text-types';

// Ensure you have these in your .env.local file
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  console.error('[Contentful] CRITICAL ERROR: Contentful Space ID or Access Token is not defined in .env.local');
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
    console.warn('[Contentful] parseContentfulBlogPost: Attempted to parse an invalid or incomplete Contentful entry:', blogPostEntry);
    return null;
  }

  const entryId = blogPostEntry.sys.id;
  console.log(`[Contentful] parseContentfulBlogPost: Processing entry ID ${entryId}. Raw Fields:`, JSON.stringify(blogPostEntry.fields, null, 2));

  const title = blogPostEntry.fields.Heading as string;
  const content = blogPostEntry.fields.MainTextContent as Document;

  // More detailed check for missing essential fields
  if (!blogPostEntry.fields.Heading || !blogPostEntry.fields.MainTextContent) {
    console.warn(`[Contentful] parseContentfulBlogPost: Entry ${entryId} is missing required fields. 'Heading' field present: ${!!blogPostEntry.fields.Heading} (type: ${typeof blogPostEntry.fields.Heading}). 'MainTextContent' field present: ${!!blogPostEntry.fields.MainTextContent} (type: ${typeof blogPostEntry.fields.MainTextContent}). Skipping.`);
    return null;
  }

  const featuredImage = blogPostEntry.fields.ImageHeadline as ContentfulAsset | undefined;
  
  let finalSlug: string;
  const slugIDValue = blogPostEntry.fields.slugID;

  if (typeof slugIDValue === 'number') {
    finalSlug = String(slugIDValue);
  } else if (typeof slugIDValue === 'string' && slugIDValue.trim() !== '') {
    finalSlug = slugIDValue.trim();
  } else {
    // Fallback to sys.id if slugID is not a number or missing/empty string
    console.log(`[Contentful] parseContentfulBlogPost: slugID for entry ${entryId} is not a number or a non-empty string (value: ${slugIDValue}). Falling back to sys.id for slug.`);
    finalSlug = entryId;
  }
  
  const parsedPost: BlogPost = {
    title: title, // This assignment is safe if the check above passes
    date: new Date(blogPostEntry.sys.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    excerpt: (blogPostEntry.fields.excerpt as string) || '', // Fallback to empty string if excerpt field is missing
    slug: finalSlug, 
    featuredImage: featuredImage,
    content: content, // This assignment is safe if the check above passes
  };
  console.log(`[Contentful] parseContentfulBlogPost: Successfully parsed entry ID ${entryId}. Title: "${parsedPost.title}", Slug: "${parsedPost.slug}"`);
  return parsedPost;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    console.log(`[Contentful] getBlogPosts: Fetching entries with content_type 'blogPost1'. Space ID: ${spaceId ? spaceId.substring(0,5) + '...' : 'UNDEFINED'}, Access Token: ${accessToken ? accessToken.substring(0,5) + '...' : 'UNDEFINED'}`);
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', 
      order: ['-sys.createdAt'], 
    });
    console.log(`[Contentful] getBlogPosts: Received ${entries.items.length} raw items from Contentful.`);

    if (entries.items.length === 0) {
      console.log('[Contentful] getBlogPosts: No items received. Potential issues: incorrect Space ID/Access Token, wrong Content Type ID ("blogPost1"), posts not published, or network issue.');
      return [];
    }

    const parsedPosts = entries.items.map(item => {
      console.log(`[Contentful] getBlogPosts: Attempting to parse raw item with ID: ${item.sys.id}`);
      return parseContentfulBlogPost(item);
    }).filter(Boolean) as BlogPost[];
    
    console.log(`[Contentful] getBlogPosts: Successfully parsed ${parsedPosts.length} blog posts.`);
    if (parsedPosts.length === 0 && entries.items.length > 0) {
        console.warn('[Contentful] getBlogPosts: Received raw items from Contentful, but NONE were successfully parsed. Check parsing logic and required fields in your Contentful entries (Heading, MainTextContent).');
        console.log('[Contentful] getBlogPosts: First raw item for inspection:', JSON.stringify(entries.items[0], null, 2));
    }
    return parsedPosts;

  } catch (error) {
    console.error('[Contentful] getBlogPosts: Error fetching or parsing blog posts from Contentful:', error);
    return []; 
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    console.log(`[Contentful] getBlogPost: Fetching entry for slug: '${slug}' with content_type 'blogPost1'`);
    
    // Try fetching by `fields.slugID` (which can be string or number)
    const entriesBySlugID: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1', 
      'fields.slugID': slug,
      limit: 1,
    });

    if (entriesBySlugID.items.length > 0) {
      console.log(`[Contentful] getBlogPost: Found ${entriesBySlugID.items.length} item(s) by slugID '${slug}'.`);
      const parsedPost = parseContentfulBlogPost(entriesBySlugID.items[0]);
      if (parsedPost) return parsedPost;
    } else {
      console.log(`[Contentful] getBlogPost: No items found for slugID '${slug}'.`);
    }
    
    // Fallback: If no post is found by `fields.slugID`,
    // try fetching directly by entry ID (assuming slug might be a sys.id).
    try {
        console.log(`[Contentful] getBlogPost: Attempting to fetch by sys.id: '${slug}' with content_type 'blogPost1'`);
        const entryById = await client.getEntry(slug, { content_type: 'blogPost1' }); 
        if (entryById) {
            console.log(`[Contentful] getBlogPost: Found item by sys.id '${slug}'.`);
            const parsedPost = parseContentfulBlogPost(entryById);
            if (parsedPost) return parsedPost;
        }
    } catch (idError: any) {
        if (idError && idError.name === 'NotFound') {
            console.log(`[Contentful] getBlogPost: Entry with sys.id '${slug}' not found (this is expected if slug is not an ID).`);
        } else {
            console.warn(`[Contentful] getBlogPost: Error attempting to fetch blog post by sys.id '${slug}':`, idError);
        }
    }
    
    console.warn(`[Contentful] getBlogPost: Blog post with slug or ID '${slug}' not found after checking slugID and sys.id.`);
    return null;
  } catch (error) {
    console.error(`[Contentful] getBlogPost: Error fetching blog post with slug ${slug} from Contentful:`, error);
    return null; 
  }
}

export async function getLatestBlogPost(): Promise<BlogPost | null> {
  try {
    console.log(`[Contentful] getLatestBlogPost: Fetching latest entry with content_type 'blogPost1'.`);
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost1',  
      order: ['-sys.createdAt'],
      limit: 1,
    });
     console.log(`[Contentful] getLatestBlogPost: Received ${entries.items.length} raw item(s).`);
    if (entries.items.length > 0) {
      const parsedPost = parseContentfulBlogPost(entries.items[0]);
      if(parsedPost) {
        console.log(`[Contentful] getLatestBlogPost: Successfully parsed latest post. Title: "${parsedPost.title}"`);
      } else {
        console.warn(`[Contentful] getLatestBlogPost: Failed to parse the latest post. Raw item:`, JSON.stringify(entries.items[0], null, 2));
      }
      return parsedPost; 
    }
    console.log(`[Contentful] getLatestBlogPost: No posts found.`);
    return null;
  } catch (error) {
    console.error('[Contentful] getLatestBlogPost: Error fetching latest blog post from Contentful:', error);
    return null;
  }
}
