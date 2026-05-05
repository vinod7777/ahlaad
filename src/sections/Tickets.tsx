import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Ticket, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ticketTiers = [
  {
    name: 'Individual Entry',
    price: '₹200',
    color: '#C9A84C',
    features: [
      'Solo event participation',
      'Valid College ID required',
      'Food court access',
      'Digital program & schedule',
      'Event certificate'
    ],
    popular: false
  },
  {
    name: 'Team Entry',
    price: '₹500',
    color: '#8B0000',
    features: [
      'Team event participation',
      'Rock Band / Dance Group / Drama',
      'Short Film team entry',
      'Priority check-in',
      'Event certificates for all members',
      'Backstage access'
    ],
    popular: true
  }
];

export default function Tickets() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;

    if (!section || !header || !cards) return;

    const ctx = gsap.context(() => {
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

      const cardElements = cards.querySelectorAll('.ticket-card-wrapper');
      cardElements.forEach((card, index) => {
        gsap.fromTo(card,
          { y: '10vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: `top ${65 - index * 8}%`,
              end: `top ${35 - index * 8}%`,
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
      id="tickets"
      className="section-flowing bg-[#080614] py-[10vh] z-[60]"
    >
      <div className="w-full px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="font-display text-section text-white mb-4">
            Entry <span className="text-gradient-gold">Fees</span>
          </h2>
          <p className="text-white/60 text-lg">
            Choose your participation type — total prize pool of <span className="text-[#C9A84C] font-display text-2xl" style={{ textShadow: '0 0 12px rgba(201,168,76,0.5)' }}>₹2,50,000</span> awaits!
          </p>
        </div>

        {/* Ticket Cards */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {ticketTiers.map((tier, index) => (
            <div 
              key={index}
              className={`ticket-card-wrapper relative ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#8B0000] to-[#C9A84C] text-white text-xs font-mono uppercase tracking-wider px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div 
                className="ticket-card h-full p-6"
                style={{ 
                  borderColor: tier.popular ? `${tier.color}60` : 'rgba(255,255,255,0.1)',
                  boxShadow: tier.popular ? `0 0 30px ${tier.color}30` : 'none'
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <Ticket className="w-6 h-6" style={{ color: tier.color }} />
                  <h3 className="font-display text-2xl text-white">{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-display text-5xl text-white">{tier.price}</span>
                  {tier.price !== 'FREE' && <span className="text-white/50 text-sm ml-2">/ entry</span>}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button 
                  className={`w-full py-3 font-medium transition-all duration-300 rounded-lg ${
                    tier.popular 
                      ? 'text-white' 
                      : 'border border-white/30 text-white hover:border-[#C9A84C] hover:text-[#C9A84C]'
                  }`}
                  style={{ 
                    background: tier.popular ? `linear-gradient(135deg, ${tier.color}, #C9A84C)` : 'transparent'
                  }}
                  onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
