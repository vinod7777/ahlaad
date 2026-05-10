import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        }
      });

      scrollTl
        .fromTo(bg,
          { scale: 1.08, opacity: 0.7 },
          { scale: 1.00, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(content.querySelector('.live-title'),
          { x: '-18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.live-subtitle'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.10
        )
        .fromTo(content.querySelector('.live-desc'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.13
        )
        .fromTo(content.querySelector('.cta-button'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.16
        );

      scrollTl
        .fromTo(content.querySelector('.live-title'),
          { y: 0, opacity: 1 },
          { y: '-10vh', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo([content.querySelector('.live-subtitle'), content.querySelector('.live-desc'), content.querySelector('.cta-button')],
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.72
        )
        .fromTo(bg,
          { scale: 1.00, x: 0 },
          { scale: 1.06, x: '3vw', ease: 'none' },
          0.70
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-50 flex items-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="img/WhatsApp Image 2026-05-07 at 8.37.27 PM.jpeg"
          alt="Battle of the Bands"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614]/90 via-[#080614]/50 to-[#080614]/70" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full px-[6vw]"
      >
        <div className="absolute right-[6vw] top-[12vh] font-mono text-xs text-white/60 uppercase">
          SILVER JUBILEE EDITION
        </div>

        <h2 className="live-subtitle font-mono text-sm text-[#C9A84C] uppercase tracking-wider mb-4">
          Battle of the Bands
        </h2>

        <h3 className="live-title font-display text-hero text-white mb-6 neon-text-glow-gold">
          ROCK
        </h3>

        <p className="live-desc text-lg text-white/70 max-w-[34vw] mb-8 leading-relaxed">
          15 minutes on stage. Your band. Your sound. No backing tracks, no playback — 
          just raw energy and amplifiers cranked to eleven. Drum kit provided. 
          Bring your instruments, bring your fire.
        </p>

        <button 
          className="cta-button btn-primary flex items-center gap-3 group"
          onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Play className="w-5 h-5" />
          Register your band
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
