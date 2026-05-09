import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, AlertCircle, RefreshCw, Download, LogOut, Check, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from '../components/PaginationControls';

export default function CheckIn() {
  const [deskUser, setDeskUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedPassId, setScannedPassId] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanError, setScanError] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });

  const scanInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (cameraActive && !libraryLoaded) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = () => {
        setLibraryLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [cameraActive, libraryLoaded]);

  useEffect(() => {
    if (cameraActive && libraryLoaded) {
      const timer = setTimeout(() => {
        try {
          const Html5Qrcode = (window as any).Html5Qrcode;
          if (!Html5Qrcode) return;

          const html5QrCode = new Html5Qrcode("reader");
          
          html5QrCode.start(
            { facingMode: "environment" }, // Prefer rear/back camera on mobile devices!
            { 
              fps: 15, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            async (decodedText: string) => {
              await handleDirectScan(decodedText);
            },
            () => {
              // silent
            }
          ).then(() => {
            scannerRef.current = html5QrCode;
          }).catch((err: any) => {
            console.error("Failed to start raw QR Scanner:", err);
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

  const handleDirectScan = async (passId: string) => {
    if (!passId) return;
    setScanError('');

    try {
      const response = await fetch(`${API_BASE_URL}/checkin_scan.php?action=get_details&pass_id=${encodeURIComponent(passId)}`);
      const data = await response.json();
      
      if (data.success) {
        setScannedData(data.data);
        playBeep('success');
        
        if (data.data.checked_in === 0) {
          await executeCheckIn(passId);
        }
      } else {
        setScanError(data.message || 'Pass ID not found.');
        playBeep('error');
        setScannedData(null);
      }
    } catch (error) {
      setScanError('Failed to verify pass. Check network connection.');
      playBeep('error');
    }
  };

  // Play simple sound effects (beep) on successful or failed scan
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
        
        // Secondary pleasant tone
        setTimeout(() => {
          const osc2 = context.createOscillator();
          const gain2 = context.createGain();
          osc2.connect(gain2);
          gain2.connect(context.destination);
          osc2.frequency.setValueAtTime(1000, context.currentTime);
          gain2.gain.setValueAtTime(0.1, context.currentTime);
          osc2.start();
          osc2.stop(context.currentTime + 0.15);
        }, 80);
      } else {
        osc.frequency.setValueAtTime(150, context.currentTime);
        gain.gain.setValueAtTime(0.2, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.35);
      }
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('ahlaad_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    // Strict restriction: only the registration desk coordinator email and the admin can access this panel
    if (userData.email !== 'desk@ahlaad.com' && userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setDeskUser(userData);
    fetchParticipants();

    // Set up polling for real-time synchronization
    const interval = setInterval(() => fetchParticipants(true), 5000);
    
    // Auto-focus scanner input
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchParticipants = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/checkin_get_all.php`);
      const data = await response.json();
      if (data.success) {
        setParticipants(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const total = data.length;
    const checkedIn = data.filter(p => p.checked_in === 1).length;
    const pending = total - checkedIn;
    setStats({ total, checkedIn, pending });
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passId = scannedPassId.trim();
    if (!passId) {
      setScanError('Please enter or scan a valid Pass ID first.');
      playBeep('error');
      return;
    }

    setScanError('');

    try {
      const response = await fetch(`${API_BASE_URL}/checkin_scan.php?action=get_details&pass_id=${encodeURIComponent(passId)}`);
      const data = await response.json();
      
      if (data.success) {
        setScannedData(data.data);
        playBeep('success');
        
        // Auto check-in if not checked in already!
        if (data.data.checked_in === 0) {
          await executeCheckIn(passId);
        }
      } else {
        setScanError(data.message || 'Pass ID not found.');
        playBeep('error');
        setScannedData(null);
      }
    } catch (error) {
      setScanError('Failed to verify pass. Check network connection.');
      playBeep('error');
    } finally {
      setScannedPassId('');
      // Refocus input
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    }
  };

  const executeCheckIn = async (passId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkin_scan.php?action=checkin&pass_id=${encodeURIComponent(passId)}`);
      const data = await response.json();
      if (data.success) {
        // Refresh scanned info state locally to show checked-in status
        setScannedData((prev: any) => prev ? { ...prev, checked_in: 1, checked_in_at: 'Just Now' } : null);
        fetchParticipants();
      } else {
        setScanError(data.message);
      }
    } catch (error) {
      setScanError('Network error executing check-in.');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'College', 'College ID', 'Role', 'Competition', 'Entry Type', 'Team Name', 'Pass ID', 'Checked In', 'Checked In At'];
    const csvRows = [headers.join(',')];

    participants.forEach(p => {
      const row = [
        `"${p.name || ''}"`,
        `"${p.email || ''}"`,
        `"${p.phone || ''}"`,
        `"${p.college || ''}"`,
        `"${p.college_id || ''}"`,
        `"${p.role || ''}"`,
        `"${p.competition || ''}"`,
        `"${p.entry_type || ''}"`,
        `"${p.team_name || ''}"`,
        `"${p.pass_id || ''}"`,
        `"${p.checked_in === 1 ? 'YES' : 'NO'}"`,
        `"${p.checked_in_at || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `ahlaad_checkin_details_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  const filteredParticipants = participants.filter(p => {
    const term = searchQuery.toLowerCase();
    const teamIdString = p.team_name ? `team-#${String(p.registration_id).padStart(3, '0')} team-${p.registration_id}` : '';
    const matchesSearch = 
      (p.name?.toLowerCase() || '').includes(term) ||
      (p.college?.toLowerCase() || '').includes(term) ||
      (p.college_id?.toLowerCase() || '').includes(term) ||
      (p.pass_id?.toLowerCase() || '').includes(term) ||
      (p.team_name?.toLowerCase() || '').includes(term) ||
      teamIdString.toLowerCase().includes(term);

    if (filter === 'checked_in') return matchesSearch && p.checked_in === 1;
    if (filter === 'pending') return matchesSearch && p.checked_in === 0;
    return matchesSearch;
  });

  // Pagination for participants table
  const pagination = usePagination(filteredParticipants, 10);

  const handleLogout = () => {
    localStorage.removeItem('ahlaad_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white font-sans bg-[#080614] relative pb-20">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3b0764]/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="relative border-b border-white/10 backdrop-blur-md bg-black/30 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(deskUser?.role === 'admin' ? '/admin' : '/')}
              className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[#C9A84C] font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Registration Desk</span>
              <h1 className="text-xl font-display text-white tracking-wide">AHLAAD Check-In Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white/80">{deskUser?.name}</p>
              <p className="text-[9px] uppercase tracking-wider text-blue-400 font-mono">{deskUser?.role} operator</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: scanner and statistics (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Real-time Statistics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Total Confirmed</p>
              <p className="text-3xl font-display text-[#C9A84C] mt-1">{stats.total}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-green-500/10 bg-green-500/5">
              <p className="text-[10px] text-green-400/50 uppercase tracking-wider font-bold">Checked In</p>
              <p className="text-3xl font-display text-green-400 mt-1">{stats.checkedIn}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-blue-500/10 bg-blue-500/5">
              <p className="text-[10px] text-blue-400/50 uppercase tracking-wider font-bold">Pending At Desk</p>
              <p className="text-3xl font-display text-blue-400 mt-1">{stats.pending}</p>
            </div>
          </div>

          {/* Core scan box */}
          <div className="glass-card p-8 rounded-3xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${cameraActive ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span className={`text-[9px] uppercase tracking-widest font-bold font-mono ${cameraActive ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {cameraActive ? 'Camera Running' : 'USB Scanner Ready'}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-display mb-2 flex items-center gap-2 text-blue-400">
              <QrCode className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} /> Check-In Scan Mode
            </h3>
            <p className="text-xs text-white/40 mb-6">
              Choose your preferred scan method below to instantly check in participants and view their credentials.
            </p>

            {/* Toggle Button for Camera Scanner vs. Manual Input */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setCameraActive(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${!cameraActive ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
              >
                ⌨️ Keyboard / USB Gun
              </button>
              <button
                type="button"
                onClick={() => setCameraActive(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${cameraActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
              >
                📷 Live Webcam QR
              </button>
            </div>

            {/* Live Camera Scanner Box */}
            {cameraActive && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/40 p-4">
                  <div id="reader" className="w-full overflow-hidden rounded-xl bg-black" />
                  
                  {!libraryLoaded && (
                    <div className="py-8 text-center text-white/40 text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading webcam scanning engine...
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-center text-white/40">
                  Allow browser camera permissions to start scanning. Hold the pass QR code steady inside the box.
                </p>
              </div>
            )}

            {/* Manual/USB Input Box */}
            {!cameraActive && (
              <form onSubmit={handleScanSubmit} className="relative">
                <input 
                  ref={scanInputRef}
                  type="text"
                  placeholder="Scan with QR gun or type Pass ID..."
                  value={scannedPassId}
                  onChange={e => setScannedPassId(e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/40 rounded-2xl px-5 py-4 text-white text-base font-mono tracking-wider placeholder:text-white/20 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all uppercase"
                  autoComplete="off"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-400 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Scan
                </button>
              </form>
            )}

            {/* Error alerts */}
            {scanError && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium">{scanError}</p>
              </div>
            )}
          </div>

          {/* Real-time Display of Scanned User Details */}
          {scannedData ? (
            <div className="glass-card p-8 rounded-3xl border border-[#C9A84C]/30 bg-gradient-to-b from-white/[0.03] to-transparent animate-in zoom-in-95 duration-300 relative overflow-hidden">
              {/* Confirmed / Checked-In indicators */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8B0000]" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[9px] font-mono font-bold rounded-full uppercase tracking-wider">
                    {scannedData.role}
                  </span>
                </div>
                {scannedData.checked_in === 1 ? (
                  <div className="flex items-center gap-1 text-green-400 font-mono text-[10px] uppercase font-bold bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Checked In
                  </div>
                ) : (
                  <button 
                    onClick={() => executeCheckIn(scannedData.pass_id)}
                    className="px-4 py-1.5 bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#39FF14] text-[10px] uppercase font-bold rounded-full hover:bg-[#39FF14]/30 transition-all"
                  >
                    Check In Now
                  </button>
                )}
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Full Name</p>
                  <p className="text-xl font-display text-white mt-0.5">{scannedData.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Pass ID</p>
                    <p className="text-xs font-mono text-[#C9A84C] font-bold mt-0.5">{scannedData.pass_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">College ID</p>
                    <p className="text-xs text-white/80 font-medium mt-0.5 truncate">{scannedData.college_id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">College / Institution</p>
                  <p className="text-xs text-white/80 font-medium mt-0.5">{scannedData.college}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Phone Number</p>
                    <p className="text-xs text-white/80 font-medium mt-0.5">{scannedData.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Email Address</p>
                    <p className="text-xs text-white/80 font-medium mt-0.5 truncate">{scannedData.email}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-6">
                  <p className="text-[10px] text-[#C9A84C] uppercase tracking-widest font-bold mb-2">Registered Competition</p>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{scannedData.competition}</p>
                      {scannedData.entry_type === 'team' && (
                        <p className="text-[10px] text-white/40 mt-1">Team: <span className="text-[#C9A84C]">{scannedData.team_name}</span></p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Team members panel if leader */}
                {scannedData.members && scannedData.members.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Team Members Detail</p>
                    <div className="space-y-2">
                      {scannedData.members.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl">
                          <div>
                            <p className="text-xs font-medium text-white">{m.name}</p>
                            <p className="text-[9px] text-white/40 font-mono mt-0.5">{m.pass_id}</p>
                          </div>
                          {m.checked_in === 1 ? (
                            <span className="text-green-400 text-[8px] uppercase font-bold tracking-wider font-mono">Checked In</span>
                          ) : (
                            <button 
                              onClick={() => executeCheckIn(m.pass_id)}
                              className="px-2 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg text-[8px] font-bold uppercase hover:bg-white/10 hover:text-white transition-all"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other registered competitions */}
                {scannedData.other_events && scannedData.other_events.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Other Registered Competitions</p>
                    <div className="space-y-2">
                      {scannedData.other_events.map((o: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl">
                          <p className="text-xs font-medium text-white/80">{o.competition}</p>
                          <span className="text-[9px] text-[#C9A84C] font-mono">{o.pass_id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-white/5 bg-white/[0.01] text-center">
              <QrCode className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-xs text-white/30 uppercase tracking-widest">No pass details loaded. Scan a pass above to display.</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Full participants directory with filters and export (7 cols) */}
        <div className="lg:col-span-7">
          
          <div className="glass-card rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-display text-white">Participants Overview</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mt-0.5">Use search or filters to verify manually</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button 
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] text-[#080614] rounded-xl hover:shadow-[0_10px_20px_rgba(201,168,76,0.2)] transition-all text-xs font-bold uppercase tracking-wider w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" /> Export Excel CSV
                </button>
                <button 
                  onClick={() => fetchParticipants(false)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  title="Reload list"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters and search box */}
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text"
                  placeholder="Search by name, ID, college..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto">
                <button 
                  onClick={() => setFilter('all')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('checked_in')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'checked_in' ? 'bg-green-500/20 text-green-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  Checked In
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Table or list view of participants */}
            {loading ? (
              <div className="p-20 text-center text-white/40">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-xs uppercase tracking-widest">Loading registration list...</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="p-20 text-center text-white/30 italic">
                No matching participants found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-white/30 uppercase font-bold tracking-wider font-mono">
                      <th className="py-4 px-6">Participant Info</th>
                      <th className="py-4 px-6">Competition</th>
                      <th className="py-4 px-6 font-mono">Pass ID</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredParticipants.map(p => (
                      <tr key={p.pass_id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white/90 group-hover:text-[#C9A84C] transition-all">{p.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{p.college_id} • {p.college}</p>
                          {p.team_name && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                                TEAM-#{String(p.registration_id).padStart(3, '0')}
                              </span>
                              <span className="text-[10px] text-[#C9A84C] font-semibold">{p.team_name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white/80 font-medium">{p.competition}</p>
                          <span className="text-[9px] uppercase tracking-wider text-white/30 font-mono">{p.role}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-[#C9A84C] font-semibold">{p.pass_id}</span>
                        </td>
                        <td className="py-4 px-6">
                          {p.checked_in === 1 ? (
                            <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[9px] font-bold uppercase">
                              Checked In
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] font-bold uppercase">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {p.checked_in === 1 ? (
                            <button 
                              onClick={() => {
                                setScannedData(p);
                                // scroll back to scan box
                                window.scrollTo({ top: 150, behavior: 'smooth' });
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg font-bold transition-all"
                            >
                              Details
                            </button>
                          ) : (
                            <button 
                              onClick={() => executeCheckIn(p.pass_id)}
                              className="px-3 py-1.5 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] rounded-lg font-bold transition-all uppercase tracking-wider text-[10px]"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </main>

      <footer className="py-8 border-t border-white/5 text-center mt-12">
        <p className="text-xs text-white/30 font-mono uppercase tracking-[0.2em] mb-1.5">
          Ahlaad 2K26 — AITAM Silver Jubilee Celebration
        </p>
        <p className="text-sm text-white/50 font-light">
          Developed by <a href="https://www.linkedin.com/in/saisateeshwarareddy/" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:text-[#E0C97F] transition-colors underline underline-offset-2 font-bold">T. Saisateeshwara Reddy</a> | Technical Trainer, IIC
        </p>
      </footer>
    </div>
  );
}
