import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, MapPin, Trophy } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const underline = underlineRef.current;
    const cta = ctaRef.current;
    const countdown = countdownRef.current;
    const meta = metaRef.current;
    const logo = logoRef.current;

    if (!section || !bg || !title || !subtitle || !underline || !cta || !countdown || !meta || !logo) return;

    const ctx = gsap.context(() => {
      // Initial state (hidden)
      gsap.set([logo, title, subtitle, cta, countdown, meta], { opacity: 0, y: 40 });
      gsap.set(underline, { opacity: 0, scaleX: 0, transformOrigin: 'left' });
      gsap.set(bg, { opacity: 0, scale: 1.06 });

      // Auto-play entrance animation
      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.to(bg, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' })
        .to(logo, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
        .to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
        .to(underline, { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .to(countdown, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .to(cta, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .to(meta, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.5');

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            gsap.to([logo, title, subtitle, cta, countdown, meta], { opacity: 1, x: 0, y: 0, duration: 0.3 });
            gsap.to(underline, { opacity: 1, x: 0, duration: 0.3 });
            gsap.to(bg, { scale: 1, x: 0, duration: 0.3 });
          }
        }
      });

      // Exit phase (70% - 100%)
      scrollTl
        .fromTo([logo, title], 
          { x: 0, opacity: 1 }, 
          { x: '-18vw', opacity: 0, ease: 'power2.in' }, 
          0.7
        )
        .fromTo(underline, 
          { x: 0, opacity: 1 }, 
          { x: '-22vw', opacity: 0, ease: 'power2.in' }, 
          0.72
        )
        .fromTo([subtitle, cta, countdown], 
          { y: 0, opacity: 1 }, 
          { y: '10vh', opacity: 0, ease: 'power2.in' }, 
          0.75
        )
        .fromTo(bg, 
          { scale: 1, x: 0 }, 
          { scale: 1.08, x: '4vw', ease: 'none' }, 
          0.7
        )
        .fromTo(meta,
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.8
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="section-pinned z-10 flex items-center"
    >
      {/* Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/hero_colorful.jpg" 
          alt="Ahlaad 2026 Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614]/90 via-[#080614]/50 to-[#080614]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080614] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-[6vw] pt-[14vh]">
        {/* Meta Label */}
        <div 
          ref={metaRef}
          className="absolute right-[6vw] top-[14vh] font-mono text-xs text-white/60 uppercase"
        >
          SILVER JUBILEE EDITION
        </div>

        {/* Silver Jubilee Logo */}
        <div ref={logoRef} className="mb-6">
          <SilverJubileeLogo size={100} />
        </div>

        {/* Main Title */}
        <h1 
          ref={titleRef}
          className="font-display text-hero text-white leading-none mb-4"
        >
          <span className="text-gradient-gold">Ahlaad</span> <span className="text-white/40 text-[0.5em]">2026</span>
        </h1>

        {/* Accent Underline */}
        <div 
          ref={underlineRef}
          className="w-[34vw] h-[6px] bg-gradient-to-r from-[#C9A84C] via-[#8B0000] to-[#1a237e] mb-6 neon-glow-gold"
        />

        {/* Subtitle / Tagline */}
        <p 
          ref={subtitleRef}
          className="text-lg md:text-2xl text-white/80 max-w-[38vw] mb-6 leading-relaxed font-light italic"
        >
          "Unleash Your Talent. Own the Stage."
        </p>

        {/* Event Info */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <Calendar className="w-5 h-5" />
            <span className="font-mono text-sm">June 26 & 27, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-[#E8E8E8]">
            <MapPin className="w-5 h-5" />
            <span className="font-mono text-sm">AITAM Campus, Tekkali</span>
          </div>
          <div className="flex items-center gap-2 text-[#39FF14]">
            <Trophy className="w-5 h-5" />
            <span className="font-display text-lg text-[#39FF14]" style={{ textShadow: '0 0 12px rgba(57,255,20,0.5)' }}>₹2,50,000</span> <span className="font-mono text-sm">Prize Pool</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div ref={countdownRef} className="mb-8">
          <p className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3">
            Event Starts In
          </p>
          <CountdownTimer />
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap gap-4">
          <button 
            className="btn-primary flex items-center gap-2 group"
            onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Register Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            className="btn-outline flex items-center gap-2 group"
            onClick={() => document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Schedule
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
