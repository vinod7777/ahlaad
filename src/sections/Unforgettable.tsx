import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Unforgettable() {
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
        .fromTo(content.querySelector('.unforgettable-title'),
          { x: '-18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.unforgettable-subtitle'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.10
        )
        .fromTo(content.querySelector('.unforgettable-desc'),
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
        .fromTo(content.querySelector('.unforgettable-title'),
          { y: 0, opacity: 1 },
          { y: '-10vh', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo([content.querySelector('.unforgettable-subtitle'), content.querySelector('.unforgettable-desc'), content.querySelector('.cta-button')],
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.72
        )
        .fromTo(bg,
          { scale: 1.00 },
          { scale: 1.06, ease: 'none' },
          0.70
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-[90] flex items-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/duo_colorful.jpg"
          alt="Dance at Ahlaad"
          className="w-full h-full object-cover"
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

        <h2 className="unforgettable-subtitle font-mono text-sm text-[#C9A84C] uppercase tracking-wider mb-4">
          Dance Competitions
        </h2>

        <h3 className="unforgettable-title font-display text-hero text-white mb-6 neon-text-glow-gold">
          DANCE
        </h3>

        <p className="unforgettable-desc text-lg text-white/70 max-w-[34vw] mb-8 leading-relaxed">
          Classical meets contemporary. Solo or group — own the dance arena. 
          Solo: 3-4 minutes. Group: 5-8 minutes. Submit your tracks 2 hours 
          prior in .mp3 format. Classical & Western categories available.
        </p>

        <button 
          className="cta-button btn-primary flex items-center gap-2 group"
          onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Register for Dance
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
