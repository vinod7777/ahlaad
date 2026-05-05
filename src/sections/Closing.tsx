import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const reasons = [
  { icon: Trophy, label: '₹2,50,000', desc: 'Total Prize Pool' },
  { icon: Users, label: '9+', desc: 'Competitions' },
  { icon: Sparkles, label: '25 Years', desc: 'Of Excellence' },
];

export default function Closing() {
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
        .fromTo(content.querySelector('.closing-title'),
          { x: '-12vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.closing-subtitle'),
          { y: '6vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.10
        )
        .fromTo(content.querySelector('.closing-stats'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.14
        );

      scrollTl
        .fromTo([content.querySelector('.closing-title'), content.querySelector('.closing-subtitle'), content.querySelector('.closing-stats')],
          { y: 0, opacity: 1 },
          { y: '-6vh', opacity: 0, ease: 'power2.in' },
          0.70
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
      className="section-pinned z-[110] flex items-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/group_colorful.jpg"
          alt="AITAM Group"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614]/90 via-[#080614]/60 to-[#080614]/80" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full px-[6vw]"
      >
        <div className="absolute right-[6vw] top-[12vh] font-mono text-xs text-white/60 uppercase">
          SILVER JUBILEE EDITION
        </div>

        <h2 className="closing-title font-mono text-sm text-[#C9A84C] uppercase tracking-wider mb-4">
          Why Participate?
        </h2>

        <h3 className="closing-subtitle font-display text-subsection text-white mb-6 max-w-[55vw]" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
          This isn't just a fest. It's <span className="text-gradient-gold">25 years</span> of legacy, talent, and celebration — all on one stage.
        </h3>

        <p className="closing-subtitle text-lg text-white/70 max-w-[38vw] mb-10 leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Compete. Perform. Create. Win big. Whether you're a filmmaker, singer, dancer, or artist — Ahlaad 2026 is your stage to shine.
        </p>

        {/* Stats + CTA */}
        <div className="closing-stats flex flex-col sm:flex-row items-start gap-8">
          <div className="flex gap-6">
            {reasons.map((r, i) => (
              <div key={i} className="glass-card px-5 py-4 rounded-xl border border-[#C9A84C]/20 text-center hover:border-[#C9A84C]/50 transition-colors">
                <r.icon className="w-5 h-5 text-[#C9A84C] mx-auto mb-2" />
                <div className="font-display text-2xl text-white">{r.label}</div>
                <div className="text-white/50 text-xs font-mono uppercase tracking-wider">{r.desc}</div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary flex items-center gap-2 group self-center"
          >
            Register Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
