import { useEffect, useRef, useState } from 'react';
import './Preloader.css';

const WORDS = ['Loading blocks', 'Aligning faces', 'Locking the core', 'Ready'];

export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const done = useRef(false);
  /* Hold the latest callback in a ref so a parent re-render can never re-run
     the effect below (which is what re-applied the scroll lock before). */
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('is-locked');

    const finish = () => {
      if (done.current) return;
      done.current = true;
      setOut(true);
      window.setTimeout(() => {
        document.body.classList.remove('is-locked');
        onDoneRef.current?.();
      }, reduced ? 60 : 640);
    };

    if (reduced) {
      const t = window.setTimeout(() => {
        setPct(100);
        finish();
      }, 0);
      return () => {
        window.clearTimeout(t);
        document.body.classList.remove('is-locked');
      };
    }

    const start = performance.now();
    const DUR = 1100;
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 2.4);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('is-locked');
    };
  }, []);

  const word = WORDS[Math.min(WORDS.length - 1, Math.floor((pct / 100) * WORDS.length))];

  return (
    <div className={`pre${out ? ' pre--out' : ''}`} aria-hidden={out}>
      <div className="pre__inner">
        <div className="pre__cube" style={{ '--p': pct / 100 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span className="pre__cubie" key={i} style={{ '--i': i }}>
              {Array.from({ length: 6 }).map((__, f) => (
                <i key={f} style={{ '--f': f }} />
              ))}
            </span>
          ))}
        </div>

        <div className="pre__meta">
          <span className="pre__word">{word}</span>
          <span className="pre__pct">{String(pct).padStart(3, '0')}</span>
        </div>
        <div className="pre__bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
      <div className="pre__panel pre__panel--a" />
      <div className="pre__panel pre__panel--b" />
    </div>
  );
}
