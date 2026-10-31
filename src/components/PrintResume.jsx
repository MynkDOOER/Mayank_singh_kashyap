import { AWARDS, PROFILE, PROJECTS, SKILLS } from '../data/site';
import './PrintResume.css';

/*
 * Easter egg: invisible on screen. When someone prints the page (Ctrl+P),
 * the site is hidden and this one-page resume is printed instead, with a QR
 * code back to the live portfolio. Built from site.js, so it stays in sync.
 */

const SITE = 'm4mayank.vercel.app';
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export default function PrintResume() {
  return (
    <div className="print-resume" aria-hidden="true">
      <header className="pr-head">
        <div>
          <h1>{PROFILE.name}</h1>
          <p className="pr-role">
            {PROFILE.role} · {PROFILE.year} · {PROFILE.location}
          </p>
          <p className="pr-links">
            {PROFILE.email} · {bare(PROFILE.links.github)} · {bare(PROFILE.links.linkedin)}
          </p>
        </div>
        <figure className="pr-qr">
          <img src="/qr.svg" alt="" width="74" height="74" />
          <figcaption>
            Scan for the
            <br />
            live portfolio
          </figcaption>
        </figure>
      </header>

      <p className="pr-bio">{PROFILE.bio[0]}</p>

      <section>
        <h2>Projects</h2>
        {PROJECTS.map((p) => (
          <article className="pr-proj" key={p.id}>
            <p className="pr-proj__top">
              <b>{p.name}</b>
              <span>
                {p.kind} · {p.year}
              </span>
            </p>
            <p className="pr-proj__detail">{p.detail}</p>
            <p className="pr-proj__meta">
              {p.stack.join(' · ')} — {bare(p.repo)}
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        <dl className="pr-skills">
          {[...SKILLS].reverse().map((s) => (
            <div key={s.group}>
              <dt>{s.group}</dt>
              <dd>{s.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      {AWARDS.length > 0 && (
        <section>
          <h2>Recognition</h2>
          <ul className="pr-awards">
            {AWARDS.map((a) => (
              <li key={a.id}>
                <b>{a.rankText}</b>, {a.title} — {a.detail} ({a.date})
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="pr-foot">
        Printed from {SITE}. The live version has a Rubik’s cube you can solve, and a game hidden inside it.
      </footer>
    </div>
  );
}
