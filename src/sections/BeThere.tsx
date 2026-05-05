import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {  Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BeThere() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    const info = infoRef.current;

    if (!section || !bg || !content || !info) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
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
        )
        .fromTo(info,
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'power3.out' },
          0.25
        );

      scrollTl
        .fromTo([content.querySelector('.be-there-title'), content.querySelector('.be-there-subtitle'), content.querySelector('.cta-button'), info],
          { y: 0, opacity: 1 },
          { y: '-8vh', opacity: 0, ease: 'power2.in' },
          0.80
        )
        .fromTo(bg,
          { scale: 1.00 },
          { scale: 1.07, ease: 'none' },
          0.80
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

        <div className="be-there-title mb-12 pt-8">
          <img src="/ahlaad.png" alt="Ahlaad" className="h-[clamp(45px,8vw,120px)] w-auto object-contain mx-auto" style={{ filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.8)) drop-shadow(0 0 50px rgba(201,168,76,0.4))' }} />
        </div>

        {/* MASSIVE Chief Guest Highlight */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-8 group">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-[6px] border-[#C9A84C] p-2 transition-all duration-700 group-hover:scale-105"
              style={{ 
                boxShadow: '0 0 60px rgba(201,168,76,0.4), 0 30px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.6)',
                background: 'linear-gradient(135deg, #C9A84C, #8B0000, #C9A84C)'
              }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0d0b1e]">
                <img src="/rashi-singh.jpg" alt="Rashi Singh" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-[#C9A84C] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.5)] border-4 border-[#080614] animate-pulse">
              <Star className="w-7 h-7 text-[#080614]" fill="currentColor" />
            </div>
          </div>
          
          <div className="text-center">
            <p className="font-mono text-xs text-[#C9A84C] uppercase tracking-[0.5em] mb-3">Special Guest Appearance</p>
            <h3 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-none mb-4 neon-text-glow-gold">
              Ms. Rashi <span className="text-gradient-gold">Singh</span>
            </h3>
            <p className="text-white/70 text-xl md:text-2xl italic font-medium">"The Star of Ahlaad 2K26"</p>
          </div>
        </div>

   
      </div>
    </section>
  );
}
