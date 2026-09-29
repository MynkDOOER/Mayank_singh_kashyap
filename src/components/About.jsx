import { DETAILS, PROFILE } from '../data/site';
import './About.css';

export default function About() {
  return (
    <section className="section section--line about" id="about">
      <div className="wrap about__grid">
        <div className="about__col" data-reveal>
          <p className="eyebrow eyebrow--blue">// about</p>
          <h2 className="display h2 about__title">About.</h2>
          {PROFILE.bio.map((para) => (
            <p className="about__bio" key={para.slice(0, 24)}>
              {para}
            </p>
          ))}
        </div>

        <aside className="about__card" data-reveal="cube">
          <div className="about__cardhead">
            <span className="about__cardmark" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="mono-label">Profile</span>
          </div>

          <dl className="about__dl">
            {DETAILS.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="about__links">
            <a href={PROFILE.links.github} target="_blank" rel="noreferrer noopener">GitHub ↗</a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn ↗</a>
            <a href={PROFILE.links.leetcode} target="_blank" rel="noreferrer noopener">LeetCode ↗</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
