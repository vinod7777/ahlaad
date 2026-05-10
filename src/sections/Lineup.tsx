import { useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Film, Guitar, Camera, Mic, Music, PersonStanding, Drama, Palette, Scissors, X, Clock, Users, AlertTriangle, Trophy } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Competition {
  name: string;
  genre: string;
  image: string;
  color: string;
  icon: typeof Film;
  fee: string;
  hoverDetail: string;
  guidelines: string[];
  timeLimit: string;
  category: string;
  participants: string;
}

const competitions: Competition[] = [
  {
    name: 'Short Films',
    genre: 'Max 10 min, Original Content',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.26 PM.jpeg',
    color: '#FF0080',
    icon: Film,
    fee: '₹500/team',
    hoverDetail: 'Maximum 10 min duration. Content must be original — plagiarism results in disqualification.',
    timeLimit: '10 minutes max',
    category: 'Team Event',
    participants: 'Team',
    guidelines: [
      'Maximum duration: 10 minutes.',
      'Content must be 100% original. Plagiarism results in immediate disqualification.',
      'Films can be in any genre — drama, comedy, thriller, documentary, etc.',
      'Submit the final film in MP4/AVI format before the screening.',
      'Judging criteria: Storyline, cinematography, editing, originality, and overall impact.',
      'Entry Fee: ₹500 per team.',
    ],
  },
  {
    name: 'Rock Band',
    genre: '15 min total incl. Sound Check',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.35 PM.jpeg',
    color: '#00FFFF',
    icon: Guitar,
    fee: '₹500/team',
    hoverDetail: '15 min performance including sound check. Covers or originals allowed. Drum kit provided.',
    timeLimit: '15 minutes (incl. sound check)',
    category: 'Team Event',
    participants: 'Band (3-8 members)',
    guidelines: [
      'Performance time: 15 minutes including setup and sound check.',
      'Bands may perform cover songs or original compositions.',
      'The institute will provide a standard drum kit.',
      'Bands must bring their own guitars, bass, processors, and cables.',
      'Judging criteria: Musical ability, stage presence, coordination, and crowd engagement.',
      'Entry Fee: ₹500 per band.',
    ],
  },
  {
    name: 'Photography',
    genre: 'On-spot Theme, 2 Hours',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.30 PM.jpeg',
    color: '#BF00FF',
    icon: Camera,
    fee: '₹200/person',
    hoverDetail: 'On-spot theme-based. Only basic editing (crop/color) allowed. No AI generation.',
    timeLimit: '2 hours',
    category: 'Individual Event',
    participants: 'Solo',
    guidelines: [
      'On-spot theme-based photography competition.',
      'Duration: 2 hours from theme announcement.',
      'Only basic editing is permitted — cropping and color correction.',
      'No AI-generated images allowed. Violation = disqualification.',
      'Submit photos in JPEG/RAW format to the judge panel.',
      'Judging criteria: Composition, creativity, adherence to theme, and technical quality.',
      'Entry Fee: ₹200 per person.',
    ],
  },
  {
    name: 'Singing',
    genre: 'Solo Vocal Performance',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.29 PM.jpeg',
    color: '#C9A84C',
    icon: Mic,
    fee: '₹200/person',
    hoverDetail: '4 min performance. One acoustic instrument or backing track allowed (no lead vocals).',
    timeLimit: '4 minutes',
    category: 'Individual Event',
    participants: 'Solo',
    guidelines: [
      'Time limit: 4 minutes per performance.',
      'Participants can perform with one acoustic instrument or a backing track.',
      'No lead vocals allowed in the backing track.',
      'Participants may sing in any language.',
      'Judging criteria: Vocal range, pitch accuracy, tonal quality, and expression.',
      'Entry Fee: ₹200 per person.',
    ],
  },
  {
    name: 'Cover Song',
    genre: 'Reimagine a Hit',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.25 PM.jpeg',
    color: '#FF5E00',
    icon: Music,
    fee: '₹200/person',
    hoverDetail: '4 min limit. Perform with instrument or track. Judged on improvisation & soul.',
    timeLimit: '4 minutes',
    category: 'Individual Event',
    participants: 'Solo',
    guidelines: [
      'Time limit: 4 minutes per performance.',
      'Perform a cover of any popular song — make it your own!',
      'One acoustic instrument or backing track allowed (no lead vocals in track).',
      'Judging criteria: Vocal range, pitch, soul, and improvisation.',
      'Creative reinterpretation of the original song is highly valued.',
      'Entry Fee: ₹200 per person.',
    ],
  },
  {
    name: 'Dance',
    genre: 'Classical & Western · Solo & Group',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.28 PM (1).jpeg',
    color: '#39FF14',
    icon: PersonStanding,
    fee: '₹200 / ₹500',
    hoverDetail: 'Solo (3-4 min) & Group (5-8 min, 4-12 members). Tracks must be submitted 2 hrs before.',
    timeLimit: 'Solo: 3-4 min | Group: 5-8 min',
    category: 'Solo & Group',
    participants: 'Solo or Group (4-12 members)',
    guidelines: [
      'Categories: Classical Solo, Classical Group, Western Solo, Western Group.',
      'Solo time: 3-4 minutes. Group time: 5-8 minutes.',
      'Group size: 4-12 members.',
      'Exceeding the time limit leads to negative marking.',
      'Music tracks must be submitted on a pendrive (high-quality .mp3) to the technical desk 2 hours before the event.',
      'Judging criteria: Choreography, synchronization, costume, expression, and stage utilization.',
      'Entry Fee: ₹200 (Solo) | ₹500 (Group).',
    ],
  },
  {
    name: 'Drama / Skit',
    genre: 'Stage Play Performance',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.25 PM (1).jpeg',
    color: '#0080FF',
    icon: Drama,
    fee: '₹500/team',
    hoverDetail: 'Max 15 min performance. Props must be cleared immediately after. Team event.',
    timeLimit: '15 minutes max',
    category: 'Team Event',
    participants: 'Team',
    guidelines: [
      'Maximum performance duration: 15 minutes.',
      'Teams may perform in any language.',
      'Props are allowed but must be cleared immediately after the performance.',
      'No vulgarity, casteism, or political content permitted.',
      'Judging criteria: Script, acting, dialogue delivery, expressions, and overall impact.',
      'Entry Fee: ₹500 per team.',
    ],
  },
  {
    name: 'Painting',
    genre: 'On-spot Theme, 2 Hours',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.35 PM (1).jpeg',
    color: '#FF0080',
    icon: Palette,
    fee: '₹200/person',
    hoverDetail: 'On-spot theme. 2 hours. All materials must be brought by participants.',
    timeLimit: '2 hours',
    category: 'Individual Event',
    participants: 'Solo',
    guidelines: [
      'On-spot theme-based painting competition.',
      'Duration: 2 hours from theme announcement.',
      'All painting materials (canvas, colors, brushes) must be brought by participants.',
      'Medium: Any (watercolor, acrylic, oil, charcoal, etc.).',
      'Judging criteria: Creativity, use of color, adherence to theme, and presentation.',
      'Entry Fee: ₹200 per person.',
    ],
  },
  {
    name: 'Handicrafts',
    genre: 'Creative Hand-made Art',
    image: 'img/WhatsApp Image 2026-05-07 at 8.37.33 PM (1).jpeg',
    color: '#00FFFF',
    icon: Scissors,
    fee: '₹200/person',
    hoverDetail: 'All materials must be brought by participants. 2 hours. Creativity is key.',
    timeLimit: '2 hours',
    category: 'Individual Event',
    participants: 'Solo',
    guidelines: [
      'On-spot creative handicraft competition.',
      'Duration: 2 hours.',
      'All materials must be brought by participants unless otherwise specified.',
      'Any form of handicraft is allowed — paper art, origami, clay work, embroidery, etc.',
      'Judging criteria: Creativity, innovation, finish quality, and presentation.',
      'Entry Fee: ₹200 per person.',
    ],
  },
];

