
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import InteractiveChessboardSection from '@/components/sections/interactive-chessboard-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analysis Board - LCA',
  description: 'Use the interactive analysis board to study positions, practice tactics, and explore chess variations.',
};

export default function AnalysisBoardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center py-8 px-2 sm:px-4"> {/* Added px-2 sm:px-4 for small horizontal margins */}
        <InteractiveChessboardSection />
      </main>
      <Footer />
    </div>
  );
}

