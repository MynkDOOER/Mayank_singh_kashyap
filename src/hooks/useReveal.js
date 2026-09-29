import { useEffect } from 'react';

/**
 * One observer for every [data-reveal] on the page. Every section mounts
 * with the app, so a single scan after the first frame finds them all; no
 * MutationObserver re-scanning the page on each DOM change.
 */
export function useReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.setAttribute('data-revealed', ''));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', '');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    const scan = () =>
      document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el));

    const raf = requestAnimationFrame(scan);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);
}
