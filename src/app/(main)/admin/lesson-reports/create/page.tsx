
import type { Metadata } from 'next';
import CreateLessonReportClientPage from './CreateLessonReportClientPage';

export const metadata: Metadata = {
  title: 'Create Lesson Report - LCA Admin',
  description: 'Document chess lesson details and student progress.',
};

export default function CreateLessonReportPage() {
  return <CreateLessonReportClientPage />;
}
