import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './sections/Login';
import OrganiserBody from './sections/OrganiserBody';
import Closing from './sections/Closing';
import Contact from './sections/Contact';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  return (
    <>
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
        <Login />
        <OrganiserBody />
        <Closing />
        <Contact />
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <Router>
      <div className="relative bg-[#080614] min-h-screen">
        <div className="noise-overlay" />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
