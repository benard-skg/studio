import type { Document } from '@contentful/rich-text-types';

export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  thumbnail: ContentfulAsset;
  featuredImage: ContentfulAsset;
  content: Document;
  excerpt?: string; // Optional: can be derived or from a separate field
}
