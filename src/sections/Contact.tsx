import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, MapPin, Mail, Instagram, Facebook } from 'lucide-react';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(content,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 50%', scrub: 0.5 }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={sectionRef}
      id="contact"
      className="relative bg-gradient-to-b from-[#080614] to-[#0d0b1e] z-[120]"
      style={{ minHeight: 'auto' }}
    >
      <div ref={contentRef} className="w-full px-[6vw] py-[8vh]">
        {/* Top: Title + Contacts */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-10">
          {/* Left - Branding */}
          <div className="lg:w-1/3">
            <h2 className="font-display text-section text-white mb-4">
              Get in <span className="text-gradient-gold">Touch</span>
            </h2>
            <p className="text-white/60 text-base mb-6">
              For queries, sponsorships, and participation support — reach out to the organizers.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/AitamOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: '#FF008020', boxShadow: '0 0 20px #FF008030' }}
              >
                <Instagram className="w-5 h-5 text-[#FF0080]" />
              </a>
              <a
                href="https://www.facebook.com/AitamOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: '#0080FF20', boxShadow: '0 0 20px #0080FF30' }}
              >
                <Facebook className="w-5 h-5 text-[#0080FF]" />
              </a>
            </div>
          </div>

          {/* Middle - Organizers */}
          <div className="lg:w-1/3 space-y-3">
            <p className="text-[#C9A84C] font-mono text-xs uppercase tracking-wider mb-3">Organizers</p>
            <div className="glass-card p-3 rounded-lg border border-[#C9A84C]/20">
              <p className="text-white font-medium text-sm">Dr. D. Yugandhar</p>
              <p className="text-white/40 text-xs">Convener · Associate Dean (A, CG & SAC)</p>
            </div>
            <div className="glass-card p-3 rounded-lg border border-[#8B0000]/20">
              <p className="text-white font-medium text-sm">Sri Suresh Kumar Jaka</p>
              <p className="text-white/40 text-xs">Co-Convener · Assistant Professor, SAC</p>
            </div>
          </div>

          {/* Right - Student Contacts */}
          <div className="lg:w-1/3 space-y-3">
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">Student Contacts</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <div>
                <span className="text-white text-sm block">R. Srinivas Naidu</span>
                <span className="text-white/40 text-xs">+91 8019130658</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FF0080]/20 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#FF0080]" />
              </div>
              <div>
                <span className="text-white text-sm block">Ms. Binisha</span>
                <span className="text-white/40 text-xs">+91 8179626781</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00FFFF]/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#00FFFF]" />
              </div>
              <span className="text-white text-sm">AITAM Campus, Tekkali</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#BF00FF]/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#BF00FF]" />
              </div>
              <span className="text-white text-sm">www.adityatekkali.edu.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <SilverJubileeLogo size={36} />
            <div>
              <span className="font-display text-lg text-white tracking-wider">AHLAAD 2026</span>
              <span className="text-white/40 text-xs block">AITAM Silver Jubilee Cultural Fest</span>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-white/60">
            <a href="https://www.adityatekkali.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A84C] transition-colors">AITAM Website</a>
            <span>@AitamOfficial</span>
          </div>
          
          <div className="text-sm text-white/40">
            © 2026 AITAM — Ahlaad Silver Jubilee. All rights reserved.
          </div>
        </div>

        {/* Developer Credit - Last & Centered */}
        <div className="text-center mt-6 pt-4 border-t border-white/5">
          <span className="text-white/40 text-sm">Developed by <a href="https://www.linkedin.com/in/saisateeshwarareddy/" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:text-[#E0C97F] transition-colors underline underline-offset-2">T. Saisateeshwara Reddy</a> | Technical Trainer, IIC</span>
        </div>
      </div>
    </footer>
  );
}
