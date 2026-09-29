import { useEffect, useRef, useState } from 'react';
import { NAV, PROFILE } from '../data/site';
import ThemeToggle from './ThemeToggle';
import './Nav.css';

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const progressRef = useRef(null);

  /* progress is written straight to the DOM once per frame; React only
     re-renders when the stuck state actually flips */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setStuck(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }, [open]);

  return (
    <>
      <header className={`nav${stuck ? ' nav--stuck' : ''}`}>
        <div className="nav__bar">
          <a className="nav__brand" href="#top" data-cursor="top" onClick={() => setOpen(false)}>
            <span className="nav__mark" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </span>
            <span className="nav__name">
              Mayank<span className="nav__dot" aria-hidden="true">.</span>
            </span>
          </a>

          <nav className="nav__links" aria-label="Sections">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav__link${active === item.href.slice(1) ? ' is-active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__end">
            <a
              className="nav__ghost"
              href={PROFILE.links.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            <ThemeToggle />
            <a className="btn nav__cta" href="#contact">
              Contact <span className="btn__arr">→</span>
            </a>
            <button
              className={`nav__burger${open ? ' is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <div className="nav__progress" ref={progressRef} />
      </header>

      <div className={`sheet${open ? ' sheet--open' : ''}`}>
        <nav className="sheet__links">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ '--i': i }}
              onClick={() => setOpen(false)}
            >
              <em>{String(i + 1).padStart(2, '0')}</em>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sheet__foot">
          <a href={PROFILE.links.github} target="_blank" rel="noreferrer noopener">GitHub</a>
          <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a>
          <a href={PROFILE.links.leetcode} target="_blank" rel="noreferrer noopener">LeetCode</a>
        </div>
      </div>
    </>
  );
}
