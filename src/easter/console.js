import { PROFILE } from '../data/site';

/*
 * Easter egg for anyone who opens DevTools: a small Rubik's cube drawn in the
 * console, and a `mayank` object with a few commands.
 */

const STICKERS = [
  ['#FFD12E', '#2743E3', '#E8452C'],
  ['#1FA34A', '#F2F0E8', '#FF8A1F'],
  ['#E8452C', '#FFD12E', '#2743E3'],
];

const sticker = (c) =>
  `background:${c};color:${c};border:1px solid #111;border-radius:3px;padding:2px 9px;margin:1px;font-size:11px;`;
const text = 'font-family:ui-monospace,monospace;font-size:12px;color:#888;';
const bold = 'font-family:ui-monospace,monospace;font-size:13px;font-weight:700;color:#FFD12E;';
const code = 'font-family:ui-monospace,monospace;font-size:12px;color:#6FD98F;background:#111;padding:2px 6px;border-radius:3px;';

function drawCube() {
  for (const row of STICKERS) {
    console.log(row.map(() => '%c■').join(' '), ...row.map(sticker));
  }
}

const api = {
  hire() {
    console.log('%c→ POST /api/hire', code);
    console.log('%c✓ 201 Created. Request received.', bold);
    console.log(`%cEmail   ${PROFILE.email}\nResume  ${PROFILE.links.resume}\nGitHub  ${PROFILE.links.github}`, text);
    console.log('%c(Seriously though, I’d love to hear from you.)', text);
    return 'hire request sent';
  },
  resume() {
    window.open(PROFILE.links.resume, '_blank', 'noopener');
    return 'opening resume…';
  },
  email() {
    window.location.href = `mailto:${PROFILE.email}`;
    return PROFILE.email;
  },
  help() {
    console.log('%cmayank.hire()    %c send me a hire request', code, text);
    console.log('%cmayank.resume()  %c open my resume', code, text);
    console.log('%cmayank.email()   %c write me an email', code, text);
    return 'happy hacking';
  },
};

export function installConsoleEasterEgg() {
  if (typeof window === 'undefined' || window.mayank) return;
  window.mayank = api;

  drawCube();
  console.log('%cHey, you opened the console.', bold);
  console.log('%cYou might be my kind of person. This site is hand-built with React and a lot of CSS 3D.', text);
  console.log('%cTry:  %cmayank.hire()', text, code);
  console.log('%c(or mayank.help() for more)', text);
}
