
import type { Document } from '@contentful/rich-text-types';

export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    title?: string;
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
  title: string;
  date: string; // Formatted date string
  excerpt: string;
  slug: string;
  featuredImage?: ContentfulAsset;
  content: Document; // Contentful Rich Text Document
}
