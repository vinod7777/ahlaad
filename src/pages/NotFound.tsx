import { useNavigate } from 'react-router-dom';
import { Home, LogIn, ChevronLeft, AlertCircle, QrCode } from 'lucide-react';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080614] flex items-center justify-center relative overflow-hidden font-display">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C9A84C]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#8B0000]/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        <div className="mb-12 animate-in zoom-in duration-700">
          <SilverJubileeLogo size={120} />
        </div>

        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700 delay-200">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Error 404 — Page Not Found</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none mb-4">
            LOST IN <span className="text-gradient-gold">SPACE?</span>
          </h1>

          <p className="text-white/40 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed">
            It seems the page you are looking for has taken an early exit from the festival. Let's get you back to the main stage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <button
              onClick={() => navigate('/')}
              className="group relative px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <Home className="w-5 h-5 text-white/40 group-hover:text-[#C9A84C] transition-colors" />
                <span className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white">Home</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/scan-pass')}
              className="group relative px-6 py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl transition-all duration-300 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <QrCode className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold uppercase tracking-widest text-blue-400">Pass Scan</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(201,168,76,0.2)] hover:shadow-[0_20px_40px_rgba(201,168,76,0.3)] hover:-translate-y-1 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <LogIn className="w-5 h-5 text-[#080614]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#080614]">Portal Login</span>
              </div>
            </button>
          </div>

          <div className="pt-12">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs uppercase tracking-widest">Return to previous page</span>
            </button>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.3em]">
            Ahlaad 2K26 — Advanced Routing Terminal
          </p>
          <p className="text-sm text-white/50 font-light">
            Developed by <a href="https://www.linkedin.com/in/saisateeshwarareddy/" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:text-[#E0C97F] transition-colors underline underline-offset-2 font-bold">T. Saisateeshwara Reddy</a> | Technical Trainer, IIC
          </p>
        </div>
      </div>
    </div>
  );
}
