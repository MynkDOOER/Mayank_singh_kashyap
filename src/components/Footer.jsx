import { useEffect, useState } from 'react';
import { NAV, PROFILE, PROJECTS } from '../data/site';
import './Footer.css';

/* A seamless tile of isometric cubes in the site colours. It fills the
   letters of the wordmark on hover and scrolls diagonally, so the cubes
   appear to roll through the name. */
const S = 24;
const H = (Math.sqrt(3) / 2) * S;
const COLS = 3;
const ROWS = 4; /* rows of cubes; must be even for the offset to repeat */
const TW = 2 * H * COLS;
const TH = 1.5 * S * ROWS;
const COLORS = [
  ['#FFE27A', '#FFD12E', '#D9A800'],
  ['#4661FF', '#2743E3', '#1B2FB0'],
  ['#FF6B52', '#E8452C', '#B92E19'],
  ['#3FCB6E', '#1FA34A', '#147534'],
];
const PATTERN = [
  [0, 1, 2],
  [3, 0, 1],
  [2, 3, 0],
  [1, 2, 3],
];
const cube = (cx, cy, [top, left, right]) => {
  const p = (x, y) => `${(cx + x).toFixed(2)},${(cy + y).toFixed(2)}`;
  const e = 'stroke="#0A0A0A" stroke-width="1.5" stroke-linejoin="round"';
  return (
    `<polygon points="${p(0, -S)} ${p(H, -S / 2)} ${p(0, 0)} ${p(-H, -S / 2)}" fill="${top}" ${e}/>` +
    `<polygon points="${p(-H, -S / 2)} ${p(0, 0)} ${p(0, S)} ${p(-H, S / 2)}" fill="${left}" ${e}/>` +
    `<polygon points="${p(H, -S / 2)} ${p(H, S / 2)} ${p(0, S)} ${p(0, 0)}" fill="${right}" ${e}/>`
  );
};
const mod = (a, n) => ((a % n) + n) % n;
let body = '';
for (let r = -1; r <= ROWS; r++) {
  const y = S + 1.5 * S * r;
  const shift = mod(r, 2) === 0 ? H : 0;
  for (let k = -1; k <= COLS; k++) {
    const x = shift + 2 * H * k;
    body += cube(x, y, COLORS[PATTERN[mod(r, ROWS)][mod(k, COLS)]]);
  }
}
const TILE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TW.toFixed(2)}" height="${TH}">${body}</svg>`
)}")`;

/* keep the cube reveal centred on the pointer while it is over the name */
const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--fx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--fy', `${e.clientY - r.top}px`);
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.dataset.theme === 'dark');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__grid">
          <div className="foot__brand">
            <span className="foot__mark" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </span>
            <p className="foot__name">{PROFILE.name}</p>
            <p className="foot__blurb">
              Full-stack developer and computer science student.
            </p>
            {isDark && (
              <picture className="foot__scene">
                <source media="(prefers-reduced-motion: reduce)" srcSet="/noir-rubik-still.png" type="image/png" />
                <img
                  src="/noir-rubik.gif"
                  width="540"
                  height="250"
                  loading="lazy"
                  alt="A noir figure holding a colorful Rubik's cube"
                />
              </picture>
            )}
          </div>

          <nav className="foot__col" aria-label="Sections">
            <h4>Sections</h4>
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </nav>

          <nav className="foot__col" aria-label="Projects">
            <h4>Projects</h4>
            {PROJECTS.map((p) => (
              <a key={p.id} href={p.repo} target="_blank" rel="noreferrer noopener">
                {p.name}
              </a>
            ))}
          </nav>

          <nav className="foot__col" aria-label="Elsewhere">
            <h4>Elsewhere</h4>
            <a href={PROFILE.links.github} target="_blank" rel="noreferrer noopener">GitHub</a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a>
            <a href={PROFILE.links.leetcode} target="_blank" rel="noreferrer noopener">LeetCode</a>
            <a href={`mailto:${PROFILE.email}`}>Email</a>
          </nav>
        </div>

        <div
          className="foot__word"
          aria-hidden="true"
          style={{ '--tile': TILE, '--tw': `${TW.toFixed(2)}px`, '--th': `${TH}px` }}
          onPointerMove={trackPointer}
          onPointerEnter={trackPointer}
        >
          <span className="foot__word-line">Mayank</span>
          <span className="foot__word-fill">Mayank</span>
        </div>

        <div className="foot__base">
          <span>© {year} {PROFILE.name}</span>
          <span className="foot__built">Built with React</span>
          <a href="#top" className="foot__top" data-cursor="back up">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
