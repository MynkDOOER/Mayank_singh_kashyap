import { useEffect, useRef, useState } from 'react';
import './DebugOverlay.css';

/*
 * Easter egg: add ?debug to the URL and the page looks like it shipped with
 * dev tools left on — dashed outlines and component labels on each section,
 * plus a live stats panel. Nothing renders without the flag.
 */

const TARGETS = [
  ['.nav', 'Nav'],
  ['.hero', 'Hero'],
  ['.hero__cube', 'RubikCube'],
  ['#work', 'Projects'],
  ['.recog', 'Recognition'],
  ['#about', 'About'],
  ['#stack', 'Skills'],
  ['#contact', 'Contact'],
  ['.term', 'Terminal'],
  ['.foot', 'Footer'],
];

const isOn = () => {
  try {
    return new URLSearchParams(window.location.search).has('debug');
  } catch {
    return false;
  }
};

/* stable, plausible-looking render times per component */
const fakeMs = (name) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return (2 + (h % 160) / 10).toFixed(1);
};

export default function DebugOverlay() {
  const [on] = useState(isOn);
  const [boxes, setBoxes] = useState([]);
  const [stats, setStats] = useState({ fps: 0, nodes: 0 });
  const raf = useRef(0);

  /* measure where each component sits, in page coordinates */
  useEffect(() => {
    if (!on) return undefined;
    document.documentElement.classList.add('is-debug');
    const measure = () => {
      const y = window.scrollY;
      setBoxes(
        TARGETS.flatMap(([sel, name]) => {
          const el = document.querySelector(sel);
          if (!el) return [];
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return [];
          return [{ name, top: r.top + y, left: r.left, width: r.width, height: r.height, fixed: sel === '.nav' }];
        })
      );
    };
    const t = window.setTimeout(measure, 600); // after the reveal animations settle
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      document.documentElement.classList.remove('is-debug');
    };
  }, [on]);

  /* real frames-per-second, sampled twice a second */
  useEffect(() => {
    if (!on) return undefined;
    let frames = 0;
    let last = performance.now();
    const loop = (now) => {
      frames += 1;
      if (now - last >= 500) {
        setStats({ fps: Math.round((frames * 1000) / (now - last)), nodes: document.getElementsByTagName('*').length });
        frames = 0;
        last = now;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [on]);

  if (!on) return null;

  const exit = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('debug');
    window.location.replace(url.toString());
  };

  return (
    <div className="dbg" aria-hidden="true">
      {boxes.map((b) => (
        <div
          key={b.name}
          className={`dbg__box${b.fixed ? ' is-fixed' : ''}`}
          style={{ top: b.fixed ? 0 : b.top, left: b.left, width: b.width, height: b.height }}
        >
          <span className="dbg__tag">
            &lt;{b.name} /&gt; <i>{fakeMs(b.name)}ms</i>
          </span>
        </div>
      ))}

      <div className="dbg__panel">
        <p className="dbg__title">
          <b>●</b> debug build <button type="button" onClick={exit}>× exit</button>
        </p>
        <p>
          FPS <b className={stats.fps < 45 ? 'is-warn' : ''}>{stats.fps || '··'}</b>
        </p>
        <p>
          DOM nodes <b>{stats.nodes || '··'}</b>
        </p>
        <p>
          React <b>19</b> · Vite <b>HMR off</b>
        </p>
        <p>
          bugs <b>0</b> <em>(known)</em>
        </p>
      </div>
    </div>
  );
}
