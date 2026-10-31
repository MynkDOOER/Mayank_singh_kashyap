import { useEffect, useRef, useState } from 'react';
import { PROFILE, PROJECTS } from '../data/site';
import './Terminal.css';

/*
 * The contact-section terminal. It opens with a few lines of "history";
 * the blinking prompt is real: click it and type. `help` lists commands.
 */

const INTRO = [
  { cmd: 'whoami', out: ['mayank singh kashyap'] },
  { cmd: 'cat focus.txt', out: ['full-stack web development'] },
  { cmd: 'ls ~/projects', out: ['verdikt  resolverhub  shrink-this  bookipedia  wiseroom'] },
  { cmd: 'cat approach.txt', out: ['use what I know, learn what I don’t'] },
];

const LINKS = {
  github: PROFILE.links.github,
  linkedin: PROFILE.links.linkedin,
  leetcode: PROFILE.links.leetcode,
  resume: PROFILE.links.resume,
};

const COMMANDS = [
  'help', 'whoami', 'about', 'ls', 'projects', 'resume', 'open', 'contact', 'email',
  'sudo', 'date', 'echo', 'play', 'history', 'clear', 'exit',
];

const open = (url) => window.open(url, '_blank', 'noopener');

/* "kernel panic": the page shakes, a crash screen shows, then it "reboots" */
function panic() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (root.classList.contains('is-panic')) return;
  const screen = document.createElement('div');
  screen.className = 'panic';
  screen.setAttribute('role', 'alert');
  screen.innerHTML =
    '<p>[ 13.370000 ] kernel panic - not syncing: <b>rm -rf /</b> attempted by a visitor</p>' +
    '<p>[ 13.370042 ] deleting portfolio… <span>██████████</span> 100%</p>' +
    '<p>[ 13.370099 ] just kidding. restoring from backup…</p>' +
    '<p class="panic__boot">rebooting</p>';
  root.classList.add('is-panic');
  if (reduced) root.classList.add('is-panic-still');
  document.body.appendChild(screen);
  window.setTimeout(() => {
    screen.classList.add('is-out');
    root.classList.remove('is-panic', 'is-panic-still');
    root.classList.add('is-reboot');
    window.setTimeout(() => {
      screen.remove();
      root.classList.remove('is-reboot');
    }, 600);
  }, 2600);
}

