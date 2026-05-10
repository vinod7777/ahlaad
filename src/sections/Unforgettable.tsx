import { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronLeft, ChevronRight, Film, Guitar, Camera, Mic, Music, PersonStanding, Drama, Palette, Scissors } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const events = [
  {
    name: 'Short Films',
    category: 'FILMMAKING',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.26 PM.jpeg',
    color: '#FF0080',
    icon: Film,
    desc: 'Max 10 min duration. Content must be 100% original. Films can be in any genre — drama, comedy, thriller, documentary. Submit in MP4/AVI format.',
    fee: '₹500/team',
  },
  {
    name: 'Rock Band',
    category: 'LIVE MUSIC',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.35 PM.jpeg',
    color: '#00FFFF',
    icon: Guitar,
    desc: '15 min performance including sound check. Covers or originals allowed. Drum kit provided by institute. Bring your own guitars, bass & processors.',
    fee: '₹500/band',
  },
  {
    name: 'Photography',
    category: 'VISUAL ARTS',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.30 PM.jpeg',
    color: '#BF00FF',
    icon: Camera,
    desc: 'On-spot theme-based. 2 hours from theme announcement. Only basic editing (crop/color) allowed. No AI-generated images. Submit in JPEG/RAW.',
    fee: '₹200/person',
  },
  {
    name: 'Singing',
    category: 'SOLO VOCALS',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.29 PM.jpeg',
    color: '#C9A84C',
    icon: Mic,
    desc: '4 min performance. One acoustic instrument or backing track allowed (no lead vocals in track). Any language. Judged on vocal range, pitch & expression.',
    fee: '₹200/person',
  },
  {
    name: 'Cover Song',
    category: 'MUSIC',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.25 PM.jpeg',
    color: '#FF5E00',
    icon: Music,
    desc: '4 min limit. Reimagine any hit song — make it your own! One instrument or backing track allowed. Judged on improvisation, soul & creativity.',
    fee: '₹200/person',
  },
  {
    name: 'Dance',
    category: 'DANCE COMPETITIONS',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.28 PM (1).jpeg',
    color: '#39FF14',
    icon: PersonStanding,
    desc: 'Classical & Western categories. Solo (3-4 min) & Group (5-8 min, 4-12 members). Submit tracks 2 hours prior in .mp3 format on pendrive.',
    fee: '₹200 / ₹500',
  },
  {
    name: 'Drama / Skit',
    category: 'STAGE PERFORMANCE',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.25 PM (1).jpeg',
    color: '#0080FF',
    icon: Drama,
    desc: 'Max 15 min stage play. Any language. Props allowed but must be cleared after performance. No vulgarity or political content. Team event.',
    fee: '₹500/team',
  },
  {
    name: 'Painting',
    category: 'FINE ARTS',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.35 PM (1).jpeg',
    color: '#FF0080',
    icon: Palette,
    desc: 'On-spot theme-based. 2 hours. All materials (canvas, colors, brushes) must be brought by participants. Any medium — watercolor, acrylic, oil, charcoal.',
    fee: '₹200/person',
  },
  {
    name: 'Handicrafts',
    category: 'CREATIVE ARTS',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.33 PM (1).jpeg',
    color: '#00FFFF',
    icon: Scissors,
    desc: 'On-spot creative handicraft competition. 2 hours. Any form — paper art, origami, clay work, embroidery. All materials must be brought by participants.',
    fee: '₹200/person',
  },
];

export default function Unforgettable() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((activeIndex + 1) % events.length);
  }, [activeIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((activeIndex - 1 + events.length) % events.length);
  }, [activeIndex, goToSlide]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % events.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset auto-slide timer on manual navigation
  const handleManualNav = useCallback((fn: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fn();
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % events.length);
    }, 4000);
  }, []);

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
        .fromTo(content.querySelector('.unforgettable-subtitle'),
          { x: '-18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(content.querySelector('.unforgettable-title'),
          { x: '-18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.08
        )
        .fromTo(content.querySelector('.unforgettable-desc'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.13
        )
        .fromTo(content.querySelector('.slider-nav'),
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.15
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
        .fromTo([content.querySelector('.unforgettable-subtitle'), content.querySelector('.unforgettable-desc'), content.querySelector('.cta-button'), content.querySelector('.slider-nav')],
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

  const current = events[activeIndex];
  const IconComponent = current.icon;

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-[90] flex items-center"
    >
      {/* Background Image - crossfade */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        {events.map((event, i) => (
          <img
            key={event.name}
            src={event.image}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))}
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

        {/* Category Label */}
        <h2 className="unforgettable-subtitle font-mono text-sm uppercase tracking-wider mb-4 transition-all duration-500" style={{ color: current.color }}>
          {current.category}
        </h2>

        {/* Event Name */}
        <h3 className="unforgettable-title font-display text-hero text-white mb-2 transition-all duration-500" style={{ textShadow: `0 0 20px ${current.color}60, 0 0 40px ${current.color}30, 0 4px 20px rgba(0,0,0,0.8)` }}>
          {current.name.toUpperCase()}
        </h3>

        {/* Fee Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono transition-all duration-500"
            style={{ borderColor: `${current.color}50`, color: current.color, background: `${current.color}10` }}
          >
            <IconComponent className="w-4 h-4" />
            <span>{current.fee}</span>
          </div>
          <span className="text-white/40 font-mono text-xs">{activeIndex + 1} / {events.length}</span>
        </div>

        {/* Description */}
        <p className="unforgettable-desc text-lg text-white/70 max-w-[34vw] mb-8 leading-relaxed transition-all duration-500">
          {current.desc}
        </p>

        {/* Slider Navigation */}
        <div className="slider-nav flex items-center gap-4 mb-8">
          {/* Prev/Next Buttons */}
          <button
            onClick={() => handleManualNav(prevSlide)}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {events.map((event, i) => (
              <button
                key={event.name}
                onClick={() => handleManualNav(() => goToSlide(i))}
                className="group relative h-2.5 rounded-full transition-all duration-500 overflow-hidden"
                style={{ width: i === activeIndex ? '32px' : '10px', background: i === activeIndex ? current.color : 'rgba(255,255,255,0.2)' }}
              >
                {i === activeIndex && (
                  <span 
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{ background: current.color, opacity: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleManualNav(nextSlide)}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CTA */}
        <button 
          className="cta-button btn-primary flex items-center gap-2 group transition-all duration-500"
          onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Register for {current.name}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
