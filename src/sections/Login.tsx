import { useRef, useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost/ahlaad_backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ahlaad_user', JSON.stringify(data.user));
        // Redirect based on role
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
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
    <section id="login" ref={sectionRef} className="py-[10vh] bg-[#080614]">
      <div className="max-w-md mx-auto px-6">
        <div className="glass-card p-8 rounded-xl border border-[#C9A84C]/20 text-center">
          <h2 className="font-display text-4xl text-white mb-2">Login</h2>
          <p className="text-white/50 mb-8">Access your Ahlaad Dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white input-glow"
                required
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white input-glow"
                required
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {status === 'loading' ? 'Logging in...' : 'Login Now'}
            </button>
            
            <p className="text-white/30 text-xs text-center mt-4">
              Don't have an account? <a href="#register" className="text-[#C9A84C] hover:underline">Register here</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
