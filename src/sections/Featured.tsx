import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Featured() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(1);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;

    if (!section || !bg || !content) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      scrollTl
        .fromTo(bg,
          { scale: 1.10, x: '-6vw', opacity: 0.6 },
          { scale: 1.00, x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(content.querySelector('.day-tabs'),
          { y: '-6vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.featured-title'),
          { x: '-12vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.08
        )
        .fromTo(content.querySelector('.performer-name'),
          { x: '-12vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.12
        )
        .fromTo(content.querySelector('.performer-desc'),
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.15
        )
        .fromTo(content.querySelector('.cta-button'),
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.18
        );

      scrollTl
        .fromTo(content.querySelector('.performer-name'),
          { x: 0, opacity: 1 },
          { x: '-18vw', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo([content.querySelector('.featured-title'), content.querySelector('.performer-desc')],
          { y: 0, opacity: 1 },
          { y: '-6vh', opacity: 0, ease: 'power2.in' },
          0.72
        )
        .fromTo(bg,
          { scale: 1.00, y: 0 },
          { scale: 1.06, y: '-3vh', ease: 'none' },
          0.70
        )
        .fromTo(content.querySelector('.day-tabs'),
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.80
        )
        .fromTo(content.querySelector('.cta-button'),
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.78
        );

    }, section);

    return () => ctx.revert();
  }, []);

  const highlights = {
    1: { name: 'DJ Night', image: '/img/WhatsApp Image 2026-05-07 at 8.37.25 PM.jpeg', genre: 'The Silver Jubilee Pulse', desc: 'Day 1 closes with an electrifying DJ night — "The Silver Jubilee Pulse". Feel the bass, lose yourself in the lights, and dance until the stars come out. This is the celebration of 25 glorious years.' },
    2: { name: 'Grand Valedictory', image: '/img/WhatsApp Image 2026-05-07 at 8.37.35 PM.jpeg', genre: 'MSK Prasad & Rasi Singh', desc: 'The grand finale — prize distribution worth ₹2,50,000 🏆, graced by chief guests MSK Prasad and Rasi Singh. Two days of talent, passion, and unforgettable memories culminate in this spectacular closing ceremony.' }
  };

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-30 flex items-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src={highlights[activeDay as keyof typeof highlights].image}
          alt="Featured Highlight"
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614]/90 via-[#080614]/50 to-[#080614]/70" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full px-[6vw]"
      >
        {/* Day Tabs */}
        <div className="day-tabs flex gap-4 mb-8">
          {[1, 2].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`font-mono text-sm px-4 py-2 transition-all duration-300 ${
                activeDay === day 
                  ? 'text-white border-b-2 border-[#C9A84C] neon-text-glow-gold' 
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {day === 1 ? 'DJ NIGHT' : 'VALEDICTORY'}
            </button>
          ))}
        </div>

        {/* Meta Label */}
        <div className="absolute right-[6vw] top-[12vh] font-mono text-xs text-white/60 uppercase">
          SILVER JUBILEE EDITION
        </div>

        {/* Title */}
        <h2 className="featured-title font-mono text-sm text-[#C9A84C] uppercase tracking-wider mb-4">
          Event Highlights
        </h2>

        {/* Performer Name */}
        <h3 className="performer-name font-display text-subsection text-white mb-2 neon-text-glow-gold">
          {highlights[activeDay as keyof typeof highlights].name}
        </h3>
        
        <p className="text-[#8B0000] font-mono text-sm mb-6">
          {highlights[activeDay as keyof typeof highlights].genre}
        </p>

        {/* Description */}
        <p className="performer-desc text-lg text-white/70 max-w-[38vw] mb-8 leading-relaxed">
          {highlights[activeDay as keyof typeof highlights].desc.split('₹2,50,000').length > 1 ? (
            <>
              {highlights[activeDay as keyof typeof highlights].desc.split('₹2,50,000')[0]}
              <span className="text-[#C9A84C] font-display text-2xl" style={{ textShadow: '0 0 12px rgba(201,168,76,0.5)' }}>₹2,50,000</span>
              {highlights[activeDay as keyof typeof highlights].desc.split('₹2,50,000')[1]}
            </>
          ) : highlights[activeDay as keyof typeof highlights].desc}
        </p>

        {/* CTA */}
        <button 
          className="cta-button btn-primary flex items-center gap-2 group"
          onClick={() => document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' })}
        >
          View full schedule
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
