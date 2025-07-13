'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useHasMounted } from '@/hooks/use-has-mounted';

export default function Header() {
  const hasMounted = useHasMounted();
  const [isDark, setIsDark] = useState(false);

  // On mount, check localStorage for theme preference. Default to light mode.
  useEffect(() => {
    if (!hasMounted) return;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (stored === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, [hasMounted]);

  // Toggle handler
  const handleThemeToggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 w-20 flex items-center hover:scale-[1.05] transition-transform duration-500">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Camufy Logo" width={28} height={28} className="rounded" />
            <span className="font-bold font-headline">Camufy</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 justify-end">
          <Button variant="ghost" asChild>
            <Link href="/creator">Creator</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/user">User</Link>
          </Button>
          {/* Dark mode toggle */}
          {hasMounted && (
            <div className="flex items-center ml-4">
              <Sun className={`h-5 w-5 mr-1 ${!isDark ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <Switch checked={isDark} onCheckedChange={handleThemeToggle} aria-label="Toggle dark mode" />
              <Moon className={`h-5 w-5 ml-1 ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
