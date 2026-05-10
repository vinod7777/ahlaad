import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const coordinators = [
  {
    name: 'Dr. D. Yugandhar',
    role: 'Convener',
    designation: 'Associate Dean (A, CG & SAC)',
    image: 'yugandra.jpeg',
  },
  {
    name: 'Sri Suresh Kumar Jaka',
    role: 'Co-Convener',
    designation: 'Assistant Professor, SAC',
    image: 'suresh.jpg', // Image to be provided later
  },
];

const studentCoordinators = [
  {
    name: 'R. Srinivas Naidu',
    role: 'Student Coordinator',
    phone: '+91 8019130658',
  },
  {
    name: 'Ms. Binisha',
    role: 'Student Coordinator',
    phone: '+91 8179626781',
  },
];

export default function OrganiserBody() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const studentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const coord = coordRef.current;
    const student = studentRef.current;

    if (!section || !header || !coord || !student) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(header,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 55%', scrub: 0.5 }
        }
      );

      const coordCards = coord.querySelectorAll('.coord-card');
      coordCards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: `top ${70 - i * 5}%`, end: `top ${50 - i * 5}%`, scrub: 0.5 }
          }
        );
      });

      const studentCards = student.querySelectorAll('.student-card');
      studentCards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: student, start: `top ${90 - i * 5}%`, end: `top ${70 - i * 5}%`, scrub: 0.5 }
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="organisers"
      className="relative z-[115] py-[10vh] bg-gradient-to-b from-[#080614] via-[#0a0820] to-[#080614]"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #8B0000, transparent)' }} />
      </div>

      <div className="w-full px-[6vw] relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="font-mono text-sm text-[#C9A84C] uppercase tracking-[0.3em] mb-4">
            The Team Behind Ahlaad 2K26
          </p>
          <h2 className="font-display text-section text-white mb-4">
            Organiser <span className="text-gradient-gold">Body</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#C9A84C] via-[#8B0000] to-[#1a237e] mx-auto rounded-full neon-glow-gold" />
        </div>

        {/* Coordinators */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#C9A84C] uppercase tracking-[0.25em] mb-8 text-center">
            Coordinators
          </p>
          <div ref={coordRef} className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {coordinators.map((person) => (
              <div
                key={person.name}
                className="coord-card group relative flex flex-col items-center text-center w-[260px]"
              >
                {/* Image / Placeholder */}
                <div className="relative mb-5">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-[3px] border-[#C9A84C]/40 group-hover:border-[#C9A84C] transition-all duration-500" style={{ boxShadow: '0 0 30px rgba(201,168,76,0.15), inset 0 0 20px rgba(0,0,0,0.3)' }}>
                    {person.image ? (
                      <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1530] to-[#0d0b1e] flex items-center justify-center">
                        <User className="w-16 h-16 text-[#C9A84C]/40" />
                      </div>
                    )}
                  </div>
                  {/* Gold glow ring on hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: '0 0 40px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.1)' }} />
                </div>

                {/* Info */}
                <h3 className="font-display text-2xl text-white mb-1 tracking-wide group-hover:text-[#C9A84C] transition-colors duration-300">
                  {person.name}
                </h3>
                <span className="inline-block px-4 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-2 border" style={{ color: '#C9A84C', borderColor: '#C9A84C40', background: '#C9A84C10' }}>
                  {person.role}
                </span>
                <p className="text-white/50 text-sm">{person.designation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 max-w-2xl mx-auto mb-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-[#C9A84C]/40" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Student Coordinators */}
        <div>
          <p className="font-mono text-xs text-[#FF0080] uppercase tracking-[0.25em] mb-8 text-center">
            Student Coordinators
          </p>
          <div ref={studentRef} className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {studentCoordinators.map((person) => (
              <div
                key={person.name}
                className="student-card group glass-card flex items-center gap-4 px-6 py-5 rounded-xl border border-[#FF0080]/20 hover:border-[#FF0080]/50 transition-all duration-400 hover:translate-y-[-2px]"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#FF0080]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF0080]/20 transition-colors duration-300">
                  <User className="w-6 h-6 text-[#FF0080]/70" />
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-display text-xl text-white tracking-wide group-hover:text-[#FF0080] transition-colors duration-300">
                    {person.name}
                  </h3>
                  <span className="text-[#FF0080]/70 text-xs font-mono uppercase tracking-wider">
                    {person.role}
                  </span>
                  {person.phone && (
                    <p className="text-white/40 text-sm font-mono mt-0.5">{person.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