export default function Lineup() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;

    if (!section || !header || !grid) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(header,
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 50%', scrub: 0.5 }
        }
      );

      const cards = grid.querySelectorAll('.performer-card');
      cards.forEach((card, index) => {
        gsap.fromTo(card,
          { y: '10vh', scale: 0.98, opacity: 0 },
          {
            y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: `top ${70 - index * 4}%`, end: `top ${40 - index * 4}%`, scrub: 0.5 }
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <section 
        ref={sectionRef}
        id="competitions"
        className="section-flowing bg-[#080614] py-[10vh] z-40"
      >
        <div className="w-full px-[6vw]">
          {/* Header */}
          <div ref={headerRef} className="mb-12">
            <h2 className="font-display text-section text-white mb-4">
              <span className="text-gradient-gold">Competitions</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <p className="text-white/60 text-lg">
                9 Events · Entry Fee: ₹200 (Individual) | ₹500 (Team)
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/5">
                <img src="trophy.png" alt="Trophy" className="w-8 h-8 object-contain" />
                <span className="text-[#C9A84C] font-display text-2xl">₹2,50,000</span>
                <span className="text-[#C9A84C]/70 text-xs font-mono uppercase">Prize Pool</span>
              </div>
            </div>
            <p className="text-white/40 text-sm mt-3">Click on any competition to view full guidelines</p>
          </div>

          {/* Grid */}
          <div 
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {competitions.map((comp, index) => {
              const IconComp = comp.icon;
              return (
                <div 
                  key={index}
                  className="performer-card group relative rounded-xl overflow-hidden cursor-pointer"
                  style={{ boxShadow: `0 0 20px ${comp.color}20` }}
                  onClick={() => setSelectedComp(comp)}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={comp.image}
                      alt={comp.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080614] via-[#080614]/50 to-transparent opacity-80" />

                  {/* Color glow on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${comp.color}, transparent)` }}
                  />

                  {/* Icon Badge */}
                  <div 
                    className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: `${comp.color}30`, border: `1px solid ${comp.color}50` }}
                  >
                    <IconComp className="w-6 h-6" style={{ color: comp.color }} />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span 
                      className="font-mono text-xs uppercase tracking-wider mb-2 block"
                      style={{ color: comp.color }}
                    >
                      {comp.genre}
                    </span>
                    <h3 className="font-display text-3xl text-white group-hover:text-[#C9A84C] transition-colors">
                      {comp.name}
                    </h3>
                    <span className="text-white/50 text-xs font-mono mt-2 block">{comp.fee}</span>

                    {/* Hover Detail - Slides up */}
                    <div className="mt-3 max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-500 ease-out">
                      <p className="text-white/70 text-sm leading-relaxed border-t pt-3" style={{ borderColor: `${comp.color}40` }}>
                        {comp.hoverDetail}
                      </p>
                      <span className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: comp.color }}>
                        View full guidelines <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Border glow on hover */}
                  <div 
                    className="absolute inset-0 border-2 border-transparent group-hover:border-opacity-40 rounded-xl transition-colors duration-300"
                    style={{ borderColor: comp.color }}
                  />
                </div>
              );
            })}
          </div>

          {/* Prize Pool Banner */}
          <div className="mt-16 relative overflow-hidden rounded-2xl p-8 md:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.12), rgba(201,168,76,0.08))' }}>
            <div className="absolute inset-0 border border-[#C9A84C]/20 rounded-2xl" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-60" />
            <p className="font-mono text-sm text-[#C9A84C] uppercase tracking-[0.3em] mb-4 font-bold" style={{ textShadow: '0 0 10px rgba(201,168,76,0.3)' }}>Total Prize Pool</p>
            <img 
              src="trophy.png" 
              alt="Trophy" 
              className="w-32 h-auto mx-auto mb-6 animate-float" 
              style={{ 
                filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.9)) drop-shadow(0 0 50px rgba(201,168,76,0.4))' 
              }}
            />
            <h3 className="font-display text-6xl md:text-8xl lg:text-9xl text-white neon-text-glow-gold" style={{ textShadow: '0 0 30px rgba(201,168,76,0.8), 0 0 60px rgba(201,168,76,0.5), 0 0 100px rgba(201,168,76,0.3)' }}>
              ₹2,50,000
            </h3>
            <p className="text-white/50 text-sm mt-4 max-w-md mx-auto">
              Across 9 competitions — the biggest cultural prize pool in AITAM's 25-year history
            </p>
            <button 
              className="btn-primary inline-flex items-center gap-2 group mt-6"
              onClick={() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Register Now & Win Big
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal via Portal */}
      {selectedComp && createPortal(
        <div 
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedComp(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#080614]/90 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{ 
              background: 'linear-gradient(180deg, #0d0b1e, #080614)',
              borderColor: `${selectedComp.color}30`,
              boxShadow: `0 0 60px ${selectedComp.color}20`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img src={selectedComp.image} alt={selectedComp.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b1e] to-transparent" />
              <button 
                onClick={() => setSelectedComp(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: selectedComp.color }}>
                  {selectedComp.category}
                </span>
                <h3 className="font-display text-4xl text-white">{selectedComp.name}</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8">
              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass-card p-3 rounded-lg border border-white/10 text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: selectedComp.color }} />
                  <p className="text-white text-xs font-medium">{selectedComp.timeLimit}</p>
                  <p className="text-white/40 text-[10px] font-mono uppercase">Time Limit</p>
                </div>
                <div className="glass-card p-3 rounded-lg border border-white/10 text-center">
                  <Users className="w-4 h-4 mx-auto mb-1" style={{ color: selectedComp.color }} />
                  <p className="text-white text-xs font-medium">{selectedComp.participants}</p>
                  <p className="text-white/40 text-[10px] font-mono uppercase">Participants</p>
                </div>
                <div className="glass-card p-3 rounded-lg border border-[#C9A84C]/20 text-center">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-[#C9A84C]" />
                  <p className="text-[#C9A84C] font-medium font-display text-2xl">{selectedComp.fee}</p>
                  <p className="text-white/40 text-[10px] font-mono uppercase">Entry Fee</p>
                </div>
              </div>

              {/* Guidelines */}
              <h4 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: selectedComp.color }} />
                Competition Guidelines
              </h4>
              <ul className="space-y-3 mb-6">
                {selectedComp.guidelines.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: `${selectedComp.color}20`, color: selectedComp.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-white/70 text-sm leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button 
                className="btn-primary w-full flex items-center justify-center gap-2 group"
                onClick={() => {
                  setSelectedComp(null);
                  setTimeout(() => document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' }), 300);
                }}
              >
                Register for {selectedComp.name}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
