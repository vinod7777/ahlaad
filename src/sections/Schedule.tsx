import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, MapPin, Calendar, ChevronRight, Music, Zap, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const scheduleData = [
  {
    day: 'Day 01',
    date: 'June 26',
    title: 'Inaugural + Competitions + DJ Night',
    color: '#C9A84C',
    icon: Music,
    events: [
      { time: '09:00 AM', name: 'Inaugural Ceremony', location: 'Main Stage', artist: 'Silver Jubilee Address' },
      { time: '10:00 AM', name: 'Singing Competition', location: 'Main Stage', artist: 'Solo Vocal' },
      { time: '10:00 AM', name: 'Cover Song', location: 'Stage 2', artist: 'Reimagine a Hit' },
      { time: '10:00 AM', name: 'Painting & Handicrafts', location: 'Art Hall', artist: 'On-spot Theme' },
      { time: '01:00 PM', name: 'Lunch Break', location: 'Food Court', artist: '—' },
      { time: '02:00 PM', name: 'Short Film Screenings', location: 'Auditorium', artist: 'Max 10 min, Original' },
      { time: '02:00 PM', name: 'Photography Contest', location: 'Campus', artist: 'On-spot Theme, 2 hrs' },
      { time: '02:00 PM', name: 'Drama / Skit', location: 'Main Stage', artist: 'Stage Play' },
      { time: '06:30 PM', name: 'DJ NIGHT', location: 'Open Arena', artist: 'The Silver Jubilee Pulse 🔥' },
    ]
  },
  {
    day: 'Day 02',
    date: 'June 27',
    title: 'Dance + Rock Band + Valedictory',
    color: '#FF0080',
    icon: Zap,
    events: [
      { time: '09:30 AM', name: 'Dance — Classical (Solo)', location: 'Dance Arena', artist: '3-4 mins per performer' },
      { time: '09:30 AM', name: 'Dance — Western (Solo)', location: 'Dance Arena', artist: '3-4 mins per performer' },
      { time: '10:30 AM', name: 'Dance — Classical (Group)', location: 'Dance Arena', artist: '5-8 mins per group' },
      { time: '10:30 AM', name: 'Dance — Western (Group)', location: 'Dance Arena', artist: '5-8 mins per group' },
      { time: '01:00 PM', name: 'Lunch Break', location: 'Food Court', artist: '—' },
      { time: '02:00 PM', name: 'Rock Band: Battle of the Bands', location: 'Main Stage', artist: '15 min total per band' },
    ]
  },
  {
    day: 'Finale',
    date: 'June 27 Evening',
    title: 'Grand Valedictory & Prize Distribution',
    color: '#8B0000',
    icon: Award,
    events: [
      { time: '05:30 PM', name: 'Grand Valedictory Ceremony', location: 'Main Stage', artist: 'All Performers' },
      { time: '05:30 PM', name: 'Chief Guest: MSK Prasad', location: 'Main Stage', artist: 'Guest of Honour' },
      { time: '05:30 PM', name: 'Chief Guest: Rasi Singh', location: 'Main Stage', artist: 'Guest of Honour' },
      { time: '06:30 PM', name: 'Prize Distribution', location: 'Main Stage', artist: '₹2,50,000 Prize Pool 🏆' },
      { time: '07:30 PM', name: 'Closing Ceremony', location: 'Main Stage', artist: 'Farewell & Celebrations' },
    ]
  }
];

export default function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const days = daysRef.current;

    if (!section || !header || !days) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(header,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
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

      const dayBlocks = days.querySelectorAll('.day-block');
      dayBlocks.forEach((block, index) => {
        gsap.fromTo(block,
          { x: '6vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: `top ${70 - index * 10}%`,
              end: `top ${40 - index * 10}%`,
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
      id="schedule"
      className="section-flowing bg-[#080614] py-[10vh] z-[80]"
    >
      <div className="w-full px-[6vw]">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Header */}
          <div ref={headerRef} className="lg:w-1/3">
            <h2 className="font-display text-section text-white mb-4">
              <span className="text-gradient-gold">Schedule</span>
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Two days packed with competitions, DJ night, and the grand valedictory. Plan your experience.
            </p>
            
            {/* Day Selector */}
            <div className="flex flex-col gap-3 mb-8">
              {scheduleData.map((day, index) => {
                const IconComp = day.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveDay(index)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left ${
                      activeDay === index 
                        ? 'glass-neon' 
                        : 'glass-card hover:border-white/20'
                    }`}
                    style={{ 
                      borderColor: activeDay === index ? day.color : 'transparent',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${day.color}20`, boxShadow: `0 0 10px ${day.color}30` }}
                    >
                      <IconComp className="w-5 h-5" style={{ color: day.color }} />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider" style={{ color: day.color }}>
                        {day.day}
                      </p>
                      <p className="text-white font-medium">{day.title}</p>
                      <p className="text-white/50 text-sm">{day.date}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${activeDay === index ? 'rotate-90' : ''}`} style={{ color: day.color }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Timeline */}
          <div ref={daysRef} className="lg:w-2/3">
            <div 
              className="day-block glass-card rounded-xl p-6"
              style={{ borderColor: `${scheduleData[activeDay].color}30`, borderWidth: '1px', borderStyle: 'solid' }}
            >
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2" style={{ color: scheduleData[activeDay].color }}>
                  <Calendar className="w-5 h-5" />
                  <span className="font-mono text-sm uppercase tracking-wider">
                    {scheduleData[activeDay].day}
                  </span>
                </div>
                <span className="text-white/40">|</span>
                <span className="text-white/60 text-sm">{scheduleData[activeDay].date}, 2K26</span>
                <div 
                  className="flex-1 h-[2px] ml-4"
                  style={{ background: `linear-gradient(90deg, ${scheduleData[activeDay].color}, transparent)` }}
                />
              </div>

              <h3 className="font-display text-2xl text-white mb-6">{scheduleData[activeDay].title}</h3>

              {/* Events */}
              <div className="space-y-4">
                {scheduleData[activeDay].events.map((event, eIndex) => (
                  <div 
                    key={eIndex}
                    className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-[110px]" style={{ color: scheduleData[activeDay].color }}>
                      <Clock className="w-4 h-4" />
                      <span className="font-mono text-sm">{event.time}</span>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <span className="text-white font-medium block">{event.name}</span>
                      <span className={event.artist.includes('2,50,000') ? 'text-[#C9A84C] font-display text-base' : 'text-white/50 text-sm'} style={event.artist.includes('2,50,000') ? { textShadow: '0 0 10px rgba(201,168,76,0.5)' } : {}}>{event.artist}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
