import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ReactLenis } from 'lenis/react';
import { motion, useScroll, useSpring } from 'framer-motion';

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
import OrganiserBody from './sections/OrganiserBody';
import Closing from './sections/Closing';
import Contact from './sections/Contact';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import CheckIn from './pages/CheckIn';
import { SplashCursor } from './pages/splash-cursor';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <Helmet>
        <title>Ahlaad 2K26 | The Ultimate Cultural Festival</title>
        <meta name="description" content="Join us for Ahlaad 2K26, an epic cultural festival with thrilling competitions, spectacular live performances, and a ₹2,50,000 prize pool. Don't miss out!" />
        <meta name="keywords" content="Ahlaad, Cultural Fest, College Festival, Music, Dance, Competitions, Prizes, Tech Fest" />
        <meta property="og:title" content="Ahlaad 2K26 | The Ultimate Cultural Festival" />
        <meta property="og:description" content="Experience the biggest cultural festival with a ₹2,50,000 prize pool across 9 competitions!" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Framer Motion Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF0080] to-[#BF00FF] origin-left z-[10000]" 
        style={{ scaleX }} 
      />
      
      <Navigation />
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
        <OrganiserBody />
        <Closing />
        <Contact />
      </main>
    </>
  );
}

function GlobalEffects() {
  const location = useLocation();
  const disabledPaths = ['/admin', '/dashboard', '/checkin'];
  if (disabledPaths.includes(location.pathname)) return null;
  return <SplashCursor />;
}

function App() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <HelmetProvider>
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
        <Router>
          <GlobalEffects />
          <div className="relative bg-[#080614] min-h-screen">
            <div className="noise-overlay" />
            
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </ReactLenis>
    </HelmetProvider>
  );
}

export default App;
