import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, AlertCircle, RefreshCw, CheckCircle2, Trophy, School, Hash, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';
import SilverJubileeLogo from '../components/SilverJubileeLogo';

export default function PublicScanner() {
  const [scannedPassId, setScannedPassId] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const scannerRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load QR Scanner library dynamically
    if (!(window as any).Html5Qrcode) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = () => setLibraryLoaded(true);
      document.body.appendChild(script);
    } else {
      setLibraryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (cameraActive && libraryLoaded) {
      const timer = setTimeout(() => {
        try {
          const Html5Qrcode = (window as any).Html5Qrcode;
          if (!Html5Qrcode) return;

          const html5QrCode = new Html5Qrcode("reader");

          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            async (decodedText: string) => {
              handlePassSearch(decodedText);
              setCameraActive(false); // Stop after successful scan
            },
            () => { /* silent */ }
          ).then(() => {
            scannerRef.current = html5QrCode;
          }).catch((err: any) => {
            console.error("Failed to start QR Scanner:", err);
          });

        } catch (err) {
          console.error("Failed to initialize QR Scanner:", err);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            const currentScanner = scannerRef.current;
            scannerRef.current = null;
            currentScanner.stop().catch((e: any) => console.warn("Scanner stop warning:", e));
          } catch (e) {
            console.warn("Scanner clean up warning:", e);
          }
        }
      };
    }
  }, [cameraActive, libraryLoaded]);

  const handlePassSearch = async (passId: string) => {
    if (!passId.trim()) return;
    setLoading(true);
    setScanError('');
    setScannedData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/checkin_scan.php?action=get_details&pass_id=${encodeURIComponent(passId.trim())}`);
      const data = await response.json();

      if (data.success) {
        setScannedData(data.data);
        playBeep('success');
      } else {
        setScanError(data.message || 'Pass ID not found or invalid.');
        playBeep('error');
      }
    } catch (error) {
      setScanError('Connection error. Please try again.');
      playBeep('error');
    } finally {
      setLoading(false);
      setScannedPassId('');
    }
  };

  const playBeep = (type: 'success' | 'error') => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(800, context.currentTime);
        gain.gain.setValueAtTime(0.1, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(150, context.currentTime);
        gain.gain.setValueAtTime(0.2, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.3);
      }
    } catch (e) { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-[#080614] text-white font-display relative pb-20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C9A84C]/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase tracking-[0.05em]">Pass <span className="text-[#C9A84C]">Scanner</span></h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">Ahlaad 2K26 Public Verification</p>
            </div>
          </div>
          <SilverJubileeLogo size={40} />
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            VERIFY <span className="text-gradient-gold">PASS</span> DETAILS
          </h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto font-light leading-relaxed">
            Scan the QR code on your festival pass or enter the Pass ID manually to view participant credentials.
          </p>
        </div>

        {/* Scan Controls */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#C9A84C]/10 transition-colors" />

          <div className="relative z-10 space-y-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Enter Pass ID (e.g. PASS-M-XXXXXX)"
                  value={scannedPassId}
                  onChange={(e) => setScannedPassId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handlePassSearch(scannedPassId)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-mono tracking-wider focus:outline-none focus:border-[#C9A84C]/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
              <button
                onClick={() => handlePassSearch(scannedPassId)}
                disabled={loading}
                className="px-6 py-4 bg-[#C9A84C] text-[#080614] rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#E0C97F] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">OR</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border transition-all duration-300 font-bold uppercase tracking-widest text-[11px] ${cameraActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_10px_30px_rgba(59,130,246,0.1)] hover:bg-blue-500/20'}`}
            >
              <QrCode className="w-5 h-5" />
              {cameraActive ? 'Stop Scanner' : 'Open Live Camera'}
            </button>

            {cameraActive && (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="relative border border-white/10 rounded-[2rem] overflow-hidden bg-black/40 p-4">
                  <div id="reader" className="w-full overflow-hidden rounded-2xl bg-black" />
                  {!libraryLoaded && (
                    <div className="py-20 text-center text-white/30 italic">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                      Initializing scanner...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {scanError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3 animate-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{scanError}</p>
          </div>
        )}

        {/* Scanned Data Results */}
        {scannedData && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="glass-card p-1 rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#C9A84C]/20 via-transparent to-blue-500/10 relative">
              <div className="bg-[#080614]/90 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">


                  {/* Info Section */}
                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <div>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white/40 mb-3 inline-block">
                        {scannedData.role || 'Participant'}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-white">{scannedData.name}</h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                        <div className="flex items-center gap-2 text-[#C9A84C] font-mono text-sm font-bold">
                          <QrCode className="w-4 h-4" />
                          {scannedData.pass_id}
                        </div>
                        {(scannedData.tid || scannedData.team_id || scannedData.registration_id) && (
                          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                            TID: {scannedData.tid || scannedData.team_id || (scannedData.registration_id ? `#${String(scannedData.registration_id).padStart(3, '0')}` : '')}
                          </div>
                        )}
                      </div>
                    </div>
                    {scannedData.checked_in === 1 && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-[#080614] shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-white/30">
                          <School className="w-3.5 h-3.5" />
                          <span className="text-[9px] uppercase tracking-widest font-bold">Institution</span>
                        </div>
                        <p className="text-sm font-medium text-white/80">{scannedData.college}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-white/30">
                          <Trophy className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span className="text-[9px] uppercase tracking-widest font-bold">Main Competition</span>
                        </div>
                        <p className="text-sm font-bold text-[#C9A84C]">{scannedData.competition}</p>
                        {scannedData.team_name && (
                          <p className="text-[10px] text-white/40">Team: {scannedData.team_name}</p>
                        )}
                      </div>
                    </div>

                    {scannedData.other_events && scannedData.other_events.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-white/20 mb-3">Other Registrations</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          {scannedData.other_events.map((e: any, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-medium text-white/60">
                              {e.competition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 text-center mt-20 px-6">
        <p className="text-xs text-white/30 font-mono uppercase tracking-[0.2em] mb-2">
          Official AHLAAD 2K26 Pass Verification System
        </p>
        <p className="text-sm text-white/50 font-light">
          AITAM Silver Jubilee Celebration | <span className="text-[#C9A84C] font-bold">March 2026</span>
        </p>
      </footer>
    </div>
  );
}
