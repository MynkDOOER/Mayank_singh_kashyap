import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CubeDash from './CubeDash';
import './RubikCube.css';

/* ------------------------------------------------------------------ *
 * 3x3 matrix helpers. These are exactly the matrices CSS uses for
 * rotateX/Y/Z, so committed state always matches what was rendered.
 * ------------------------------------------------------------------ */
const rot = (axis, deg) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.round(Math.cos(r));
  const s = Math.round(Math.sin(r));
  if (axis === 0) return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axis === 1) return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};

const mul = (a, b) => {
  const out = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
  return out;
};

const applyM = (m, v) => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

/* column-major, per the matrix3d() spec */
const toMatrix3d = (m) =>
  `matrix3d(${m[0][0]},${m[1][0]},${m[2][0]},0,` +
  `${m[0][1]},${m[1][1]},${m[2][1]},0,` +
  `${m[0][2]},${m[1][2]},${m[2][2]},0,0,0,0,1)`;

const IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

/* Sticker colours. CSS +y points down the screen, so -y is the top (U). */
const FACES = [
  { key: 'px', axis: 0, sign: 1, css: 'rotateY(90deg)', color: 'var(--red)' },
  { key: 'nx', axis: 0, sign: -1, css: 'rotateY(-90deg)', color: '#FF8A1F' },
  { key: 'ny', axis: 1, sign: -1, css: 'rotateX(90deg)', color: 'var(--yellow)' },
  { key: 'py', axis: 1, sign: 1, css: 'rotateX(-90deg)', color: 'var(--cube-white)' },
  { key: 'pz', axis: 2, sign: 1, css: 'translateZ(0)', color: 'var(--blue)' },
  { key: 'nz', axis: 2, sign: -1, css: 'rotateY(180deg)', color: 'var(--green)' },
];

/* Standard notation → layer rotation. A clockwise turn (seen from that
   face) of R takes F→U, of U takes F→L, of F takes U→R; opposite faces
   mirror them. Verified against the rotation matrices above. */
const NOTATION = {
  R: { axis: 0, layer: 1, dir: 1, color: 'var(--red)' },
  L: { axis: 0, layer: -1, dir: -1, color: '#FF8A1F' },
  U: { axis: 1, layer: -1, dir: -1, color: 'var(--yellow)' },
  D: { axis: 1, layer: 1, dir: 1, color: 'var(--cube-white)' },
  F: { axis: 2, layer: 1, dir: 1, color: 'var(--blue)' },
  B: { axis: 2, layer: -1, dir: -1, color: 'var(--green)' },
};
const FACE_ORDER = ['U', 'F', 'R', 'D', 'B', 'L'];
const OPPOSITE = { R: 'L', L: 'R', U: 'D', D: 'U', F: 'B', B: 'F' };

/* Any position can be solved in at most 20 face turns, so a 20-turn
   scramble is as deep as a scramble ever needs to be. */
const SCRAMBLE_LEN = 20;
const TURN_MS = 260;
const SCRAMBLE_MS = 110;

/* a move is { face, q } with q = quarter turns clockwise: 1, 2 or 3 (′) */
const label = ({ face, q }) => face + (q === 2 ? '2' : q === 3 ? '′' : '');
const toLayer = ({ face, q }) => {
  const n = NOTATION[face];
  return { axis: n.axis, layer: n.layer, dir: q === 3 ? -n.dir : n.dir, times: q === 2 ? 2 : 1 };
};

const makeCubies = () => {
  const list = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        const home = [x, y, z];
        list.push({
          id: `${x}${y}${z}`,
          pos: [x, y, z],
          mat: IDENTITY,
          stickers: FACES.map((f) => (home[f.axis] === f.sign ? f.color : null)),
        });
      }
  return list;
};

/* Random scramble: never the same face twice in a row, and never three
   turns on one axis (e.g. R L R), which would partly cancel. */
const randomScramble = (n) => {
  const faces = Object.keys(NOTATION);
  const out = [];
  while (out.length < n) {
    const face = faces[Math.floor(Math.random() * 6)];
    const a = out[out.length - 1];
    const b = out[out.length - 2];
    if (a && a.face === face) continue;
    if (a && b && OPPOSITE[a.face] === face && b.face === face) continue;
    if (a && b && a.face === OPPOSITE[b.face] && (face === a.face || face === b.face)) continue;
    out.push({ face, q: [1, 2, 3][Math.floor(Math.random() * 3)] });
  }
  return out;
};

