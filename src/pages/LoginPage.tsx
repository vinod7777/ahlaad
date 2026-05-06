import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    // If already logged in, redirect
    const storedUser = localStorage.getItem('ahlaad_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === 'desk@ahlaad.com') navigate('/checkin');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost/ahlaad/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ahlaad_user', JSON.stringify(data.user));
        if (data.user.email === 'desk@ahlaad.com') {
          navigate('/checkin');
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Login failed');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Server connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#080614] flex items-center justify-center relative overflow-hidden font-display">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8B0000]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#C9A84C] transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
          
          <div className="text-center mb-10">
            <div className="inline-flex mb-6 relative">
              <SilverJubileeLogo size={64} />
              <div className="absolute -right-2 -bottom-1 bg-[#39FF14] rounded-full p-1 border-2 border-[#080614]">
                <ShieldCheck className="w-3 h-3 text-[#080614]" />
              </div>
            </div>
            <h2 className="text-3xl text-white font-display tracking-tight mb-2 uppercase tracking-[0.05em]">Portal <span className="text-gradient-gold">Access</span></h2>
            <p className="text-white/40 text-sm font-light">Enter your credentials to continue to the Ahlaad platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-white/10"
                placeholder="name@college.com"
                required
              />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-white/10"
                placeholder="••••••••"
                required
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-red-500 text-xs leading-relaxed font-medium">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              {status === 'loading' ? 'Authenticating...' : 'Access Dashboard'}
            </button>
            
            <div className="text-center mt-8 pt-8 border-t border-white/5">
              <p className="text-white/30 text-xs font-light">
                New participant? <Link to="/#register" className="text-[#C9A84C] font-bold hover:underline transition-all">Create Account</Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="text-center text-[10px] text-white/20 mt-8 font-mono uppercase tracking-[0.2em]">
          Ahlaad 2K26 — AITAM Silver Jubilee Celebration
        </p>
      </div>
    </div>
  );
}
