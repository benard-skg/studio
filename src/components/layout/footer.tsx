"use client";
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-body text-sm">
          &copy; {currentYear} kgchess. All rights reserved.
        </p>
        <p className="font-body text-xs mt-1">
          Designed by an expert designer.
        </p>
      </div>
    </footer>
  );
}
