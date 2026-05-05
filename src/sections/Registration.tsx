import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const competitionOptions = [
  'Short Films',
  'Rock Band',
  'Photography',
  'Singing',
  'Cover Song',
  'Dance — Classical Solo',
  'Dance — Classical Group',
  'Dance — Western Solo',
  'Dance — Western Group',
  'Drama / Skit',
  'Painting',
  'Handicrafts',
];

export default function Registration() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    participant_name: '',
    email: '',
    phone: '',
    college: '',
    college_id: '',
    competition: '',
    team_name: '',
    team_size: '',
    entry_type: 'individual',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const form = formRef.current;
    const header = headerRef.current;

    if (!section || !form || !header) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(header,
        { x: '-6vw', opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 50%', scrub: 0.5 }
        }
      );
      gsap.fromTo(form,
        { x: '6vw', opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 45%', scrub: 0.5 }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const isTeamEvent = ['Short Films', 'Rock Band', 'Dance — Classical Group', 'Dance — Western Group', 'Drama / Skit'].includes(formData.competition);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        entry_type: isTeamEvent ? 'team' : 'individual',
      };

      const response = await fetch('http://localhost/ahlaad_backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({
          participant_name: '', email: '', phone: '', college: '',
          college_id: '', competition: '', team_name: '', team_size: '', entry_type: 'individual',
        });
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not connect to server. Make sure XAMPP is running.');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="register"
      className="section-flowing bg-gradient-to-b from-[#080614] to-[#0d0b1e] py-[10vh] z-[105]"
    >
      <div className="w-full px-[6vw]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left - Info */}
          <div ref={headerRef} className="lg:w-2/5">
            <h2 className="font-display text-section text-white mb-6">
              <span className="text-gradient-gold">Register</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-md">
              Fill out the form to register for any competition at Ahlaad 2026. 
              Valid College ID is mandatory. Open to all UG/PG students.
            </p>

            <div className="space-y-4 mb-8">
              <div className="glass-card px-5 py-4 rounded-lg border border-[#C9A84C]/30">
                <p className="text-[#C9A84C] font-mono text-xs uppercase tracking-wider mb-1">Individual Events</p>
                <p className="text-white text-lg font-display">₹200 <span className="text-white/50 text-sm">per person</span></p>
                <p className="text-white/50 text-xs mt-1">Singing · Cover Song · Photography · Painting · Handicrafts · Dance Solo</p>
              </div>
              <div className="glass-card px-5 py-4 rounded-lg border border-[#8B0000]/30">
                <p className="text-[#8B0000] font-mono text-xs uppercase tracking-wider mb-1">Team Events</p>
                <p className="text-white text-lg font-display">₹500 <span className="text-white/50 text-sm">per team</span></p>
                <p className="text-white/50 text-xs mt-1">Rock Band · Short Films · Drama · Dance Group</p>
              </div>
            </div>

            <div className="glass-card px-5 py-4 rounded-lg border border-[#39FF14]/30">
              <p className="text-[#39FF14] font-mono text-xs uppercase tracking-wider mb-1">Total Prize Pool</p>
              <p className="text-[#39FF14] text-4xl font-display" style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)' }}>₹2,50,000</p>
            </div>
          </div>

          {/* Right - Form */}
          <div ref={formRef} className="lg:w-3/5">
            <div className="glass-card rounded-xl p-8 border border-[#C9A84C]/20">
              <h3 className="font-display text-2xl text-white mb-6">Registration Form</h3>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#39FF14]/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-[#39FF14]" />
                  </div>
                  <h4 className="font-display text-3xl text-white mb-2">Registered! 🎉</h4>
                  <p className="text-white/60 mb-6">Your registration has been saved. We'll send confirmation to your email.</p>
                  <button
                    className="btn-outline"
                    onClick={() => setStatus('idle')}
                  >
                    Register Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      value={formData.participant_name}
                      onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                      required
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@college.edu"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* College & ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/70 text-sm mb-1 block">College Name *</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        placeholder="Your college"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1 block">College ID Number *</label>
                      <input
                        type="text"
                        value={formData.college_id}
                        onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                        placeholder="e.g. 22A51A05XX"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Competition Select */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Competition *</label>
                    <select
                      value={formData.competition}
                      onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white input-glow transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-[#080614]">Select a competition</option>
                      {competitionOptions.map((comp) => (
                        <option key={comp} value={comp} className="bg-[#080614]">{comp}</option>
                      ))}
                    </select>
                  </div>

                  {/* Team fields (conditional) */}
                  {isTeamEvent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-[#C9A84C]/20 rounded-lg bg-[#C9A84C]/5">
                      <div>
                        <label className="text-[#C9A84C] text-sm mb-1 block">Team Name *</label>
                        <input
                          type="text"
                          value={formData.team_name}
                          onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                          placeholder="Your team name"
                          className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[#C9A84C] text-sm mb-1 block">Team Size *</label>
                        <input
                          type="number"
                          min="2"
                          max="20"
                          value={formData.team_size}
                          onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                          placeholder="Number of members"
                          className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Fee Display */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <span className="text-white/70">Entry Fee:</span>
                    <span className="text-[#C9A84C] font-display text-2xl">
                      {isTeamEvent ? '₹500' : formData.competition ? '₹200' : '—'}
                    </span>
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {status === 'loading' ? 'Registering...' : 'Submit Registration'}
                  </button>

                  <p className="text-white/30 text-xs text-center mt-2">
                    By registering, you agree to carry a valid College ID on event days.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
