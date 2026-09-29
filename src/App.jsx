import { useState } from 'react';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useReveal } from './hooks/useReveal';
import './App.css';

export default function App() {
  /* the intro plays once per browser session, not on every reload */
  const [ready, setReady] = useState(() => {
    try {
      return sessionStorage.getItem('intro-seen') === '1';
    } catch {
      return false;
    }
  });
  const finishIntro = () => {
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage blocked: the intro simply plays again next time */
    }
    setReady(true);
  };
  useReveal();

  return (
    <>
      {!ready && <Preloader onDone={finishIntro} />}
      <Cursor />

      <a className="skip" href="#work">Skip to work</a>

      <div className={`shell${ready ? ' shell--in' : ''}`}>
        <Nav />
        <main>
          <Hero />
          <Projects />
          <About />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
