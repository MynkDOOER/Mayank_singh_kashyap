import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SKILLS } from '../data/site';
import './Skills.css';

/* Slot order inside a 3x3 slab: front row first so skills face the viewer,
   then the sides, the back, and the centre last. [x, z] with -1..1. */
const SLOTS = [
  [-1, 1], [0, 1], [1, 1],
  [1, 0], [-1, 0],
  [1, -1], [0, -1], [-1, -1],
  [0, 0],
];

const buildTower = () =>
  SKILLS.map((layer, li) => ({
    ...layer,
    li,
    cubes: SLOTS.map(([x, z], si) => ({
      key: `${li}-${si}`,
      x,
      z,
      skill: layer.items[si] || null,
    })),
  }));

const TOWER = buildTower();

function Cube({ cube, size, color, isHot, onHot }) {
  const h = size / 2;
  const kind = cube.skill ? color : color === 'ghost' ? 'ghost-fill' : 'fill';

  const faces = [
    { f: 'top', t: `rotateX(90deg) translateZ(${h}px)` },
    { f: 'bottom', t: `rotateX(-90deg) translateZ(${h}px)` },
  ];
  if (cube.z === 1) faces.push({ f: 'front', t: `translateZ(${h}px)` });
  if (cube.z === -1) faces.push({ f: 'back', t: `rotateY(180deg) translateZ(${h}px)` });
  if (cube.x === 1) faces.push({ f: 'right', t: `rotateY(90deg) translateZ(${h}px)` });
  if (cube.x === -1) faces.push({ f: 'left', t: `rotateY(-90deg) translateZ(${h}px)` });

  return (
    <div
      className={`tc tc--${kind}${isHot ? ' is-hot' : ''}`}
      style={{
        width: size,
        height: size,
        marginLeft: -h,
        marginTop: -h,
        transform: `translate3d(${cube.x * size}px, ${isHot ? -size * 0.42 : 0}px, ${cube.z * size}px)`,
      }}
      data-cursor={cube.skill || undefined}
      onPointerEnter={cube.skill ? () => onHot(cube.skill) : undefined}
    >
      {faces.map((face) => (
        <span key={face.f} className={`tc__face tc__face--${face.f}`} style={{ transform: face.t }} />
      ))}
    </div>
  );
}

