# Mayank Singh Kashyap — Portfolio

A cube-themed developer portfolio. React + Vite, zero UI libraries, no animation
dependencies — every cube on the page is hand-built CSS 3D or canvas.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## What is where

| Path | What it does |
| --- | --- |
| `src/data/site.js` | **All content.** Projects, skills, journey, links. Edit here first. |
| `src/styles/global.css` | Design tokens (colours, type, shadows) and shared primitives. |
| `src/components/RubikCube.jsx` | A real, working 3x3 cube — 26 cubies, quarter-turn layer rotation, drag to orbit. |
| `src/components/CubeField.jsx` | Canvas field of drifting isometric cubes behind the page. |
| `src/components/Cursor.jsx` | Tumbling cube cursor (desktop, fine pointer only). |
| `src/components/Projects.jsx` | Each project is a 4-face cube: overview, stack, highlights, credits. |
| `src/components/Skills.jsx` | Skill wall — each block turns over on hover/focus. |

## The cube engine, briefly

`RubikCube.jsx` keeps every cubie as a position vector and a 3x3 orientation
matrix. A quarter turn applies the *same* rotation matrix CSS uses for
`rotateX/Y/Z`, so the state committed after the animation always agrees with what
was rendered during it. Orientation is emitted as `matrix3d()` in column-major
order.

## Accessibility & performance

- Every animation respects `prefers-reduced-motion`.
- The canvas pauses when the tab is hidden and caps DPR at 2.
- Cube cursor is disabled on touch/coarse pointers; the native cursor stays.
- Skill blocks are focusable and turn on `:focus-visible`, not just hover.

## Deploying

Static output. `npm run build`, then drop `dist/` on Vercel, Netlify or GitHub
Pages. No server, no env vars.
