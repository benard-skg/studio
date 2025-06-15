
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Crown } from 'lucide-react';
import { ThemeToggleButton } from './theme-toggle-button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/classes', label: 'Classes' },
  { href: '/analysis-board', label: 'Analysis Board' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const linkBaseClasses = "font-body font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1";
const desktopLinkClasses = cn(linkBaseClasses, "text-sm hover:text-accent active:text-accent/80 active:scale-95");
const mobileLinkClasses = cn(linkBaseClasses, "text-lg hover:text-accent active:text-accent/80 active:scale-95 py-1");

const logoBaseClasses = "flex items-center space-x-2 font-headline font-bold tracking-tighter leading-tight transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1";
const desktopLogoClasses = cn(logoBaseClasses, "text-2xl hover:text-accent active:text-accent/80 active:scale-95");
const mobileLogoClasses = cn(logoBaseClasses, "text-xl hover:text-accent active:text-accent/80 active:scale-95");


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
    // Render a placeholder or null to avoid hydration mismatch and layout shift
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Placeholder for logo */}
            <div className="flex items-center space-x-2 text-2xl font-headline font-bold tracking-tighter">
               <Crown className="h-7 w-7 text-accent" />
               <span>LCA</span>
            </div>
            {/* Placeholder for nav items and buttons */}
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9"></div>
              <div className="md:hidden h-9 w-9"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className={desktopLogoClasses}
          >
            <Crown className="h-7 w-7 text-accent" />
            <span>LCA</span>
          </Link>

          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={desktopLinkClasses}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggleButton />
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
                       <Link
                          href="/"
                          className={mobileLogoClasses}
                        >
                        <Crown className="h-6 w-6 text-accent" />
                        <span>LCA</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-5">
                    {navItems.map((item) => (
                      <SheetClose key={item.label} asChild>
                        <Link
                          href={item.href}
                          className={mobileLinkClasses}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
