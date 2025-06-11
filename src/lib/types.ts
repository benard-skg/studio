
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

export interface LessonReportData {
  studentName: string;
  lessonDateTime: string;
  coachName: string;
  ratingBefore?: number;
  ratingAfter?: number;
  topicCovered: string;
  customTopic?: string;
  keyConcepts: string;
  pgnFile?: FileList; // For PGN upload
  gameExampleLinks?: string; // For Lichess/Chess.com links
  strengths: string;
  areasToImprove: string;
  mistakesMade: string;
  assignedPuzzles: string;
  practiceGames: string;
  readingVideos?: string;
  additionalNotes?: string;
}

export type LessonTopic = 
  | "Opening Principles" 
  | "Middlegame Strategy" 
  | "Endgame Fundamentals" 
  | "Tactics Training" 
  | "Positional Play" 
  | "Specific Opening (e.g., Sicilian Defense)"
  | "Game Analysis"
  | "Tournament Preparation"
  | "Custom";

export const commonLessonTopics: LessonTopic[] = [
  "Opening Principles",
  "Middlegame Strategy",
  "Endgame Fundamentals",
  "Tactics Training",
  "Positional Play",
  "Specific Opening (e.g., Sicilian Defense)",
  "Game Analysis",
  "Tournament Preparation",
  "Custom",
];

