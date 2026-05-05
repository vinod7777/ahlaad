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
    name: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    college_id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost/ahlaad_backend/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({
          name: '', email: '', password: '', phone: '', college: '', college_id: '',
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
              Join the <span className="text-gradient-gold">Celebration</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-md">
              Create your account to participate in Ahlaad 2K26. 
              Once registered, you can log in to your dashboard to manage your event participations.
            </p>

            <div className="space-y-4 mb-8">
              <div className="glass-card px-5 py-4 rounded-lg border border-[#C9A84C]/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-white font-display">Direct Registration</p>
                  <p className="text-white/40 text-sm">One account for all events</p>
                </div>
              </div>
            </div>

            <div className="glass-card px-5 py-4 rounded-lg border border-[#C9A84C]/30">
              <p className="text-[#C9A84C] font-mono text-xs uppercase tracking-wider mb-1">Total Prize Pool</p>
              <p className="text-[#C9A84C] text-4xl font-display" style={{ textShadow: '0 0 20px rgba(201,168,76,0.5)' }}>₹2,50,000</p>
            </div>
          </div>

          {/* Right - Form */}
          <div ref={formRef} className="lg:w-3/5">
            <div className="glass-card rounded-xl p-8 border border-[#C9A84C]/20">
              <h3 className="font-display text-2xl text-white mb-6">Direct Registration</h3>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#39FF14]/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-[#39FF14]" />
                  </div>
                  <h4 className="font-display text-3xl text-white mb-2">Account Created! 🎉</h4>
                  <p className="text-white/60 mb-6">Your account is ready. You can now log in to the dashboard.</p>
                  <button
                    className="btn-primary"
                    onClick={() => window.location.href = '#login'}
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                  {/* Password */}
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Create Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 input-glow transition-all"
                      minLength={6}
                      required
                    />
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
                    {status === 'loading' ? 'Creating Account...' : 'Register Directly'}
                  </button>

                  <p className="text-white/30 text-xs text-center mt-2">
                    Already have an account? <a href="#login" className="text-[#C9A84C] hover:underline">Log in</a>
                  </p>
                </form>
              )}
  );
}
