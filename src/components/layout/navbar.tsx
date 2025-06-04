
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, X, Crown } from 'lucide-react';

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/classes', label: 'Classes' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-headline font-bold hover:text-accent transition-colors">
            <Crown className="h-7 w-7 text-accent" />
            <span>kgchess</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-body text-sm font-medium hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-6">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle asChild>
                    <Link href="/" className="flex items-center space-x-2 text-xl font-headline font-bold">
                      <Crown className="h-6 w-6 text-accent" />
                      <span>kgchess</span>
                    </Link>
                  </SheetTitle>
                  {/* The default SheetContent close button will be used.
                      The SheetClose component below is still necessary for closing the sheet when a nav item is clicked. */}
                </SheetHeader>
                <div className="flex flex-col space-y-6">
                  {navItems.map((item) => (
                    <SheetClose key={item.label} asChild>
                      <Link
                        href={item.href}
                        className="font-body text-lg hover:text-accent transition-colors"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
