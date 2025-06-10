
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

export interface EventType {
  id: string;
  title: string;
  date: string; // ISO format e.g., "2024-07-15"
  startTime: string; // e.g., "14:00"
  endTime?: string; // e.g., "16:30"
  type: "class" | "stream" | "tournament" | "special" | string; // Allow other strings too
  description?: string;
  detailsPageSlug: string; // Unique slug for the event's detail page
}
