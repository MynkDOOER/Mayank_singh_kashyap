import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './CubeDash.css';

/*
 * Cube Dash — a small Geometry Dash-style runner on the Rubik's cube.
 *
 * A runner slides along the top face and jumps over raised stickers.
 * At the far edge the whole cube rolls 90° and the next face becomes the floor.
 * Four faces form the ring the runner travels around; the face that rolls
 * underneath gets fresh obstacles while it's out of sight.
 *
 * Units are "cells" (one sticker); the top face spans x = -1.5 … +1.5.
 * Only the runner is written every frame; the roll is one CSS transition.
 */

const RING = ['var(--yellow)', 'var(--red)', 'var(--cube-white)', '#FF8A1F'];
const SPEED = 2.3; // cells per second at the start
const TOP_SPEED = 6.8; // the speed it creeps towards but never quite reaches
const RAMP = 16; // faces it takes to cover ~63% of the way to TOP_SPEED
/* Speeds up on every face, quickly at first, then more gently. Above ~7 cells/s
   an obstacle is on screen for less than human reaction time, hence the ceiling. */
const speedAt = (n) => TOP_SPEED - (TOP_SPEED - SPEED) * Math.exp(-n / RAMP);
const JUMP_T = 0.6; // seconds in the air at the start
/* jumps get snappier at speed, so one jump never carries you across a whole face */
const jumpTime = (speed) => Math.min(JUMP_T, Math.max(0.3, 1.6 / speed));
const JUMP_H = 1.1; // cells
const ROLL_T = 0.3; // seconds per roll at the start; rolls get quicker as you speed up
const rollTime = (speed) => Math.max(0.16, (ROLL_T * SPEED) / speed);
const OB_W = 0.5; // obstacle width, cells
const OB_H = 0.42; // obstacle height, cells
const RUN = 0.42; // runner size, cells

const BEST_KEY = 'cube-dash-best';
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (n) => {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* storage blocked: best score lasts for this visit only */
  }
};

/* one obstacle per face, on the middle or far sticker; the first face is free */
const randomFace = () => [Math.random() < 0.5 ? 1 : 2];
const freshRing = () => [[], randomFace(), randomFace(), randomFace()];

function Obstacle({ k, cell }) {
  const w = OB_W * cell;
  const h = OB_H * cell;
  const left = k * cell + (cell - w) / 2;
  const top = cell + (cell - w) / 2; // middle row
  return (
    <div className="dash__ob" style={{ left, top, width: w, height: w }}>
      <i className="dash__ob-top" style={{ transform: `translateZ(${h}px)` }} />
      <i className="dash__ob-side" style={{ top: 0, height: h, transformOrigin: '50% 0', transform: 'rotateX(90deg)' }} />
      <i className="dash__ob-side" style={{ top: w - h, height: h, transformOrigin: '50% 100%', transform: 'rotateX(-90deg)' }} />
      <i className="dash__ob-side dash__ob-side--dim" style={{ left: 0, width: h, transformOrigin: '0 50%', transform: 'rotateY(-90deg)' }} />
      <i className="dash__ob-side dash__ob-side--dim" style={{ left: w - h, width: h, transformOrigin: '100% 50%', transform: 'rotateY(90deg)' }} />
    </div>
  );
}

