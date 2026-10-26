import { useState } from 'react';
import { PROFILE } from '../data/site';
import { useMagnetic } from '../hooks/useMagnetic';
import './Contact.css';

const LINES = [
  { cmd: 'whoami', out: 'mayank singh kashyap' },
  { cmd: 'cat focus.txt', out: 'full-stack web development' },
  { cmd: 'ls ~/projects', out: 'verdikt  resolverhub  shrink-this  bookipedia  wiseroom' },
  { cmd: 'cat approach.txt', out: 'use what I know, learn what I don’t' },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const magnet = useMagnetic(0.24);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <div className="panel blueprint" data-reveal="cube">
          <div className="panel__left">
            <p className="panel__eyebrow">// contact</p>
            <h2 className="display panel__title">
              Let’s talk<span className="panel__accent" aria-hidden="true">.</span>
            </h2>
            <p className="panel__lede">
              For opportunities, collaboration or questions about my work, email is the best way
              to reach me.
            </p>

            <div className="panel__actions">
              <span ref={magnet} className="panel__magnet">
                <a className="btn" href={`mailto:${PROFILE.email}`}>
                  Send an email <span className="btn__arr">→</span>
                </a>
              </span>
              <button className="btn btn--ghost panel__copy" onClick={copy} type="button">
                {copied ? '✓ Copied' : PROFILE.email}
              </button>
            </div>

            <div className="panel__socials">
              <a href={PROFILE.links.github} target="_blank" rel="noreferrer noopener">GitHub</a>
              <span>·</span>
              <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a>
              <span>·</span>
              <a href={PROFILE.links.leetcode} target="_blank" rel="noreferrer noopener">LeetCode</a>
              <span>·</span>
              <a href={PROFILE.links.resume} target="_blank" rel="noreferrer noopener">Resume</a>
            </div>
          </div>

          <div className="panel__right">
            <div className="term">
              <div className="term__bar">
                <i /><i /><i />
                <span>mayank@dev: ~</span>
              </div>
              <div className="term__body">
                {LINES.map((l) => (
                  <div className="term__line" key={l.cmd}>
                    <p className="term__cmd">
                      <span>$</span> {l.cmd}
                    </p>
                    <p className="term__out">{l.out}</p>
                  </div>
                ))}
                <p className="term__cmd term__cmd--live">
                  <span>$</span> <b />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
