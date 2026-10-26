import { useRef } from 'react';
import { PROJECTS } from '../data/site';
import Recognition from './Recognition';
import './Projects.css';

const canTilt = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ProjectCube({ project }) {
  return (
    <div className="pcube" aria-hidden="true">
      <div className="pcube__box">
        <div className="pcube__face pcube__face--front">
          <span className="pcube__idx">{project.index}</span>
          <span className="pcube__name" style={{ '--n': project.name.length }}>
            {project.name}
          </span>
        </div>
        <div className="pcube__face pcube__face--top" />
        <div className="pcube__face pcube__face--right" />
      </div>
    </div>
  );
}

function ProjectCard({ project, wide }) {
  const ref = useRef(null);
  const raf = useRef(0);

  /* the card leans toward the pointer; a highlight follows it across the visual */
  const onMove = (e) => {
    if (!canTilt()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current;
    cancelAnimationFrame(raf.current);
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  };

  return (
    <div className={`pcell${wide ? ' pcell--wide' : ''}`} data-reveal>
      <a
        ref={ref}
        className={`pcard pcard--${project.color}${wide ? ' pcard--wide' : ''}`}
        href={project.repo}
        target="_blank"
        rel="noreferrer noopener"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="pcard__visual">
          <span className="pcard__kind">{project.kind}</span>
          <span className="pcard__year">{project.year}</span>
          {project.award && <span className="pcard__award">★ {project.award}</span>}
          <ProjectCube project={project} />
        </div>

        <div className="pcard__body">
          <h3 className="pcard__title">{project.name}</h3>
          <p className="pcard__detail">{project.detail}</p>
          <ul className="pcard__tags">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <span className="pcard__cta">
            Source code <span className="pcard__arrow">↗</span>
          </span>
        </div>
      </a>
    </div>
  );
}

export default function Projects() {
  const odd = PROJECTS.length % 2 === 1;
  return (
    <section className="section section--line" id="work">
      <div className="wrap">
        <header className="sechead" data-reveal>
          <p className="eyebrow eyebrow--red">// projects</p>
          <h2 className="display h2">Work.</h2>
        </header>

        <div className="pgrid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} wide={odd && i === PROJECTS.length - 1} />
          ))}
        </div>

        <Recognition />
      </div>
    </section>
  );
}
