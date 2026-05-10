import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Tickets from './sections/Tickets';
import BeThere from './sections/BeThere';
import Schedule from './sections/Schedule';
import Unforgettable from './sections/Unforgettable';
import Registration from './sections/Registration';
import OrganiserBody from './sections/OrganiserBody';
import Closing from './sections/Closing';
import Contact from './sections/Contact';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import CheckIn from './pages/CheckIn';
import { SplashCursor } from './pages/splash-cursor';

import NotFound from './pages/NotFound';
import PassScanner from './pages/PassScanner';

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

        <Tickets />
        <BeThere />
        <Schedule />
        <Unforgettable />
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
  const disabledPaths = ['/admin', '/dashboard', '/checkin', '/scan-pass'];
  if (disabledPaths.includes(location.pathname)) return null;
  return <SplashCursor />;
}

import { NotificationProvider } from './components/Notification';

const getBasename = () => {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  // Known top-level routes
  const knownRoutes = ['login', 'dashboard', 'admin', 'checkin', 'scan-pass'];
  
  // If we have at least 2 segments and the first one is not a known route,
  // the first segment is the subdirectory.
  if (segments.length >= 2 && !knownRoutes.includes(segments[0])) {
    return `/${segments[0]}`;
  }
  
  // If we have 1 segment:
  // If it is a known route, then the basename is '/' (hosted at root)
  // If it is NOT a known route (e.g. visiting '/dist/'), then the pathname ends with a slash,
  // and segments.length is 1. In this case, the basename is '/dist'.
  if (segments.length === 1 && !knownRoutes.includes(segments[0])) {
    if (pathname.endsWith('/')) {
      return `/${segments[0]}`;
    }
  }
  
  return '/';
};

function App() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <HelmetProvider>
      <NotificationProvider>
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
          <Router basename={getBasename()}>
            <GlobalEffects />
            <div className="relative bg-[#080614] min-h-screen">
              <div className="noise-overlay" />

              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/checkin" element={<CheckIn />} />
                <Route path="/scan-pass" element={<PassScanner />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </ReactLenis>
      </NotificationProvider>
    </HelmetProvider>
  );
}

export default App;