function run(raw, history) {
  const input = raw.trim();
  const [cmd = '', ...args] = input.split(/\s+/);
  const arg = args.join(' ');
  const c = cmd.toLowerCase();

  switch (c) {
    case '':
      return { out: [] };
    case 'help':
      return {
        out: [
          'whoami · about · ls · resume · contact',
          'open <github|linkedin|leetcode|resume>',
          'date · echo <text> · history · clear · play',
          'and a couple of things you’re not supposed to type…',
        ],
      };
    case 'whoami':
      return { out: ['mayank singh kashyap'] };
    case 'about':
    case 'cat':
      if (c === 'cat' && !/about|resume|focus|approach/.test(arg)) {
        return { out: [`cat: ${arg || '(nothing)'}: no such file. try \`ls\``], err: true };
      }
      if (/resume/.test(arg)) {
        open(LINKS.resume);
        return { out: ['opening resume in a new tab…'] };
      }
      return { out: [PROFILE.bio[0]] };
    case 'ls':
    case 'projects':
      return { out: [PROJECTS.map((p) => p.id).join('  '), 'about.txt  resume.pdf  approach.txt'] };
    case 'resume':
      open(LINKS.resume);
      return { out: ['opening resume in a new tab…'] };
    case 'open': {
      const key = arg.toLowerCase();
      if (LINKS[key]) {
        open(LINKS[key]);
        return { out: [`opening ${key}…`] };
      }
      return { out: ['usage: open <github|linkedin|leetcode|resume>'], err: true };
    }
    case 'contact':
    case 'email':
      return { out: [PROFILE.email, 'type `sudo hire mayank` to skip the queue'] };
    case 'sudo':
      if (/^hire\s+mayank/i.test(arg)) {
        window.setTimeout(() => {
          window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent('Let’s talk')}`;
        }, 1400);
        return {
          out: ['[sudo] password for recruiter: ********', 'permission granted. opening your email app…'],
          good: true,
        };
      }
      if (/^rm\s+-rf/.test(arg)) {
        panic();
        return { out: ['sudo: well, you asked for it.'], err: true };
      }
      return { out: ['recruiter is not in the sudoers file. this incident will be reported.'], err: true };
    case 'rm':
      if (/^-rf?\s+(\/|\*|~)/.test(arg) || arg === '-rf /') {
        panic();
        return { out: ['you really did that, huh.'], err: true };
      }
      return { out: ['rm: refusing to delete anything today'], err: true };
    case 'date':
      return {
        out: [
          new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          }).format(new Date()) + ' (my time)',
        ],
      };
    case 'echo':
      return { out: [arg || ''] };
    case 'play':
    case 'cube': {
      const btn = document.querySelector('.rk-corner:not(.is-playing)');
      if (!btn) return { out: ['the cube is busy right now'], err: true };
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => btn.click(), 500);
      return { out: ['launching cube dash… (space to jump)'] };
    }
    case 'history':
      return { out: history.length ? history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`) : ['(empty)'] };
    case 'exit':
    case 'quit':
      return { out: ['there is no exit. only the contact form.'] };
    case 'hello':
    case 'hi':
      return { out: ['hey! type `help` to see what I can do'] };
    default:
      return { out: [`command not found: ${cmd}. try \`help\``], err: true };
  }
}

export default function Terminal() {
  const [lines, setLines] = useState(INTRO);
  const [value, setValue] = useState('');
  const [typed, setTyped] = useState([]);
  const [cursor, setCursor] = useState(-1); // position while browsing history with ↑/↓
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  /* keep the newest line in view (scrolls the terminal, not the page) */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = () => {
    const cmd = value;
    setValue('');
    setCursor(-1);
    if (cmd.trim().toLowerCase() === 'clear') {
      setLines([]);
      setTyped((t) => [...t, cmd.trim()]);
      return;
    }
    const nextTyped = cmd.trim() ? [...typed, cmd.trim()] : typed;
    const res = run(cmd, nextTyped);
    setTyped(nextTyped);
    setLines((l) => [...l, { cmd, ...res }]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!typed.length) return;
      const i = cursor < 0 ? typed.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(typed[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor < 0) return;
      const i = cursor + 1;
      if (i >= typed.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(i);
        setValue(typed[i]);
      }
    } else if (e.key === 'Tab') {
      const match = COMMANDS.find((c) => value && c.startsWith(value.toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match + ' ');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className={`term${focused ? ' is-focused' : ''}`}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="term__bar">
        <i /><i /><i />
        <span>mayank@dev: ~</span>
      </div>
      <div className="term__body" ref={bodyRef} aria-live="polite">
        {lines.map((l, i) => (
          <div className="term__line" key={i}>
            <p className="term__cmd">
              <span>$</span> {l.cmd}
            </p>
            {l.out.map((o, j) => (
              <p key={j} className={`term__out${l.err ? ' is-err' : ''}${l.good ? ' is-good' : ''}`}>
                {o}
              </p>
            ))}
          </div>
        ))}
        <label className="term__cmd term__cmd--live">
          <span aria-hidden="true">$</span>
          <input
            ref={inputRef}
            className="term__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal. Type a command and press Enter. Try help."
            style={{ width: `${Math.max(1, value.length) + 1}ch` }}
          />
          {!focused && <b aria-hidden="true" />}
          {!focused && !value && <em className="term__hint">click to type</em>}
        </label>
      </div>
    </div>
  );
}
