import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';


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
          src="/img/WhatsApp Image 2026-05-07 at 8.37.26 PM.jpeg"
          alt="Ahlaad 2K26 Hero"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614]/95 via-[#080614]/50 to-[#080614]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080614] via-transparent to-transparent" />

        {/* Ambient Gold Neon Orbs */}
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[30%] w-[500px] h-[500px] bg-[#C9A84C]/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content - Two Column Layout */}
      <div className="relative z-10 w-full px-[6vw] pt-[12vh] md:pt-[14vh]">
        {/* Meta Label */}

        <div className="flex items-center flex-col gap-4 mt-20 lg:gap-12">
          {/* LEFT COLUMN - Main Info */}
          <div className="flex flex-col items-center justify-center flex-1">
            {/* AITAM Logo */}
            <div className='flex '>
              <img src="/25years.png" alt="25years" className="h-20 md:h-32 w-auto object-contain rounded-[10px] " style={{ filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.3))' }} />

            </div>
            {/* Main Title */}
            <h1
              ref={titleRef}
              className="font-display text-hero text-white leading-none mb-3 flex flex-wrap items-end gap-2 md:gap-4"
            >
              <div className="relative group">
                <img
                  src="/ahlaad.png"
                  alt="Ahlaad"
                  className="h-[0.8em] w-auto object-contain transition-all duration-700"
                  style={{
                    filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.8)) drop-shadow(0 0 50px rgba(201,168,76,0.4))'
                  }}
                />
                <div className="absolute inset-0 bg-[#C9A84C]/20 blur-3xl rounded-full scale-50 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-white text-[0.6em] font-bold relative top-2 neon-text-glow-gold" style={{ textShadow: '0 0 20px rgba(201,168,76,0.8), 0 0 40px rgba(201,168,76,0.4)' }}>2K26</span>
            </h1>

            {/* Accent Underline */}
            <div
              ref={underlineRef}
              className="w-32 md:w-[28vw] h-[6px] bg-gradient-to-r from-[#C9A84C] via-[#8B0000] to-[#1a237e] mb-4 neon-glow-gold"
            />

            {/* Subtitle / Tagline */}
            <p
              ref={subtitleRef}
              className="text-lg md:text-2xl text-[#C9A84C] max-w-full md:max-w-[34vw] mb-4 leading-relaxed font-bold italic drop-shadow-lg"
            >
              "Unleash Your Talent. Own the Stage."
            </p>


            {/* Event Info */}
            <div className="flex flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <Calendar className="w-5 h-5" />
                <span className="font-mono text-sm">June 26 & 27, 2K26</span>
              </div>
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <MapPin className="w-5 h-5" />
                <span className="font-mono text-sm font-bold uppercase">AITAM Campus, Tekkali</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div ref={countdownRef} className="mb-6">
              <p className="font-mono text-xs text-[#C9A84C] uppercase tracking-wider mb-3 font-bold">
                Event Starts In
              </p>
              <CountdownTimer />
            </div>
          </div>

          {/* RIGHT COLUMN - Prize Pool Highlight */}
          <div ref={logoRef} className="hidden lg:flex flex-col items-center justify-center w-[38vw]">
            <div className="relative text-center p-10 rounded-2xl" style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }}>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl" />




            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
