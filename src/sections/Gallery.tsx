import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  { src: '/gallery_colorful_01.jpg', alt: 'Stage', size: 'large' },
  { src: '/gallery_colorful_02.jpg', alt: 'Drummer', size: 'small' },
  { src: '/gallery_colorful_03.jpg', alt: 'Crowd', size: 'medium' },
  { src: '/live_colorful.jpg', alt: 'Performance', size: 'medium' },
  { src: '/featured_singer.jpg', alt: 'Singer', size: 'small' },
  { src: '/crowd_colorful.jpg', alt: 'Festival', size: 'large' },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;

    if (!section || !header || !grid) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(header,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.5,
          }
        }
      );

      // Images animation
      const images = grid.querySelectorAll('.gallery-image');
      images.forEach((img, index) => {
        gsap.fromTo(img,
          { y: '8vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: `top ${70 - index * 8}%`,
              end: `top ${40 - index * 8}%`,
              scrub: 0.5,
            }
          }
        );
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="gallery"
      className="section-flowing bg-[#080614] py-[10vh] z-[100]"
    >
      <div className="w-full px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
          <h2 className="font-display text-section text-white mb-4">
            <span className="text-gradient-gold">Gallery</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl">
            Glimpses from past AITAM cultural events. Ahlaad 2026 promises to be even more spectacular.
          </p>
        </div>

        {/* Masonry Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]"
        >
          {/* Large feature image */}
          <div className="gallery-image col-span-2 row-span-2 relative rounded-xl overflow-hidden group cursor-pointer border border-[#FF0080]/20 hover:border-[#FF0080]/50 transition-colors">
            <img 
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080614]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Small image */}
          <div className="gallery-image relative rounded-xl overflow-hidden group cursor-pointer border border-[#00FFFF]/20 hover:border-[#00FFFF]/50 transition-colors">
            <img 
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Medium image */}
          <div className="gallery-image row-span-2 relative rounded-xl overflow-hidden group cursor-pointer border border-[#BF00FF]/20 hover:border-[#BF00FF]/50 transition-colors">
            <img 
              src={galleryImages[2].src}
              alt={galleryImages[2].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Medium image */}
          <div className="gallery-image relative rounded-xl overflow-hidden group cursor-pointer border border-[#39FF14]/20 hover:border-[#39FF14]/50 transition-colors">
            <img 
              src={galleryImages[3].src}
              alt={galleryImages[3].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Small image */}
          <div className="gallery-image relative rounded-xl overflow-hidden group cursor-pointer border border-[#FF5E00]/20 hover:border-[#FF5E00]/50 transition-colors">
            <img 
              src={galleryImages[4].src}
              alt={galleryImages[4].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Large image */}
          <div className="gallery-image col-span-2 relative rounded-xl overflow-hidden group cursor-pointer border border-[#0080FF]/20 hover:border-[#0080FF]/50 transition-colors">
            <img 
              src={galleryImages[5].src}
              alt={galleryImages[5].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="btn-primary inline-flex items-center gap-2 group" onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}>
            Be part of the story — Register
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
