import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Music, Users, Sparkles, Trophy, Calendar, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const images = imagesRef.current;

    if (!section || !text || !images) return;

    const ctx = gsap.context(() => {
      // Text animation
      gsap.fromTo(text,
        { x: '-8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.5,
          }
        }
      );

      // Images animation
      const backImg = images.querySelector('.back-image');
      const frontImg = images.querySelector('.front-image');
      const caption = images.querySelector('.image-caption');

      gsap.fromTo(backImg,
        { y: '10vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 35%',
            scrub: 0.5,
          }
        }
      );

      gsap.fromTo(frontImg,
        { y: '18vh', opacity: 0, rotate: -6 },
        {
          y: 0,
          opacity: 1,
          rotate: -2,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.5,
          }
        }
      );

      gsap.fromTo(caption,
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 0.5,
          }
        }
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about"
      className="section-flowing bg-[#080614] py-[10vh] z-20"
    >
      <div className="w-full px-[6vw]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {/* Left Column - Text */}
          <div ref={textRef} className="lg:w-[45vw] flex flex-col justify-center">
            <h2 className="font-display text-section text-white mb-6">
              25 Years.<br />
              <span className="text-gradient-gold">One Grand Celebration.</span>
            </h2>
            
            <div className="space-y-4 text-white/70 text-lg leading-relaxed mb-8">
              <p>
                <strong className="text-white">Ahlaad 2K26</strong> is the flagship cultural festival of 
                Aditya Institute of Technology and Management (AITAM), organized by the Student Activity Centre (SAC). 
                This edition marks our <strong className="text-[#C9A84C]">Silver Jubilee Year</strong> — 
                celebrating 25 years of academic excellence. The festival transforms the campus into a vibrant space 
                where tradition and modern creativity blend seamlessly through dance, music, theatre, fine arts, and more.
              </p>
              <p className="text-[#C9A84C] font-display text-xl italic">
                "Unleash Your Talent. Own the Stage."
              </p>
              <p>
                With a <strong className="text-[#C9A84C] font-display text-2xl" style={{ textShadow: '0 0 15px rgba(201,168,76,0.5)' }}>₹2,50,000</strong> prize pool, 9 thrilling competitions, 
                live DJ night, and the grand valedictory graced by chief guests 
                <strong className="text-gradient-gold font-display text-xl tracking-wide"> MSK Prasad</strong> & <strong className="text-gradient-gold font-display text-xl tracking-wide">Rasi Singh</strong>, 
                Ahlaad 2K26 is set to be the biggest cultural extravaganza in our history.
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-lg border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 transition-colors">
                <Calendar className="w-5 h-5 text-[#C9A84C]" />
                <span className="text-white text-sm">2 Days of Events</span>
              </div>
              <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-lg border border-[#FF0080]/30 hover:border-[#FF0080]/60 transition-colors">
                <Music className="w-5 h-5 text-[#FF0080]" />
                <span className="text-white text-sm">9 Competitions</span>
              </div>
              <div className="flex items-center gap-3 glass-card px-5 py-4 rounded-lg border-2 border-[#C9A84C]/40 hover:border-[#C9A84C]/70 transition-colors" style={{ boxShadow: '0 0 20px rgba(201,168,76,0.15)' }}>
                <Trophy className="w-6 h-6 text-[#C9A84C]" />
                <span className="text-[#C9A84C] font-display text-xl" style={{ textShadow: '0 0 10px rgba(201,168,76,0.4)' }}>₹2,50,000 Prize Pool</span>
              </div>
              <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-lg border border-[#00FFFF]/30 hover:border-[#00FFFF]/60 transition-colors">
                <Star className="w-5 h-5 text-[#00FFFF]" />
                <span className="text-white text-sm">DJ Night + Valedictory</span>
              </div>
              <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-lg border border-[#BF00FF]/30 hover:border-[#BF00FF]/60 transition-colors">
                <Users className="w-5 h-5 text-[#BF00FF]" />
                <span className="text-white text-sm">Open to All UG/PG</span>
              </div>
              <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-lg border border-[#FF5E00]/30 hover:border-[#FF5E00]/60 transition-colors">
                <Sparkles className="w-5 h-5 text-[#FF5E00]" />
                <span className="text-white text-sm"><span className="text-gradient-gold font-semibold">MSK Prasad</span> & <span className="text-gradient-gold font-semibold">Rasi Singh</span></span>
              </div>
            </div>

            <button 
              className="flex items-center gap-2 text-[#C9A84C] font-medium hover:gap-3 transition-all w-fit group"
              onClick={() => document.querySelector('#competitions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore competitions
              <ArrowRight className="w-4 h-4 group-hover:text-[#FF0080] transition-colors" />
            </button>
          </div>

          {/* Right Column - Image Stack */}
          <div ref={imagesRef} className="lg:w-[45vw] relative h-[60vh] lg:h-[80vh]">
            {/* Back Image */}
            <div className="back-image absolute top-0 right-0 w-[80%] h-[70%] rounded-xl overflow-hidden shadow-2xl border border-[#C9A84C]/20">
              <img 
                src="/about_colorful.jpg" 
                alt="AITAM Cultural Fest highlights"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Front Image */}
            <div className="front-image absolute bottom-[10%] left-0 w-[55%] h-[45%] rounded-xl overflow-hidden shadow-2xl border border-[#8B0000]/30">
              <img 
                src="/about_piano.jpg" 
                alt="Performance at AITAM"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Caption Tag */}
            <div className="image-caption absolute bottom-[5%] right-[15%] glass-neon px-4 py-2 rounded-full">
              <span className="font-mono text-xs text-[#C9A84C] uppercase tracking-wider">
                Silver Jubilee — Estd. 2001
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
