import { useEffect, useRef, useState } from 'react';
import { NAV, PROFILE } from '../data/site';
import ThemeToggle from './ThemeToggle';
import './Nav.css';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
      />
    </svg>
  );
}

/* a page with a folded corner; each text line starts with a cube sticker */
function ResumeIcon() {
  return (
    <svg viewBox="3.5 1.5 17 21" fill="none" aria-hidden="true">
      <path
        d="M5.5 2.5h8.5l4.5 4.5v14.5h-13z M14 2.5V7h4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect className="sticker sticker--red" x="8" y="9.5" width="3" height="3" rx="0.6" />
      <rect className="sticker sticker--blue" x="8" y="14.5" width="3" height="3" rx="0.6" />
      <path d="M12.8 11h3.2 M12.8 16h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
              className="nav__icon nav__icon--blue"
              href={PROFILE.links.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
              title="GitHub"
            >
              <GitHubIcon />
            </a>
            <a
              className="nav__icon nav__icon--yellow"
              href={PROFILE.links.resume}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Resume (PDF)"
              title="Resume"
            >
              <ResumeIcon />
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
          <a href={PROFILE.links.resume} target="_blank" rel="noreferrer noopener">Resume</a>
        </div>
      </div>
    </>
  );
}
