export const PROFILE = {
  name: 'Mayank Singh Kashyap',
  short: 'Mayank',
  role: 'Full-stack developer',
  year: '3rd-year CS student',
  bio: [
    'I’m a third-year computer science student and full-stack developer, working mostly in JavaScript — React, Node.js, Express and MongoDB.',
    'I like the parts of an app people don’t see: how data is modelled, how access is controlled, and APIs that hold up. When a problem needs something I don’t know yet, I learn it.',
  ],
  location: 'India',
  email: 'mayank.sd2005@gmail.com',
  links: {
    github: 'https://github.com/MynkDOOER',
    leetcode: 'https://leetcode.com/u/baddSp8jf1/',
    linkedin: 'https://www.linkedin.com/in/mayank-rooted/',
  },
};

export const DETAILS = [
  { label: 'Studying', value: 'Computer Science, 3rd year' },
  { label: 'Based in', value: 'India' },
  { label: 'Focus', value: 'Full-stack web development' },
  { label: 'Learning', value: 'WebSockets, embeddings, RAG' },
  { label: 'Practising', value: 'Data structures & algorithms' },
];

export const PROJECTS = [
  {
    id: 'verdikt',
    index: '01',
    name: 'Verdikt',
    kind: 'Hackathon project',
    year: '2026',
    color: 'blue',
    detail: 'A self-hosted platform for running hackathons, built for DOGFOOD 2026 — team sign-ups, submissions, and blind judging against weighted rubrics, all from a single docker compose up.',
    stack: ['React 18', 'Vite', 'Node.js 22', 'Express', 'MongoDB 7', 'Docker', 'nginx'],
    repo: 'https://github.com/Dogfood-Hackathon-Team-ByteMe/Verdikt',
  },
  {
    id: 'resolverhub',
    index: '02',
    name: 'ResolverHub',
    kind: 'Web platform',
    year: '2025',
    color: 'red',
    detail: 'A bug tracker for software teams, with role-based permissions for admins, project leads, developers and testers.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'Express 5', 'Mongoose', 'MongoDB'],
    repo: 'https://github.com/HarshitManocha/ResolverHub',
  },
  {
    id: 'shrink-this',
    index: '03',
    name: 'Shrink-This',
    kind: 'Full-stack app',
    year: '2025',
    color: 'yellow',
    detail: 'A URL shortener that turns long links into short ones and generates a QR code for each.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Tailwind', 'nanoid', 'Vite'],
    repo: 'https://github.com/MynkDOOER/Shrink-This',
  },
  {
    id: 'bookipedia',
    index: '04',
    name: 'Bookipedia',
    kind: 'Web app',
    year: '2025',
    color: 'green',
    detail: 'A book search app: look up books by title or keyword, see the details, and save favourites.',
    stack: ['React', 'React Router', 'REST API', 'CSS'],
    repo: 'https://github.com/MynkDOOER/Bookipedia',
  },
  {
    id: 'wiseroom',
    index: '05',
    name: 'WiseRoom',
    kind: 'In development',
    year: '2026',
    color: 'blue',
    wip: true,
    detail: 'A multi-user chat room with a RAG pipeline. Currently in development.',
    stack: ['Node.js', 'WebSockets', 'RAG'],
    repo: 'https://github.com/MynkDOOER/WiseRoom',
  },
];

/* Ordered bottom → top: the tower is built from the foundation up. */
export const SKILLS = [
  { group: 'Tools', color: 'green', items: ['Git', 'GitHub', 'npm', 'Postman', 'VS Code'] },
  { group: 'Database', color: 'yellow', items: ['MongoDB', 'Mongoose', 'Schema design'] },
  { group: 'Back end', color: 'red', items: ['Node.js', 'Express', 'REST APIs', 'Auth & roles', 'WebSockets'] },
  { group: 'Front end', color: 'blue', items: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite', 'React Router'] },
  { group: 'Learning', color: 'ghost', items: ['RAG', 'Embeddings', 'Vector search', 'DSA'] },
];


export const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' },
];
