
import type { StoredLessonReport } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { Crown } from 'lucide-react';

interface LessonReportPrintableViewProps {
  report: StoredLessonReport;
}

const formatDate = (dateInput: string | any, includeTime: boolean = true): string => {
  if (!dateInput) return 'N/A';
  let dateObj: Date;

  if (typeof dateInput === 'string') {
    dateObj = parseISO(dateInput);
  } else if (dateInput && typeof dateInput.toDate === 'function') { // Firestore Timestamp
    dateObj = dateInput.toDate();
  } else {
    return 'Invalid Date';
  }

  if (!isValid(dateObj)) return 'Invalid Date';
  return includeTime ? format(dateObj, "MMMM dd, yyyy 'at' hh:mm a") : format(dateObj, "MMMM dd, yyyy");
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ElementType }> = ({ title, children, icon: Icon }) => (
  <div className="mb-4 break-inside-avoid">
    <h3 className="text-lg font-bold mb-1.5 text-gray-800 border-b border-gray-300 pb-1 flex items-center">
      {Icon && <Icon className="h-5 w-5 mr-2 text-sky-700" />}
      {title}
    </h3>
    <div className="text-sm text-gray-700 space-y-1">{children}</div>
  </div>
);

const DetailItem: React.FC<{ label: string; value?: string | number | null; isRichText?: boolean }> = ({ label, value, isRichText = false }) => (
  (value || value === 0) ? (
    <div className="mb-1">
      <strong className="text-gray-600">{label}:</strong>
      {isRichText && typeof value === 'string' ? (
        <span className="ml-1 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br />') }} />
      ) : (
        <span className="ml-1">{String(value)}</span>
      )}
    </div>
  ) : null
);


export default function LessonReportPrintableView({ report }: LessonReportPrintableViewProps) {
  if (!report) return null;

  return (
    <div className="p-6 bg-white text-black font-['Arial',_sans-serif] w-[210mm] min-h-[297mm] printable-report">
      <header className="text-center mb-6 pb-3 border-b-2 border-sky-700">
        <div className="flex items-center justify-center text-sky-700 mb-2">
          <Crown className="h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold">LCA Chess Coaching</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Lesson Report</h2>
      </header>

      <section className="mb-4 p-3 border border-gray-200 rounded">
        <h3 className="text-md font-bold text-sky-700 mb-1.5">Student & Lesson Details</h3>
        <div className="grid grid-cols-2 gap-x-4 text-sm">
          <DetailItem label="Student Name" value={report.studentName} />
          <DetailItem label="Coach Name" value={report.coachName} />
          <DetailItem label="Lesson Date & Time" value={formatDate(report.lessonDateTime)} />
          <DetailItem label="Report Submitted" value={formatDate(report.submittedAt)} />
          {report.ratingBefore !== undefined && <DetailItem label="Rating Before" value={report.ratingBefore} />}
          {report.ratingAfter !== undefined && <DetailItem label="Rating After" value={report.ratingAfter} />}
        </div>
      </section>

      <DetailSection title="Lesson Overview">
        <DetailItem label="Topic Covered" value={report.topicCovered === 'Custom' && report.customTopic ? report.customTopic : report.topicCovered} />
        {report.gameExampleLinks && <DetailItem label="Game Example Link(s)" value={report.gameExampleLinks} />}
      </DetailSection>

      <DetailSection title="Key Concepts Discussed">
        <p className="whitespace-pre-wrap text-sm text-gray-700">{report.keyConcepts || 'N/A'}</p>
      </DetailSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <DetailSection title="Strengths Observed">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{report.strengths || 'N/A'}</p>
        </DetailSection>

        <DetailSection title="Areas for Improvement">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{report.areasToImprove || 'N/A'}</p>
        </DetailSection>
      </div>

      <DetailSection title="Common Mistakes Made">
        <p className="whitespace-pre-wrap text-sm text-gray-700">{report.mistakesMade || 'N/A'}</p>
      </DetailSection>

      <DetailSection title="Homework & Next Steps">
        <DetailItem label="Assigned Puzzles" value={report.assignedPuzzles} isRichText />
        <DetailItem label="Practice Games" value={report.practiceGames} isRichText />
        {report.readingVideos && <DetailItem label="Recommended Reading/Videos" value={report.readingVideos} />}
      </DetailSection>

      {report.additionalNotes && (
        <DetailSection title="Additional Notes">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{report.additionalNotes}</p>
        </DetailSection>
      )}

      <footer className="mt-8 pt-3 text-center text-xs text-gray-500 border-t border-gray-300">
        <p>LCA - Elevating Chess Excellence, One Move at a Time.</p>
        <p>Report ID: {report.id}</p>
      </footer>
    </div>
  );
}