/* Append a move to history, merging consecutive turns of the same face
   (R then R′ cancels; R then R becomes R2). */
const pushMove = (hist, move) => {
  const top = hist[hist.length - 1];
  if (top && top.face === move.face) {
    const q = (top.q + move.q) % 4;
    return q === 0 ? hist.slice(0, -1) : [...hist.slice(0, -1), { face: move.face, q }];
  }
  return [...hist, move];
};

const inverse = ({ face, q }) => ({ face, q: 4 - q });

const commitTo = (cubies, move) => {
  const { axis, layer, dir, times } = toLayer(move);
  const R = rot(axis, dir * 90 * times);
  for (const c of cubies) {
    if (c.pos[axis] !== layer) continue;
    c.pos = applyM(R, c.pos).map((n) => Math.round(n));
    c.mat = mul(R, c.mat);
  }
};

/* Opens already scrambled, so there is something to solve. */
const makePuzzle = () => {
  const cubies = makeCubies();
  const scramble = randomScramble(SCRAMBLE_LEN);
  let hist = [];
  scramble.forEach((m) => {
    commitTo(cubies, m);
    hist = pushMove(hist, m);
  });
  return { cubies, hist };
};

const wait = (ms) => new Promise((r) => window.setTimeout(r, ms));

export default function RubikCube() {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const angleRef = useRef(null);
  const cubieEls = useRef([]);

  const [{ cubies, hist: startHist }] = useState(makePuzzle);
  const [size, setSize] = useState(56);
  const [history, setHistory] = useState(startHist);
  const [prime, setPrime] = useState(false);
  const [mode, setMode] = useState('idle'); /* idle | turning | scrambling | solving */
  const [lastMove, setLastMove] = useState(null);
  const [playing, setPlaying] = useState(false); /* Cube Dash mode */

  const histRef = useRef(startHist);
  const chain = useRef(Promise.resolve());
  const pending = useRef(0);
  const orbit = useRef({ x: -24, y: -34, tx: -24, ty: -34, drag: false, lx: 0, ly: 0, moved: 0 });
  const kick = useRef(() => {});

  /* ---------- responsive cubie size ---------- */
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSize(Math.round(Math.max(26, Math.min(58, w / 7.2))));
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  /* ---------- write a cubie's transform to the DOM ---------- */
  const paint = useCallback(
    (i, spin = '') => {
      const el = cubieEls.current[i];
      if (!el) return;
      const c = cubies[i];
      const g = size * 1.045;
      el.style.transform = `${spin} translate3d(${c.pos[0] * g}px, ${c.pos[1] * g}px, ${
        c.pos[2] * g
      }px) ${toMatrix3d(c.mat)}`;
    },
    [size, cubies]
  );

  const paintAll = useCallback(() => {
    for (let i = 0; i < cubies.length; i++) paint(i);
  }, [paint, cubies]);
  useLayoutEffect(paintAll, [paintAll]);

  const paintRef = useRef(paint);
  useLayoutEffect(() => {
    paintRef.current = paint;
  }, [paint]);

  /* ---------- one animated move ---------- */
  const animate = useCallback(
    async (move, ms) => {
      const { axis, layer, dir, times } = toLayer(move);
      const deg = dir * 90 * times;
      const spin = ['rotateX', 'rotateY', 'rotateZ'][axis] + `(${deg}deg)`;
      const dur = times === 2 ? ms * 1.5 : ms;
      const moving = [];
      cubies.forEach((c, i) => {
        if (c.pos[axis] !== layer) return;
        moving.push(i);
        const el = cubieEls.current[i];
        if (el) el.style.transition = `transform ${dur}ms cubic-bezier(.55,.05,.3,1)`;
        paintRef.current(i, spin);
      });
      await wait(dur + 16);
      commitTo(cubies, move);
      moving.forEach((i) => {
        const el = cubieEls.current[i];
        if (el) el.style.transition = 'none';
        paintRef.current(i);
        if (el) {
          void el.offsetWidth;
          el.style.transition = '';
        }
      });
    },
    [cubies]
  );

  /* ---------- a serial queue, so rapid clicks never overlap turns ---------- */
  const enqueue = useCallback(
    (moves, ms, nextMode, record) => {
      pending.current += moves.length;
      setMode(nextMode);
      moves.forEach((m) => {
        chain.current = chain.current.then(async () => {
          await animate(m, ms);
          histRef.current = record(histRef.current, m);
          setHistory(histRef.current);
          setLastMove(label(m));
          pending.current -= 1;
          if (pending.current === 0) setMode('idle');
        });
      });
    },
    [animate]
  );

  const turn = useCallback(
    (face, ccw = prime) => enqueue([{ face, q: ccw ? 3 : 1 }], TURN_MS, 'turning', pushMove),
    [enqueue, prime]
  );

  const scramble = useCallback(() => {
    enqueue(randomScramble(SCRAMBLE_LEN), SCRAMBLE_MS, 'scrambling', pushMove);
  }, [enqueue]);

  const solve = useCallback(() => {
    /* undo the (already simplified) history, newest first */
    const moves = [...histRef.current].reverse().map(inverse);
    enqueue(moves, TURN_MS, 'solving', (h) => h.slice(0, -1));
  }, [enqueue]);

  /* ---------- keyboard: R L U D F B, Shift for counter-clockwise ---------- */
  const onKeyDown = (e) => {
    const face = e.key.toUpperCase();
    if (NOTATION[face] && !busy && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      turn(face, e.shiftKey !== prime);
    }
  };

  /* ---------- orbit: drag to move it around, slight pointer parallax ---------- */
  useEffect(() => {
    const scene = sceneRef.current;
    const host = hostRef.current;
    if (!scene || !host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let frameN = 0;

    const writeAngle = (o) => {
      if (!angleRef.current) return;
      const ry = ((Math.round(o.y) % 360) + 360) % 360;
      angleRef.current.textContent = `X ${String(Math.round(o.x)).padStart(3, ' ')}°  Y ${String(ry).padStart(3, '0')}°`;
    };

    /* The loop only runs while the view is moving (dragging, or easing to a
       stop). Once settled it ends, so an idle cube costs nothing per frame. */
    const frame = () => {
      raf = 0;
      const o = orbit.current;
      o.x += (o.tx - o.x) * 0.09;
      o.y += (o.ty - o.y) * 0.09;
      const settled = !o.drag && Math.abs(o.tx - o.x) < 0.02 && Math.abs(o.ty - o.y) < 0.02;
      if (settled) {
        o.x = o.tx;
        o.y = o.ty;
      }
      scene.style.transform = `rotateX(${o.x}deg) rotateY(${o.y}deg)`;
      if (settled || frameN++ % 4 === 0) writeAngle(o);
      if (!settled) raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick.current();

    const onPointerMove = (e) => {
      const o = orbit.current;
      if (o.drag) {
        o.ty += (e.clientX - o.lx) * 0.5;
        o.tx = Math.max(-85, Math.min(85, o.tx - (e.clientY - o.ly) * 0.5));
        o.moved += Math.abs(e.clientX - o.lx) + Math.abs(e.clientY - o.ly);
        o.lx = e.clientX;
        o.ly = e.clientY;
        kick.current();
      }
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const o = orbit.current;
      o.drag = true;
      o.moved = 0;
      o.lx = e.clientX;
      o.ly = e.clientY;
      host.setPointerCapture?.(e.pointerId);
      host.classList.add('is-grabbing');
      kick.current();
    };
    const onUp = (e) => {
      orbit.current.drag = false;
      host.releasePointerCapture?.(e.pointerId);
      host.classList.remove('is-grabbing');
      kick.current();
    };

    host.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    if (reduced) scene.style.transition = 'none';
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const resetView = () => {
    const o = orbit.current;
    o.tx = -24;
    o.ty = Math.round(o.y / 360) * 360 - 34;
    kick.current();
  };

  const half = size / 2;
  const g = size * 1.045;
  const solved = history.length === 0;
  const busy = mode === 'scrambling' || mode === 'solving';
  const log = history.slice(-9);

  const exitGame = () => {
    setPlaying(false);
    window.requestAnimationFrame(() => hostRef.current?.focus({ preventScroll: true }));
  };

  return (
    <>
    {/* round button on the panel's top-left corner: play the game / back to the puzzle */}
    <button
      type="button"
      className={`rk-corner${playing ? ' is-playing' : ''}`}
      onClick={playing ? exitGame : () => setPlaying(true)}
      disabled={!playing && mode !== 'idle'}
      aria-label={playing ? 'Back to the puzzle' : 'Play Cube Dash, a jumping game on the cube'}
      title={playing ? 'Back to puzzle' : 'Play Cube Dash'}
    >
      {playing ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M5.5 3.5v9l7-4.5z" fill="currentColor" />
        </svg>
      )}
    </button>
    {playing && <CubeDash onExit={exitGame} />}
    {/* the puzzle stays mounted while playing, so it keeps its state */}
    <div className="rubik" onKeyDown={onKeyDown} style={playing ? { display: 'none' } : undefined}>
      {/* ---------- top bar ---------- */}
      <div className="rk-bar">
        <span className="rk-tag">3×3×3</span>
        <span className={`rk-state rk-state--${solved ? 'solved' : mode}`} aria-live="polite">
          <i />
          {solved && mode === 'idle'
            ? 'Solved'
            : mode === 'scrambling'
            ? 'Scrambling'
            : mode === 'solving'
            ? `Solving · ${history.length} left`
            : `${history.length} ${history.length === 1 ? 'move' : 'moves'} to undo`}
        </span>
        <span className="rk-angle" ref={angleRef} aria-hidden="true" />
      </div>

      {/* ---------- 3D stage ---------- */}
      <div
        className="rubik__stage"
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-label="Rubik's cube. Drag to rotate the view. Keys R, L, U, D, F and B turn a face; hold Shift to turn it the other way."
        onDoubleClick={resetView}
      >
        <div className="rubik__scene" ref={sceneRef} style={{ '--cs': `${size}px` }}>
          <div
            className="rubik__floor"
            style={{
              width: g * 5,
              height: g * 5,
              marginLeft: -g * 2.5,
              marginTop: -g * 2.5,
              transform: `translateY(${g * 1.5 + size * 0.9}px) rotateX(90deg)`,
            }}
          />
          {cubies.map((c, i) => (
            <div
              className="cubie"
              key={c.id}
              ref={(el) => (cubieEls.current[i] = el)}
              style={{ width: size, height: size, marginLeft: -half, marginTop: -half }}
            >
              {FACES.map((f, fi) => (
                <span
                  key={f.key}
                  className={`cubie__face${c.stickers[fi] ? ' is-sticker' : ''}`}
                  style={{
                    transform: `${f.css} translateZ(${half}px)`,
                    background: c.stickers[fi] || '#0B0B0B',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <ol className="rk-log" aria-label="Moves since solved">
          {log.map((m, i) => (
            <li key={`${history.length - log.length + i}-${label(m)}`} className={i === log.length - 1 ? 'is-last' : ''}>
              {label(m)}
            </li>
          ))}
          {history.length > log.length && <li className="rk-log__more">+{history.length - log.length}</li>}
        </ol>
        {lastMove && (
          <span className="rk-last" key={`${lastMove}-${history.length}`} aria-hidden="true">
            {lastMove}
          </span>
        )}
      </div>

      {/* ---------- controls ---------- */}
      <div className="rk-controls">
        <div className="rk-faces" role="group" aria-label="Turn a face">
          {FACE_ORDER.map((f) => (
            <button
              key={f}
              type="button"
              className="rk-face"
              style={{ '--c': NOTATION[f].color }}
              onClick={(e) => turn(f, e.shiftKey !== prime)}
              disabled={busy}
              aria-label={`Turn ${f}${prime ? ' counter-clockwise' : ''}`}
            >
              <i />
              {f}
              {prime && <sup>′</sup>}
            </button>
          ))}
          <button
            type="button"
            className={`rk-prime${prime ? ' is-on' : ''}`}
            onClick={() => setPrime((p) => !p)}
            aria-pressed={prime}
            aria-label="Counter-clockwise"
            disabled={busy}
          >
            ↺
          </button>
        </div>

        <div className="rk-actions">
          <button type="button" className="rk-btn" onClick={scramble} disabled={mode !== 'idle'}>
            Scramble
          </button>
          <button
            type="button"
            className="rk-btn rk-btn--go"
            onClick={solve}
            disabled={mode !== 'idle' || solved}
          >
            Solve
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
