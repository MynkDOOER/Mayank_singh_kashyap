import { useEffect, useRef, useState } from 'react';
import RubikCube from './RubikCube';
import { PROFILE } from '../data/site';
import { useMagnetic } from '../hooks/useMagnetic';
import './Hero.css';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const istTime = () =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

function LocalTime() {
  const [time, setTime] = useState(istTime);
  useEffect(() => {
    const t = window.setInterval(() => setTime(istTime()), 15000);
    return () => window.clearInterval(t);
  }, []);
  return <>{time.toUpperCase()} IST</>;
}

export default function Hero() {
  const ctaRef = useMagnetic(0.28);
  const layerRef = useRef(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    if (prefersReduced()) return;
    /* a touch-scroll parallax costs more than it adds on phones */
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    let last = -1;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        if (y === last) return; /* nothing changes below the fold */
        last = y;
        el.style.setProperty('--sy', `${y * 0.14}px`);
        el.style.setProperty('--so', `${Math.max(0, 1 - y / 620)}`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="wrap hero__wrap" ref={layerRef}>
        <div className="hero__left">
          <p className="hero__kicker mono-label" data-reveal>
            {PROFILE.name} · {PROFILE.role}
          </p>

          <h1 className="display h1 hero__title">
            <span className="hero__line" data-reveal style={{ '--d': '60ms' }}>
              Hi, I’m Mayank.
            </span>
          </h1>

          <p className="lede hero__lede" data-reveal style={{ '--d': '320ms' }}>
            I’m a full-stack developer focused on thoughtful UI,
strong design systems, and high-performance software.
I care about the details that make products feel intuitive,
while keeping the engineering behind them fast and reliable.
          </p>

          <div className="hero__actions" data-reveal style={{ '--d': '400ms' }}>
            <span ref={ctaRef} className="hero__magnet">
              <a className="btn" href="#work">
                View projects <span className="btn__arr">→</span>
              </a>
            </span>
            <a className="btn btn--dark" href="#contact">
              Contact
            </a>
          </div>

          <ul className="hero__meta" data-reveal style={{ '--d': '480ms' }}>
            <li>
              <a href={PROFILE.links.github} target="_blank" rel="noreferrer noopener">
                <i className="dot dot--blue" />GitHub
              </a>
            </li>
            <li>
              <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer noopener">
                <i className="dot dot--red" />LinkedIn
              </a>
            </li>
            <li>
              <a href={PROFILE.links.leetcode} target="_blank" rel="noreferrer noopener">
                <i className="dot dot--yellow" />LeetCode
              </a>
            </li>
          </ul>
        </div>

        <div className="hero__right" data-reveal="cube" style={{ '--d': '260ms' }}>
          <div className="hero__cube">
            <RubikCube />
          </div>
        </div>
      </div>

      <div className="wrap">
        <dl className="hero__strip" data-reveal style={{ '--d': '560ms' }}>
          <div>
            <dt>Based in</dt>
            <dd>{PROFILE.location}</dd>
          </div>
          <div>
            <dt>Local time</dt>
            <dd>
              <LocalTime />
            </dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Full-stack web</dd>
          </div>
          <a className="hero__strip-scroll" href="#work" aria-label="Scroll to projects">
            <span className="hero__scrollcube"><i /><i /><i /><i /><i /><i /></span>
            Scroll
          </a>
        </dl>
      </div>
    </section>
  );
}
