import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BeThere() {
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
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      scrollTl
        .fromTo(bg,
          { scale: 1.10, opacity: 0.6 },
          { scale: 1.00, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(content.querySelector('.be-there-title'),
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.be-there-subtitle'),
          { y: '6vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.12
        )
        .fromTo(content.querySelector('.cta-button'),
          { y: '6vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.15
        );

      scrollTl
        .fromTo([content.querySelector('.be-there-title'), content.querySelector('.be-there-subtitle'), content.querySelector('.cta-button')],
          { y: 0, opacity: 1 },
          { y: '-8vh', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo(bg,
          { scale: 1.00 },
          { scale: 1.07, ease: 'none' },
          0.70
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-[70] flex items-center justify-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/crowd_colorful.jpg"
          alt="AITAM Ahlaad Crowd"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#080614]/70" />
        <div className="absolute inset-0 bg-gradient-radial from-[#080614]/40 via-[#080614]/70 to-[#080614]/95" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 text-center px-[6vw]"
      >
        <div className="font-mono text-sm text-[#C9A84C] uppercase tracking-widest mb-4">
          JUNE 26–27, 2K26
        </div>

        <div className="be-there-title mb-6">
          <img src="/ahlaad.png" alt="Ahlaad" className="h-[clamp(64px,11vw,170px)] w-auto object-contain mx-auto" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.9)) drop-shadow(0 0 40px rgba(201,168,76,0.6)) drop-shadow(0 0 80px rgba(201,168,76,0.3))' }} />
        </div>

        <p className="be-there-subtitle text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto font-medium" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)' }}>
          Two days. Nine competitions. <span className="text-[#C9A84C] font-display text-3xl" style={{ textShadow: '0 0 15px rgba(201,168,76,0.6)' }}>₹2,50,000</span> prize pool.<br />
          <span className="text-[#C9A84C] font-bold" style={{ textShadow: '0 0 15px rgba(201,168,76,0.8), 0 2px 10px rgba(0,0,0,0.9)' }}>25 years of excellence — one grand celebration.</span>
        </p>

        <button 
          className="cta-button btn-primary inline-flex items-center gap-2 group"
          onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Register Now
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
