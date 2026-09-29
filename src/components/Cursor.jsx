import { useEffect, useRef } from 'react';
import './Cursor.css';

/** A little tumbling cube that trails the pointer and reacts to targets. */
export default function Cursor() {
  const dotRef = useRef(null);
  const cubeRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const cube = cubeRef.current;
    if (!dot || !cube) return;

    document.documentElement.classList.add('has-cube-cursor');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    /* follow the pointer with a little lag; stop once caught up */
    const frame = () => {
      raf = 0;
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cube.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      kick();
    };

    const INTERACTIVE = 'a, button, [data-cursor], input, textarea, summary';
    const onOver = (e) => {
      const hit = e.target.closest?.(INTERACTIVE);
      cube.classList.toggle('is-active', !!hit);
      const label = hit?.getAttribute?.('data-cursor');
      cube.dataset.label = label || '';
      cube.classList.toggle('has-label', !!label);
    };

    const onDown = () => cube.classList.add('is-down');
    const onUp = () => cube.classList.remove('is-down');
    const onLeave = () => cube.classList.add('is-gone');
    const onEnter = () => cube.classList.remove('is-gone');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cube-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-cube" ref={cubeRef} aria-hidden="true">
        <div className="cursor-cube__box">
          <span style={{ transform: 'translateZ(9px)' }} />
          <span style={{ transform: 'rotateY(180deg) translateZ(9px)' }} />
          <span style={{ transform: 'rotateY(90deg) translateZ(9px)' }} />
          <span style={{ transform: 'rotateY(-90deg) translateZ(9px)' }} />
          <span style={{ transform: 'rotateX(90deg) translateZ(9px)' }} />
          <span style={{ transform: 'rotateX(-90deg) translateZ(9px)' }} />
        </div>
      </div>
    </>
  );
}
