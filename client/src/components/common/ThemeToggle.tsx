import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextIsDark = !isDark;

    const applyTheme = () => {
      if (nextIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
      }
    };

    // If browser doesn't support View Transitions or user prefers reduced motion
    const doc = document as any;
    if (
      !doc.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyTheme();
      return;
    }

    // Coordinates of the click or center of the button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      doc.documentElement.animate(
        {
          clipPath
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs group ${className}`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4 overflow-hidden">
        {/* Sun Icon: Displays in Dark Mode to switch to Light mode */}
        <Sun
          className={`w-4 h-4 text-amber-400 absolute inset-0 transition-all duration-300 ease-in-out ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 pointer-events-none'
          }`}
        />
        {/* Moon Icon: Displays in Light Mode to switch to Dark mode */}
        <Moon
          className={`w-4 h-4 text-zinc-600 absolute inset-0 transition-all duration-300 ease-in-out ${
            isDark ? 'rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
    </button>
  );
};
