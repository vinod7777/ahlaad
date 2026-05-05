import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Plus, CheckCircle, Clock, MapPin, QrCode, CreditCard, Menu, X } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState({ competition: '', entry_type: 'individual', team_name: '', team_size: 2, utr_id: '' });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'events' | 'timeline' | 'pass'>('overview');

  const navigate = useNavigate();

  const competitions = [
    'Short Films', 'Rock Band', 'Photography', 'Singing', 'Cover Song',
    'Dance — Classical Solo', 'Dance — Classical Group',
    'Dance — Western Solo', 'Dance — Western Group',
    'Drama / Skit', 'Painting', 'Handicrafts'
  ];

  const teamEvents = ['Short Films', 'Rock Band', 'Dance — Classical Group', 'Dance — Western Group', 'Drama / Skit'];

  useEffect(() => {
    const storedUser = localStorage.getItem('ahlaad_user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      setUser(userData);
      fetchDashboardData(userData.id);
    }
  }, [navigate]);

  const fetchDashboardData = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost/ahlaad/backend/get_user_dashboard_data.php?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setTimeline(data.timeline);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch failed', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ahlaad_user');
    navigate('/');
  };

  const handleRegisterEvent = async () => {
  const handleRegisterEvent = async () => {
    if (!newReg.utr_id || !paymentFile) {
      alert('Please provide UTR ID and payment screenshot');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('competition', newReg.competition);
      formData.append('entry_type', newReg.entry_type);
      formData.append('team_name', newReg.team_name || '');
      formData.append('team_size', newReg.team_size.toString());
      formData.append('utr_id', newReg.utr_id);
      formData.append('payment_proof', paymentFile);

      const response = await fetch('http://localhost/ahlaad/backend/register_event.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setShowRegModal(false);
        setNewReg({ competition: '', entry_type: 'individual', team_name: '', team_size: 2, utr_id: '' });
        setPaymentFile(null);
        fetchDashboardData(user.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Registration failed');
    }
  };

  const handleAddMember = async (regId: number) => {
    if (!newMemberName) return;
    try {
      const response = await fetch('http://localhost/ahlaad/backend/add_team_member.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId, member_name: newMemberName })
      });
      const data = await response.json();
      if (data.success) {
        setNewMemberName('');
        fetchDashboardData(user.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to add member');
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user || loading) return <div className="min-h-screen bg-[#080614] flex items-center justify-center text-white font-display">Loading Ahlaad Experience...</div>;

  return (
    <div className="min-h-screen bg-[#080614] text-white flex">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 border-r border-white/10 bg-[#0d0b1e] p-6 flex flex-col fixed h-full z-[200] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <img src="/ahlaad.png" alt="Ahlaad" className="h-8" />
            <span className="font-display text-xl tracking-wider">AHLAAD</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button 
            onClick={() => { setActiveTab('registrations'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'registrations' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">My Events</span>
          </button>
          <button 
            onClick={() => { setActiveTab('events'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Join Event</span>
          </button>
          <button 
            onClick={() => { setActiveTab('timeline'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'timeline' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Live Timeline</span>
          </button>

          <button 
            onClick={() => { setActiveTab('pass'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pass' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <QrCode className="w-5 h-5" />
            <span className="font-medium">Entry Pass</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#0d0b1e]/50 backdrop-blur-md sticky top-0 z-[50]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-white/60 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-display text-lg md:text-xl uppercase tracking-widest text-[#C9A84C]">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white/90">{user.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Participant</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
              <User className="w-5 h-5 text-[#C9A84C]" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-4">
                <div className="glass-card p-8 rounded-3xl border border-[#C9A84C]/20 relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full bg-[#C9A84C]/10 border-2 border-[#C9A84C]/30 flex items-center justify-center mb-6 relative mx-auto">
                    <User className="w-12 h-12 text-[#C9A84C]" />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#39FF14] rounded-full border-4 border-[#080614]" />
                  </div>
                  <h3 className="text-2xl font-display mb-1 text-center">{user.name}</h3>
                  <p className="text-white/40 text-sm mb-6 text-center">{user.college}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-white/40 uppercase tracking-widest">Student ID</span>
                      <span className="text-xs font-mono text-[#C9A84C]">{user.college_id}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-white/40 uppercase tracking-widest">Events Joined</span>
                      <span className="text-xs font-bold">{registrations.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {registrations.some(r => r.status === 'confirmed') ? (
                  <div className="glass-card p-8 rounded-3xl border border-[#39FF14]/20 bg-[#39FF14]/5 overflow-hidden relative group">
                    <div className="flex flex-col md:flex-row items-center gap-8 relative">
                      <div className="p-4 bg-white rounded-2xl shadow-2xl">
                        <QrCode className="w-32 h-32 text-[#080614]" />
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <span className="px-3 py-1 bg-[#39FF14]/20 rounded-full text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mb-4 inline-block">Verified Entry</span>
                        <h4 className="text-3xl font-display mb-2">Digital Pass Active</h4>
                        <p className="text-white/40 text-sm mb-6">Your registration for {registrations.find(r => r.status === 'confirmed')?.competition} has been approved. Show this at the entry gate.</p>
                        <button 
                          onClick={() => setActiveTab('pass')}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          View Full Pass
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Clock className="w-12 h-12 text-white/20 mb-4" />
                    <h4 className="text-xl font-display mb-2 text-white/60">Pass Pending Approval</h4>
                    <p className="text-white/40 text-sm max-w-md mx-auto mb-6">Your digital QR pass will be generated once the admin confirms your registration fee and details.</p>
                    <button 
                      onClick={() => setActiveTab('registrations')}
                      className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Check Registration Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display">My <span className="text-gradient-gold">Registrations</span></h3>
              </div>

              {registrations.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl border border-white/10 text-center">
                  <Plus className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-display uppercase tracking-widest">No registrations found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {registrations.map((reg) => (
                    <div 
                      key={reg.id} 
                      onClick={() => setSelectedReg(reg)}
                      className="glass-card p-6 rounded-2xl border border-white/10 hover:border-[#C9A84C]/30 transition-all group cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {reg.status}
                            </span>
                            <span className="text-[10px] text-white/20">{reg.registration_date}</span>
                          </div>
                          <h4 className="text-xl font-display mb-1">{reg.competition}</h4>
                          <p className="text-xs text-white/40 uppercase tracking-[0.2em]">{reg.entry_type} {reg.entry_type === 'team' && `— ${reg.team_name}`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-2xl font-display mb-8">Available <span className="text-gradient-gold">Competitions</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitions.map(comp => (
                  <div key={comp} className="glass-card p-6 rounded-3xl border border-white/10 group hover:border-[#C9A84C]/30 transition-all flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-display mb-2">{comp}</h4>
                      <p className="text-white/40 text-xs mb-6">Join this competition and showcase your talent at Ahlaad 2K26.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const isTeam = teamEvents.includes(comp);
                        setNewReg({ ...newReg, competition: comp, entry_type: isTeam ? 'team' : 'individual' });
                        setShowRegModal(true);
                      }}
                      className="w-full py-3 rounded-xl border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-[#080614] transition-all"
                    >
                      Register Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display">Live <span className="text-gradient-gold">Timeline</span></h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20">
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-wider">Updates Live</span>
                </div>
              </div>

              <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#C9A84C] before:via-[#8B0000] before:to-transparent">
                {timeline.map((item, idx) => (
                  <div key={item.id} className="relative animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#080614] border-2 border-[#C9A84C] shadow-[0_0_10px_rgba(201,168,76,0.5)] z-10" />
                    
                    <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-[#C9A84C]/20 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-mono text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded border border-[#C9A84C]/20">
                              {item.time || item.time_slot}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${item.status === 'live' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-white/10 text-white/40'}`}>
                              {item.status}
                            </span>
                          </div>
                          <h4 className="text-xl font-display text-white/90 mb-2">{item.event_name || item.name}</h4>
                          <div className="flex items-center gap-4 text-white/40">
                            <p className="text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-[#C9A84C]" /> {item.location || item.venue}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest flex items-center gap-2 border-l border-white/10 pl-4">
                              <Calendar className="w-3 h-3" /> {item.category || 'Main Stage'}
                            </p>
                          </div>
                        </div>
                        
                        {item.status === 'live' && (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full border border-[#39FF14]/30 bg-[#39FF14]/5 flex items-center justify-center">
                              <Plus className="w-5 h-5 text-[#39FF14] animate-spin-slow" />
                            </div>
                            <span className="text-[10px] font-bold text-[#39FF14] uppercase">Live Now</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pass' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto">
              <h3 className="text-2xl font-display mb-8 text-center">Your Official <span className="text-gradient-gold">Entry Pass</span></h3>
              
              {registrations.some(r => r.status === 'confirmed') ? (
                <div className="relative group">
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#C9A84C]/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#8B0000]/20 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative glass-card rounded-[2rem] border border-[#C9A84C]/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Ticket Top Section */}
                    <div className="p-10 bg-[#0d0b1e] relative">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      
                      {/* Side Punches */}
                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#080614] border border-white/10 z-10" />
                      <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#080614] border border-white/10 z-10" />

                      <div className="flex justify-between items-start mb-10 relative">
                        <div>
                          <p className="text-[#C9A84C] font-mono text-[10px] uppercase tracking-[0.3em] mb-2">Ahlaad 2K26 • Entry Pass</p>
                          <h4 className="text-4xl font-display text-white tracking-tight">SILVER <span className="text-gradient-gold">JUBILEE</span></h4>
                        </div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-2 backdrop-blur-sm shadow-xl">
                           <img src="/ahlaad.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10 relative">
                        <div>
                          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] mb-1 font-bold">Participant Name</p>
                          <p className="text-white font-display text-lg tracking-wide truncate">{user.name}</p>
                        </div>
                        <div>
                          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] mb-1 font-bold">Registration ID</p>
                          <p className="text-[#C9A84C] font-mono text-sm font-bold">{user.college_id}</p>
                        </div>
                        <div className="col-span-2 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-[#C9A84C]" />
                              <div>
                                <p className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Date & Venue</p>
                                <p className="text-[11px] text-white/70">June 26-27, 2026 • AITAM Campus</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Entry Status</p>
                              <p className="text-[11px] text-[#39FF14] font-bold">ALL ACCESS</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Divider */}
                    <div className="relative h-px border-t border-dashed border-white/20 mx-10">
                      <div className="absolute -left-10 -top-4 w-8 h-8 rounded-full bg-[#080614]" />
                      <div className="absolute -right-10 -top-4 w-8 h-8 rounded-full bg-[#080614]" />
                    </div>

                    {/* Ticket Bottom Section */}
                    <div className="p-10 bg-[#0d0b1e]/95 flex flex-col items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#C9A84C]/5 to-transparent pointer-events-none" />
                      
                      <div className="relative group mb-8">
                        <div className="absolute inset-0 bg-[#C9A84C]/20 blur-2xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative p-6 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform group-hover:scale-[1.02] transition-transform duration-500">
                          <QrCode className="w-40 h-40 text-[#080614]" />
                        </div>
                      </div>

                      <div className="text-center relative">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                          <p className="font-mono text-xs text-white/80 tracking-[0.4em]">ALH-2K26-{user.id + 1000}</p>
                        </div>
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] max-w-[200px]">Present this QR code at the event entrance for validation.</p>
                      </div>
                      
                      <button 
                        onClick={() => window.print()}
                        className="mt-10 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] text-[#080614] rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:shadow-[0_10px_30px_rgba(201,168,76,0.3)] active:scale-95 transition-all"
                      >
                        <CreditCard className="w-5 h-5" /> Get Digital Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 rounded-[2rem] border border-white/10 bg-white/5 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-10 h-10 text-white/20" />
                  </div>
                  <h4 className="text-2xl font-display mb-4 text-white/60">No Pass Generated Yet</h4>
                  <p className="text-white/40 text-sm max-w-sm mx-auto mb-8">
                    Your digital entry pass is created automatically once at least one of your competition registrations is **Confirmed** by the organizers.
                  </p>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="btn-primary px-8"
                  >
                    Register for Events
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
          <div className="glass-card w-full max-w-lg p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300">
            <h3 className="font-display text-2xl mb-6">Join <span className="text-gradient-gold">Competition</span></h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Select Competition</label>
                <select 
                  value={newReg.competition}
                  onChange={(e) => {
                    const comp = e.target.value;
                    const isTeam = teamEvents.includes(comp);
                    setNewReg({ ...newReg, competition: comp, entry_type: isTeam ? 'team' : 'individual' });
                  }}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#080614]">Choose event...</option>
                  {competitions.map(c => <option key={c} value={c} className="bg-[#080614]">{c}</option>)}
                </select>
              </div>

              {newReg.entry_type === 'team' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Team Name</label>
                    <input 
                      type="text" 
                      value={newReg.team_name}
                      onChange={(e) => setNewReg({ ...newReg, team_name: e.target.value })}
                      placeholder="e.g. Dream Team"
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Team Size</label>
                    <input 
                      type="number"
                      min="2"
                      max="20"
                      value={newReg.team_size}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setNewReg({ ...newReg, team_size: isNaN(val) ? 0 : val });
                      }}
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Payment UTR ID *</label>
                  <input 
                    type="text" 
                    value={newReg.utr_id}
                    onChange={(e) => setNewReg({ ...newReg, utr_id: e.target.value })}
                    placeholder="12-digit UTR number"
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block font-medium">Payment Screenshot *</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-[#C9A84C]/50 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#C9A84C]/10 file:text-[#C9A84C] hover:file:bg-[#C9A84C]/20"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 uppercase text-[10px] tracking-widest">Registration Fee</span>
                  </div>
                  <span className="text-[#C9A84C] font-display text-xl">{newReg.entry_type === 'team' ? '₹500' : '₹200'}</span>
                </div>
                <p className="text-[10px] text-white/20 mt-2 italic">Scan the QR at the registration desk or pay via the official UPI ID before uploading.</p>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition-all text-sm font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRegisterEvent}
                  className="flex-1 py-3 bg-[#C9A84C] text-[#080614] rounded-xl font-bold hover:opacity-90 transition-all text-sm"
                >
                  Confirm & Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8B0000]" />
            
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl mb-1 uppercase tracking-wider">{selectedReg.competition}</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest">{selectedReg.status} Registration</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Entry Type</p>
                  <p className="text-sm font-bold text-white/80">{selectedReg.entry_type}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Fee Paid</p>
                  <p className="text-sm font-bold text-[#C9A84C]">₹{selectedReg.fee}</p>
                </div>
              </div>

              {selectedReg.entry_type === 'team' && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-4 font-bold">Team: {selectedReg.team_name}</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] text-[#C9A84C] font-bold shrink-0">
                        {user.name[0]}
                      </div>
                      <p className="text-xs font-bold text-white/90">{user.name} <span className="text-[8px] text-white/20 ml-2 font-normal uppercase tracking-widest">(Lead)</span></p>
                    </div>
                    {selectedReg.members?.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white/80 font-bold shrink-0">
                          {m.member_name[0]}
                        </div>
                        <p className="text-xs font-bold text-white/90">{m.member_name}</p>
                      </div>
                    ))}
                  </div>

                  {(selectedReg.members?.length || 0) < (selectedReg.team_size - 1) && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Add Team Member</p>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Member Name"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                        />
                        <button 
                          onClick={() => handleAddMember(selectedReg.id)}
                          className="px-4 py-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl text-xs font-bold hover:bg-[#C9A84C]/20 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedReg.status === 'confirmed' && (
                <div className="p-6 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/20 text-center">
                  <QrCode className="w-24 h-24 text-white mx-auto mb-4 opacity-80" />
                  <p className="font-mono text-xs text-[#39FF14] tracking-widest uppercase">Pass ID: {selectedReg.pass_id || 'ALH-REF-102'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedReg(null)}
              className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
    