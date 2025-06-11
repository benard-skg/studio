
"use client";
import { useEffect, useState } from 'react';
import { Wind } from 'lucide-react'; 
import Link from 'next/link';

const NextJsLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="1em" 
    height="1em" 
    viewBox="0 0 76 65" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
  </svg>
);


export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-body text-sm">
          &copy; {currentYear} LCA. All rights reserved.
        </p>
        <div className="font-body text-xs text-muted-foreground mt-4 space-y-1">
          <p>
            Designed by{' '}
            <Link href="/tech-stack" className="font-bold hover:text-accent transition-colors">
              KG
            </Link>
            {' '}👨🏾‍💻
          </p>
          <p className="flex items-center justify-center space-x-1.5">
            <span>Powered by</span>
            <NextJsLogo className="h-3.5 w-3.5 inline-block align-middle" />
            <span className="font-semibold">Next.js,</span>
            <span className="font-semibold">Firebase, and</span>
            <Wind className="h-3.5 w-3.5 inline-block align-middle" />
            <span className="font-semibold">TailwindCSS</span>
          </p>
          <p>Created using Firestudio</p>
        </div>
      </div>
    </footer>
  );
}
