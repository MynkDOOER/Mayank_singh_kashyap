import { AWARDS } from '../data/site';
import './Recognition.css';

/* Results first, certificates one click away. Sits at the foot of the Work section. */
export default function Recognition() {
  return (
    <div className="recog">
      <p className="eyebrow eyebrow--yellow" data-reveal>// recognition</p>

      <ul className="recog__list">
        {AWARDS.map((a) => (
          <li key={a.id} className="recog__cell" data-reveal>
            <a
              className={`recog__card recog__card--${a.color}`}
              href={a.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="recog__rank" aria-hidden="true">
                <small>{a.rankLabel}</small>
                {a.rank}
              </span>

              <span className="recog__body">
                <span className="recog__top">
                  <b className="recog__title">{a.title}</b>
                  <span className="recog__date">{a.date}</span>
                </span>
                <span className="recog__detail">
                  <span className="sr-only">{`${a.rankText}. `}</span>
                  {a.detail}
                </span>
                <span className="recog__cta">
                  View certificate <span className="recog__arrow">↗</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
