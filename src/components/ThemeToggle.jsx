import { useState } from 'react';

const read = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/* The fade is a View Transition: the browser snapshots the page once, switches
   the theme instantly, and cross-fades the two snapshots on the GPU. Fading
   each element with CSS transitions instead meant restyling ~900 elements on
   every frame, which made the switch stutter. */
const apply = (theme) => {
  const swap = () => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B0B0B' : '#FBFBF9');
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) document.startViewTransition(swap);
  else swap();
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(read);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage blocked: the choice lasts for this page view only */
    }
  };

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {/* a half-filled circle: reads as light/dark and rotates on switch */}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
