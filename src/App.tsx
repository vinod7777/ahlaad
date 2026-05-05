import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Featured from './sections/Featured';
import Lineup from './sections/Lineup';
import LiveExperience from './sections/LiveExperience';
import Tickets from './sections/Tickets';
import BeThere from './sections/BeThere';
import Schedule from './sections/Schedule';
import Unforgettable from './sections/Unforgettable';
import Gallery from './sections/Gallery';
import Registration from './sections/Registration';
import Closing from './sections/Closing';
import Contact from './sections/Contact';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Clean up ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#080614] min-h-screen">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative">
        <Hero />
        <About />
        <Featured />
        <Lineup />
        <LiveExperience />
        <Tickets />
        <BeThere />
        <Schedule />
        <Unforgettable />
        <Gallery />
        <Registration />
        <Closing />
        <Contact />
      </main>
    </div>
  );
}

export default App;