export default function Skills() {
  const tower = TOWER;
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const [size, setSize] = useState(48);
  const [active, setActive] = useState(null); /* layer index */
  const [hot, setHot] = useState(null); /* skill name */
  const orbit = useRef({ y: -38, ty: -38, x: -24, tx: -24, drag: false, lx: 0, ly: 0, idle: true });

  /* responsive block size */
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSize(Math.round(Math.max(28, Math.min(58, w / (w < 520 ? 9.2 : 7.6)))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* slow spin when idle, drag to rotate */
  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;
    /* no idle spin on touch screens or with reduced motion: it is the most
       expensive thing on the page and nobody hovers it on a phone */
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const o = orbit.current;
    let raf = 0;
    let onScreen = false;

    /* Runs only while the tower is on screen and the tab is visible; the idle
       spin keeps it going then, otherwise it stops once the view settles. */
    const frame = () => {
      raf = 0;
      const spinning = o.idle && !o.drag && !reduced && onScreen && !document.hidden;
      if (spinning) o.ty -= 0.12;
      o.y += (o.ty - o.y) * 0.08;
      o.x += (o.tx - o.x) * 0.08;
      scene.style.transform = `rotateX(${o.x}deg) rotateY(${o.y}deg)`;
      const settled = !o.drag && Math.abs(o.tx - o.x) < 0.02 && Math.abs(o.ty - o.y) < 0.02;
      if (spinning || !settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick();

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) kick();
    });
    io.observe(stage);
    const onVis = () => !document.hidden && kick();
    document.addEventListener('visibilitychange', onVis);

    const down = (e) => {
      o.drag = true;
      o.lx = e.clientX;
      o.ly = e.clientY;
      stage.classList.add('is-grabbing');
      kick();
    };
    const move = (e) => {
      if (!o.drag) return;
      o.ty += (e.clientX - o.lx) * 0.5;
      o.tx = Math.max(-60, Math.min(-6, o.tx - (e.clientY - o.ly) * 0.3));
      o.lx = e.clientX;
      o.ly = e.clientY;
      kick();
    };
    const up = () => {
      o.drag = false;
      stage.classList.remove('is-grabbing');
      kick();
    };
    const enter = () => (o.idle = false);
    const leave = () => {
      o.idle = true;
      kick();
    };

    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    stage.addEventListener('pointerenter', enter);
    stage.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      stage.removeEventListener('pointerenter', enter);
      stage.removeEventListener('pointerleave', leave);
    };
  }, []);

  const hotLayer = hot ? tower.findIndex((l) => l.items.includes(hot)) : -1;
  const focus = active ?? (hotLayer >= 0 ? hotLayer : null);

  /* layer heights: centred tower, gaps open up above the focused layer */
  const step = size * 1.2;
  const layerY = (li) => {
    const base = -(li - (tower.length - 1) / 2) * step;
    if (focus === null) return base;
    if (li > focus) return base - size * 0.7;
    if (li === focus) return base - size * 0.28;
    return base;
  };

  const clear = () => {
    setHot(null);
    setActive(null);
  };

  const readout = hot
    ? { name: hot, group: tower[hotLayer]?.group }
    : focus !== null
    ? { name: tower[focus].group, group: null }
    : null;

  return (
    <section className="section section--line skills" id="stack">
      <div className="wrap">
        <header className="sechead" data-reveal>
          <p className="eyebrow eyebrow--green">// tech stack</p>
          <h2 className="display h2">
            Tools and technologies<span className="ink-blue">.</span>
          </h2>
          <p className="lede sechead__lede">
            Grouped by where they sit in an application, from tooling at the base to the interface
            at the top.
          </p>
        </header>

        <div className="tower" onPointerLeave={clear}>
          <div className="tower__stage" ref={stageRef} data-reveal="cube">
            <div className="tower__scene" ref={sceneRef}>
              {tower.map((layer) => (
                <div
                  key={layer.group}
                  className={`tl${focus === layer.li ? ' is-focus' : ''}`}
                  style={{
                    transform: `translate3d(${focus === layer.li ? size * 0.55 : 0}px, ${layerY(
                      layer.li
                    )}px, 0)`,
                  }}
                  onPointerEnter={() => setActive(layer.li)}
                >
                  {layer.cubes.map((cube) => (
                    <Cube
                      key={cube.key}
                      cube={cube}
                      size={size}
                      color={layer.color}
                      isHot={cube.skill !== null && cube.skill === hot}
                      onHot={setHot}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="tower__floor" />

            <div className="tower__readout" aria-live="polite">
              {readout && (
                <>
                  <b>{readout.name}</b>
                  {readout.group && <span>{readout.group}</span>}
                </>
              )}
            </div>
          </div>

          <ol className="legend">
            {[...tower].reverse().map((layer) => (
              <li
                key={layer.group}
                className={`legend__row legend__row--${layer.color}${
                  focus === layer.li ? ' is-focus' : ''
                }`}
                onPointerEnter={() => setActive(layer.li)}
                data-reveal
                style={{ '--d': `${(tower.length - layer.li) * 60}ms` }}
              >
                <div className="legend__head">
                  <span className="legend__swatch" />
                  <h3 className="legend__title">{layer.group}</h3>
                  <span className="legend__level">L{layer.li + 1}</span>
                </div>
                <ul className="legend__chips">
                  {layer.items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className={`legend__chip${hot === item ? ' is-hot' : ''}`}
                        onPointerEnter={() => setHot(item)}
                        onFocus={() => {
                          setHot(item);
                          setActive(layer.li);
                        }}
                        onBlur={() => setHot(null)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