function Stickers({ color }) {
  return (
    <div className="dash__grid" style={{ '--fc': color }}>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

export default function CubeDash({ onExit }) {
  const hostRef = useRef(null);
  const cubeRef = useRef(null);
  const runnerRef = useRef(null);

  const [cell, setCell] = useState(56);
  const [ring, setRing] = useState(freshRing);
  const [phase, setPhase] = useState('ready'); // ready | run | dead
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  const g = useRef(null);
  const raf = useRef(0);
  const loop = useRef(() => {}); // the frame callback; a ref so it can schedule itself
  const cellRef = useRef(cell);

  /* ---------- size from the panel width ---------- */
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      setCell(Math.round(Math.max(30, Math.min(66, entry.contentRect.width / 7.4))));
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    cellRef.current = cell;
  }, [cell]);

  /* ---------- draw ---------- */
  const drawRunner = useCallback(() => {
    const s = g.current;
    const el = runnerRef.current;
    if (!s || !el) return;
    const c = cellRef.current;
    const C = 3 * c;
    const air = s.jumpT >= 0 ? s.jumpT / s.jumpDur : 0;
    const h = (s.jumpT >= 0 ? 4 * JUMP_H * air * (1 - air) : 0) + s.lift;
    const spin = s.spins * 90 + air * 90;
    el.style.transform = `translate3d(${s.x * c}px, ${-C / 2 - (RUN * c) / 2 - h * c}px, 0) rotateZ(${spin}deg)`;
  }, []);

  const setCubeAngle = (k, seconds = 0) => {
    const el = cubeRef.current;
    if (!el) return;
    el.style.transition = seconds ? `transform ${seconds}s linear` : 'none';
    el.style.transform = `rotateZ(${-90 * k}deg)`;
  };

  /* ---------- game state ---------- */
  const reset = useCallback(() => {
    g.current = {
      x: -1.5,
      jumpT: -1,
      spins: 0,
      slot: 0,
      k: 0,
      n: 0,
      rollT: -1,
      rollDur: ROLL_T,
      jumpDur: JUMP_T,
      lift: 0,
      speed: SPEED,
      ring: freshRing(),
      last: 0,
    };
    setRing(g.current.ring);
    setScore(0);
    setCubeAngle(0);
    drawRunner();
    /* dev only (removed from production builds): lets automated play-tests read the game state */
    if (import.meta.env.DEV) window.__cubeDash = g;
  }, [drawRunner]);

  useEffect(() => {
    reset();
    return () => cancelAnimationFrame(raf.current);
  }, [reset]);

  const crash = useCallback(() => {
    const s = g.current;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setPhase('dead');
    setBest((b) => {
      if (s.n > b) {
        saveBest(s.n);
        return s.n;
      }
      return b;
    });
  }, []);

  const tick = useCallback(
    (now) => {
      const s = g.current;
      const dt = Math.min(0.05, (now - (s.last || now)) / 1000);
      s.last = now;

      /* jump arc */
      if (s.jumpT >= 0) {
        s.jumpT += dt;
        if (s.jumpT >= s.jumpDur) {
          s.jumpT = -1;
          s.spins += 1;
        }
      }

      if (s.rollT >= 0) {
        /* ride the shared edge as the cube rolls: it swings over the top in an arc */
        s.rollT += dt;
        const p = Math.min(1, s.rollT / s.rollDur);
        const a = ((-45 - 90 * p) * Math.PI) / 180;
        const R = 1.5 * Math.SQRT2;
        s.x = R * Math.cos(a);
        s.lift = -R * Math.sin(a) - 1.5;
        if (p >= 1) {
          s.rollT = -1;
          s.x = -1.5;
          s.lift = 0;
        }
      } else {
        s.x += s.speed * dt;

        /* collisions with this face's raised stickers */
        const air = s.jumpT >= 0 ? s.jumpT / s.jumpDur : 0;
        const h = s.jumpT >= 0 ? 4 * JUMP_H * air * (1 - air) : 0;
        for (const k of s.ring[s.slot]) {
          const ox = k - 1; // sticker centre: -1, 0, +1
          if (Math.abs(s.x - ox) < (OB_W + RUN) / 2 - 0.06 && h < OB_H - 0.02) {
            drawRunner();
            crash();
            return;
          }
        }

        /* reached the edge: roll to the next face */
        if (s.x >= 1.5) {
          s.x = 1.5;
          s.rollT = 0;
          s.k += 1;
          s.slot = (s.slot + 1) % 4;
          s.n += 1;
          s.speed = speedAt(s.n);
          s.rollDur = rollTime(s.speed);
          /* the face now underneath is out of sight: give it new obstacles */
          const under = (s.slot + 2) % 4;
          s.ring = s.ring.map((f, i) => (i === under ? randomFace() : f));
          setRing(s.ring);
          setScore(s.n);
          setCubeAngle(s.k, s.rollDur);
        }
      }

      drawRunner();
      raf.current = requestAnimationFrame(loop.current);
    },
    [crash, drawRunner]
  );
  useLayoutEffect(() => {
    loop.current = tick;
  }, [tick]);

  const start = useCallback(() => {
    reset();
    setPhase('run');
    g.current.last = 0;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop.current);
  }, [reset]);

  const jump = useCallback(() => {
    const s = g.current;
    if (phase !== 'run') {
      start();
      return;
    }
    if (s.jumpT < 0) {
      s.jumpT = 0;
      s.jumpDur = jumpTime(s.speed);
    }
  }, [phase, start]);

  /* keep the stage focused so Space/↑ work straight away */
  useEffect(() => {
    hostRef.current?.focus({ preventScroll: true });
  }, []);

  /* pause when the tab is hidden, so dt never jumps */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && g.current) g.current.last = 0;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      if (!e.repeat || phase === 'run') jump();
    } else if (e.key === 'Escape') {
      onExit();
    }
  };

  const C = 3 * cell;
  const r = RUN * cell;

  return (
    <div className="dash">
      <div className="rk-bar">
        <span className="rk-tag">Cube Dash</span>
        <span className="rk-state dash__score" aria-live="polite">
          <i />
          {score} {score === 1 ? 'face' : 'faces'} cleared
        </span>
        <span className="rk-angle">
          <b key={score} className="dash__speed">
            ×{(speedAt(score) / SPEED).toFixed(1)}
          </b>
          {'  '}Best {best}
        </span>
      </div>

      <div
        className={`dash__stage is-${phase}`}
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-label="Cube Dash. Press Space, the up arrow or click to jump. Escape returns to the puzzle."
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (e.button === 0) jump();
        }}
      >
        <div className="dash__scene">
          <div className="dash__cube" ref={cubeRef} style={{ width: C, height: C, marginLeft: -C / 2, marginTop: -C / 2 }}>
            <div className="dash__face" style={{ transform: `translateZ(${C / 2}px)` }}>
              <Stickers color="var(--blue)" />
            </div>
            <div className="dash__face" style={{ transform: `rotateY(180deg) translateZ(${C / 2}px)` }}>
              <Stickers color="var(--green)" />
            </div>
            {RING.map((color, s) => (
              <div
                key={s}
                className="dash__face"
                style={{ transform: `rotateZ(${90 * s}deg) rotateX(90deg) translateZ(${C / 2}px)` }}
              >
                <Stickers color={color} />
                {ring[s].map((k) => (
                  <Obstacle key={k} k={k} cell={cell} />
                ))}
              </div>
            ))}
          </div>

          <div className="dash__runner" ref={runnerRef} style={{ width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2 }}>
            <i className="dash__rf dash__rf--front" style={{ transform: `translateZ(${r / 2}px)` }} />
            <i className="dash__rf dash__rf--top" style={{ transform: `rotateX(90deg) translateZ(${r / 2}px)` }} />
            <i className="dash__rf dash__rf--right" style={{ transform: `rotateY(90deg) translateZ(${r / 2}px)` }} />
            <i className="dash__rf dash__rf--left" style={{ transform: `rotateY(-90deg) translateZ(${r / 2}px)` }} />
          </div>
        </div>

        {phase !== 'run' && (
          <div className="dash__overlay">
            {phase === 'ready' ? (
              <>
                <b>Jump the raised stickers.</b>
                <span>Space, ↑ or click to jump · the cube rolls at each edge</span>
                <em>Press Space or click to start</em>
              </>
            ) : (
              <>
                <b>
                  Crashed after {score} {score === 1 ? 'face' : 'faces'}
                </b>
                <span>{score > 0 && score >= best ? 'New best!' : `Best: ${best}`}</span>
                <em>Press Space or click to try again</em>
              </>
            )}
          </div>
        )}
      </div>

      <div className="rk-controls dash__controls">
        <p className="dash__hint">Space · ↑ · click to jump</p>
        <button type="button" className="rk-btn" onClick={onExit}>
          ← Back to puzzle
        </button>
      </div>
    </div>
  );
}
