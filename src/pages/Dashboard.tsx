import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, LogOut, CheckCircle, Printer, User, Plus, Menu, X, AlertCircle, Clock, Trophy, Calendar, Users } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { usePagination } from '../hooks/usePagination';
import PaginationControls from '../components/PaginationControls';
import { useNotification } from '../components/Notification';

const PassCard = ({ title, name, id, passId, role }: { title: string, name: string, id: string, passId: string, role: string }) => (
  <div className="relative group pass-card-container mb-8 md:h-[30vh] md:min-h-[220px] h-auto">
    <div className="h-full flex flex-col md:flex-row glass-card rounded-[2rem] border border-[#C9A84C]/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0d0b1e]">
      {/* Ticket Left Section - Details */}
      <div className="flex-1 md:flex-[0.7] p-6 md:p-8 relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-white/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex justify-between items-start gap-4 mb-6 md:mb-0">
          <div>
            <p className="text-[#C9A84C] font-mono text-[10px] uppercase tracking-[0.3em] mb-1">Ahlaad 2K26 • {title}</p>
            <h4 className="text-2xl md:text-3xl font-display text-white tracking-tight">ENTRY <span className="text-gradient-gold">PASS</span></h4>
          </div>
          <img src="ahlaad.png" alt="Logo" className="h-8 opacity-40 grayscale brightness-200 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 md:mb-0">
          <div>
            <p className="text-white/20 text-[8px] uppercase tracking-[0.2em] mb-1 font-bold">Participant</p>
            <p className="text-white font-display text-base md:text-lg tracking-wide truncate">{name}</p>
          </div>
          <div>
            <p className="text-white/20 text-[8px] uppercase tracking-[0.2em] mb-1 font-bold">ID / Role</p>
            <p className="text-[#C9A84C] font-mono text-xs font-bold truncate">{id}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 gap-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-[#39FF14] shrink-0" />
            <div>
              <p className="text-[10px] text-[#39FF14] font-bold tracking-wider">VERIFIED {role}</p>
              <p className="text-[8px] text-white/30 uppercase">Authorized Access</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/70 font-mono tracking-tighter truncate max-w-[120px]">{passId}</p>
          </div>
        </div>

        {/* Notches for Desktop */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#080614] z-10 hidden md:block" />
        {/* Notches for Mobile */}
        <div className="absolute -left-3 bottom-0 translate-y-1/2 w-6 h-6 rounded-full bg-[#080614] z-10 md:hidden" />
        <div className="absolute -right-3 bottom-0 translate-y-1/2 w-6 h-6 rounded-full bg-[#080614] z-10 md:hidden" />
      </div>

      {/* Ticket Right Section - QR */}
      <div className="flex-1 md:flex-[0.3] bg-white p-6 flex flex-col items-center justify-center relative">
        <div className="relative mb-4 group-hover:scale-110 transition-transform duration-500 w-24 h-24">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(passId)}`}
            alt="Pass QR"
            className="w-full h-full object-contain"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-6 py-2 bg-[#080614] text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-[#080614] transition-all active:scale-95 shadow-md"
        >
          <Printer className="w-4 h-4" /> Print
        </button>

        {/* Notches for Desktop */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#080614] z-10 hidden md:block" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState({ competition: '', entry_type: 'individual', team_name: '', team_size: 4, utr_id: '' });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', college: '', college_id: '' });
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'events' | 'pass'>('overview');
  const [regStep, setRegStep] = useState(1);
  const [updatingRegId, setUpdatingRegId] = useState<number | null>(null);
  const [activePassSubTab, setActivePassSubTab] = useState<Record<number, 'lead' | 'members'>>({});

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const competitions = [
    'Short Films', 'Rock Band', 'Photography', 'Singing', 'Cover Song',
    'Dance — Classical Solo', 'Dance — Classical Group',
    'Dance — Western Solo', 'Dance — Western Group',
    'Drama / Skit', 'Painting', 'Handicrafts'
  ];

  const teamEvents = ['Short Films', 'Rock Band', 'Dance — Classical Group', 'Dance — Western Group', 'Drama / Skit'];

  const eventGuidelines: { [key: string]: string[] } = {
    'Short Films': ['Duration: 5-10 mins', 'Theme: Open', 'Format: MP4/MOV', 'No plagiarism'],
    'Rock Band': ['Duration: 15 mins total', 'Min 4 members', 'Electronic instruments allowed', 'Original/Cover'],
    'Photography': ['Theme: Campus Life', 'Unedited RAW + JPEG', 'Mobile/DSLR allowed'],
    'Singing': ['Classical/Light music', 'Time limit: 4 mins', 'Karaoke allowed'],
    'Cover Song': ['Live instruments preferred', 'Time: 5 mins', 'Vocal clarity is key'],
    'Dance — Classical Solo': ['Standard classical forms only', 'Costume mandatory', 'Time: 6 mins'],
    'Dance — Classical Group': ['Min 4 members', 'Synchronization focus', 'Time: 8 mins'],
    'Dance — Western Solo': ['Hip-hop/Freestyle/Contemporary', 'No vulgarity', 'Time: 4 mins'],
    'Dance — Western Group': ['Min 5 members', 'Energetic performance', 'Time: 7 mins'],
    'Drama / Skit': ['Theme: Social Awareness', 'Language: English/Telugu', 'Time: 12 mins'],
    'Painting': ['Sheet provided', 'Topic on-spot', 'Bring own colors/brushes'],
    'Handicrafts': ['Eco-friendly materials only', 'Time: 2 hours', 'On-spot creation']
  };

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

      // Set up polling for real-time synchronization
      const interval = setInterval(() => fetchDashboardData(userData.id), 5000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const registrationsPagination = usePagination(registrations, 6);

  useEffect(() => {
    if (showRegModal || selectedReg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showRegModal, selectedReg]);

  const fetchDashboardData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_user_dashboard_data.php?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
        // Live auto-sync: instantly update the opened modal view with the newly fetched data (including added members)
        setSelectedReg((prevSelected: any) => {
          if (!prevSelected) return null;
          const updated = data.registrations.find((r: any) => r.id === prevSelected.id);
          return updated || prevSelected;
        });
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('ahlaad_user', JSON.stringify(data.user));
        }
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
    if (newReg.entry_type === 'team') {
      if (!newReg.team_name.trim()) {
        showNotification('Please enter your Team/Group Name for this team registration.', 'warning');
        return;
      }
      if (newReg.team_size < 4 || newReg.team_size > 12) {
        showNotification('Group size must be between 4 and 12 members.', 'warning');
        return;
      }
    }
    
    const utrTrimmed = newReg.utr_id.trim();
    if (!utrTrimmed) {
      showNotification('Please provide UTR ID.', 'warning');
      return;
    }
    if (!/^\d{12}$/.test(utrTrimmed)) {
      showNotification('UTR ID must be exactly 12 numeric digits.', 'warning');
      return;
    }
    
    if (!paymentFile && !updatingRegId) {
      showNotification('Please upload a payment screenshot.', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('competition', newReg.competition);
      formData.append('entry_type', newReg.entry_type);
      formData.append('team_name', newReg.entry_type === 'team' ? newReg.team_name.trim() : 'Individual');
      formData.append('team_size', newReg.entry_type === 'team' ? newReg.team_size.toString() : '1');
      formData.append('utr_id', utrTrimmed);
      if (paymentFile) {
        formData.append('payment_proof', paymentFile);
      }
      if (updatingRegId) {
        formData.append('registration_id', updatingRegId.toString());
      }

      const response = await fetch(`${API_BASE_URL}/register_event.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setShowRegModal(false);
        setNewReg({ competition: '', entry_type: 'individual', team_name: '', team_size: 4, utr_id: '' });
        setPaymentFile(null);
        setUpdatingRegId(null);
        setRegStep(1);
        setActiveTab('registrations');
        fetchDashboardData(user.id);
        showNotification('Registration submitted successfully! Waiting for admin approval.', 'success');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Registration failed', 'error');
    }
  };

  const handleAddMember = async (regId: number) => {
    const memberNameTrimmed = newMember.name.trim();
    const emailTrimmed = newMember.email.trim();
    const phoneTrimmed = newMember.phone.trim();
    const collegeTrimmed = newMember.college.trim();
    const collegeIdTrimmed = newMember.college_id.trim();

    if (!memberNameTrimmed || !emailTrimmed || !phoneTrimmed || !collegeTrimmed || !collegeIdTrimmed) {
      showNotification("Please fill in all member details.", 'warning');
      return;
    }

    if (memberNameTrimmed.length < 3 || !/^[a-zA-Z\s]+$/.test(memberNameTrimmed)) {
      showNotification("Member Name must be at least 3 characters and contain only letters and spaces.", 'warning');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      showNotification("Please enter a valid email address for the team member.", 'warning');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneTrimmed)) {
      showNotification("Phone Number must be a valid 10-digit Indian mobile number.", 'warning');
      return;
    }

    if (collegeTrimmed.length < 3) {
      showNotification("College Name must be at least 3 characters.", 'warning');
      return;
    }

    if (collegeIdTrimmed.length < 2) {
      showNotification("College ID must be at least 2 characters.", 'warning');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/add_team_member.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: regId,
          member_name: memberNameTrimmed,
          email: emailTrimmed,
          phone: phoneTrimmed,
          college: collegeTrimmed,
          college_id: collegeIdTrimmed
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Team member added successfully!', 'success');
        setNewMember({ name: '', email: '', phone: '', college: '', college_id: '' });
        fetchDashboardData(user.id);
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to add member', 'error');
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
            <img src="ahlaad.png" alt="Ahlaad" className="h-8" />
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
            onClick={() => { setActiveTab('pass'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pass' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <QrCode className="w-5 h-5" />
            <span className="font-medium">Entry Pass</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10 space-y-4">
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
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
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

        <div className="p-4 sm:p-8">
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
                {registrations.length > 0 ? (
                  registrations.map((reg) => (
                    reg.status === 'confirmed' ? (
                      <div key={reg.id} className="glass-card p-8 rounded-3xl border border-[#39FF14]/20 bg-[#39FF14]/5 overflow-hidden relative group animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative">
                          <div className="p-4 bg-white rounded-2xl shadow-2xl shrink-0">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reg.pass_id || '')}`} 
                              alt="Pass QR" 
                              className="w-28 h-28 object-contain"
                            />
                          </div>
                          <div className="text-center md:text-left flex-1">
                            <span className="px-3 py-1 bg-[#39FF14]/20 rounded-full text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mb-4 inline-block">Verified Entry</span>
                            <h4 className="text-3xl font-display mb-2">{reg.competition}</h4>
                            <p className="text-white/40 text-sm mb-6">Your registration has been approved. Show this QR code at the entry gate.</p>
                            <button
                              onClick={() => { setSelectedReg(reg); setActiveTab('pass'); }}
                              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                            >
                              View Full Pass
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : reg.status === 'cancelled' ? (
                      <div key={reg.id} className="glass-card p-8 rounded-3xl border border-red-500/30 bg-red-500/5 relative overflow-hidden animate-in fade-in duration-500 w-full text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10" />
                        <div className="flex flex-col md:flex-row items-center gap-6 relative">
                          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                          </div>
                          <div className="text-center md:text-left flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                              <span className="px-3 py-1 bg-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest">Declined / Action Required</span>
                              <span className="text-[10px] text-white/20">{reg.registration_date}</span>
                            </div>
                            <h4 className="text-2xl font-display mb-2 text-white">{reg.competition}</h4>
                            
                            {reg.decline_reason ? (
                              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4 text-left">
                                <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Reason for Decline:</p>
                                <p className="text-sm text-red-200/80">{reg.decline_reason}</p>
                              </div>
                            ) : (
                              <p className="text-white/40 text-sm mb-4">Your registration was declined or cancelled by the administrator.</p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                              <button
                                onClick={() => {
                                  setNewReg({
                                    competition: reg.competition,
                                    entry_type: reg.entry_type,
                                    team_name: reg.team_name || '',
                                    team_size: reg.team_size || 2,
                                    utr_id: reg.utr_id || ''
                                  });
                                  setUpdatingRegId(reg.id);
                                  setPaymentFile(null);
                                  setRegStep(1);
                                  setShowRegModal(true);
                                }}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_5px_15px_rgba(239,68,68,0.2)]"
                              >
                                Edit & Re-submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={reg.id} className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 text-center flex flex-col items-center justify-center min-h-[200px] animate-in fade-in duration-500">
                        <Clock className="w-12 h-12 text-white/20 mb-4" />
                        <h4 className="text-xl font-display mb-2 text-white/60">{reg.competition} — Pending</h4>
                        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">Your digital QR pass will be generated once the admin confirms your registration fee and details.</p>
                        <button
                          onClick={() => setActiveTab('registrations')}
                          className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                          Check Registration Status
                        </button>
                      </div>
                    )
                  ))
                ) : (
                  <div className="glass-card p-12 rounded-3xl border border-white/10 bg-white/5 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-500">
                    <Trophy className="w-12 h-12 text-[#C9A84C]/50 mb-4 animate-pulse" />
                    <h4 className="text-2xl font-display mb-2 text-white/80">No Joined Events Yet</h4>
                    <p className="text-white/40 text-sm max-w-md mx-auto mb-8">You haven't joined any competitions yet. Discover events and claim your entry pass today!</p>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="btn-primary px-8"
                    >
                      Explore Competitions
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
                  {registrationsPagination.paginatedItems.map((reg: any) => (
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">{reg.entry_type} {reg.entry_type === 'team' && `— ${reg.team_name}`}</p>
                            {reg.entry_type === 'team' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                                TEAM-#{String(reg.id).padStart(3, '0')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {registrationsPagination.totalPages > 1 && (
                <div className="mt-8">
                  <PaginationControls
                    currentPage={registrationsPagination.currentPage}
                    totalPages={registrationsPagination.totalPages}
                    totalItems={registrationsPagination.totalItems}
                    itemsPerPage={registrationsPagination.itemsPerPage}
                    onNextPage={registrationsPagination.nextPage}
                    onPrevPage={registrationsPagination.prevPage}
                    onGoToPage={registrationsPagination.goToPage}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-2xl font-display mb-8">Available <span className="text-gradient-gold">Competitions</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitions.map((comp: any) => (
                  <div key={comp} className="glass-card p-6 rounded-3xl border border-white/10 group hover:border-[#C9A84C]/30 transition-all flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-display mb-2">{comp}</h4>
                      <p className="text-white/40 text-xs mb-6">Join this competition and showcase your talent at Ahlaad 2K26.</p>
                    </div>
                    <button
                      onClick={() => {
                        const isTeam = teamEvents.includes(comp);
                        setNewReg({ ...newReg, competition: comp, entry_type: isTeam ? 'team' : 'individual', utr_id: '', team_name: '', team_size: isTeam ? 4 : 1 });
                        setPaymentFile(null);
                        setRegStep(1);
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


          {activeTab === 'pass' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto pb-20">
              <h3 className="text-2xl font-display mb-2 text-center">Your Official <span className="text-gradient-gold">Entry Passes</span></h3>
              <p className="text-white/40 text-xs text-center mb-8 uppercase tracking-widest">Select and view your verified event entry tickets</p>

              {registrations.filter(r => r.status === 'confirmed').length > 0 ? (
                <div className="space-y-12">
                  {registrations.filter(r => r.status === 'confirmed').map((reg) => {
                    const hasMembers = reg.entry_type === 'team' && reg.members && reg.members.length > 0;
                    const currentSubTab = activePassSubTab[reg.id] || 'lead';

                    return (
                      <div key={reg.id} className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                        {/* Event Group Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#C9A84C]">Event Pass Group</span>
                            <h4 className="text-xl font-display text-white mt-1 uppercase tracking-wider">{reg.competition}</h4>
                            <p className="text-white/40 text-xs mt-0.5 uppercase tracking-widest">
                              {reg.entry_type} entry {reg.team_name ? `• Team "${reg.team_name}"` : ''}
                            </p>
                          </div>
                          
                          {/* Segment Switcher - Only show if there are members */}
                          {hasMembers && (
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-center">
                              <button
                                onClick={() => setActivePassSubTab(prev => ({ ...prev, [reg.id]: 'lead' }))}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                                  currentSubTab === 'lead'
                                    ? 'bg-[#C9A84C] text-[#080614] shadow-lg shadow-[#C9A84C]/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                👑 Lead Pass
                              </button>
                              <button
                                onClick={() => setActivePassSubTab(prev => ({ ...prev, [reg.id]: 'members' }))}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                                  currentSubTab === 'members'
                                    ? 'bg-[#C9A84C] text-[#080614] shadow-lg shadow-[#C9A84C]/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                👥 Members ({reg.members?.length || 0})
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Passes Render Area */}
                        <div className="animate-in fade-in duration-300">
                          {(!hasMembers || currentSubTab === 'lead') ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Showing: Leader Pass</span>
                                <span className="text-[10px] text-[#39FF14] uppercase tracking-widest font-mono font-bold">1 Verified Ticket</span>
                              </div>
                              <PassCard
                                title={reg.competition}
                                name={user.name}
                                id={user.college_id}
                                passId={reg.pass_id}
                                role="TEAM LEADER"
                              />
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Showing: Team Members Passes</span>
                                <span className="text-[10px] text-[#39FF14] uppercase tracking-widest font-mono font-bold">{reg.members.length} Verified Tickets</span>
                              </div>
                              <div className="space-y-8">
                                {reg.members.map((member: any) => (
                                  <PassCard
                                    key={member.id}
                                    title={reg.competition}
                                    name={member.member_name}
                                    id="TEAM MEMBER"
                                    passId={member.pass_id}
                                    role="MEMBER"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

        <footer className="py-8 border-t border-white/5 text-center mt-auto">
          <p className="text-xs text-white/30 font-mono uppercase tracking-[0.2em] mb-1.5">
            Ahlaad 2K26 — AITAM Silver Jubilee Celebration
          </p>
          <p className="text-sm text-white/50 font-light">
            Developed by <a href="https://www.linkedin.com/in/saisateeshwarareddy/" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:text-[#E0C97F] transition-colors underline underline-offset-2 font-bold">T. Saisateeshwara Reddy</a> | Technical Trainer, IIC
          </p>
        </footer>
      </main>

      {/* Registration Modal */}
      {showRegModal && (
        <div data-lenis-prevent className="fixed inset-0 z-[300] overflow-y-auto bg-black/60 backdrop-blur-xl flex items-start justify-center p-4 sm:p-6 md:p-10">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative my-auto">
            <button
              onClick={() => { setShowRegModal(false); setRegStep(1); }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-[10]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl mb-6 pr-8">Join <span className="text-gradient-gold">Competition</span></h3>

            <div className="space-y-6">
              {regStep === 1 ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#C9A84C]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">{newReg.competition}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Competition Guidelines</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
                    {eventGuidelines[newReg.competition]?.map((guide, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />
                        <p className="text-xs text-white/70 leading-relaxed">{guide}</p>
                      </div>
                    )) || <p className="text-xs text-white/40 italic">General event rules apply. Contact coordinator for details.</p>}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => { setShowRegModal(false); setRegStep(1); }}
                      className="flex-1 py-4 border border-white/10 rounded-2xl text-white/60 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setRegStep(2)}
                      className="flex-1 py-4 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] text-[#080614] rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-[0_10px_20px_rgba(201,168,76,0.2)] transition-all"
                    >
                      Accept & Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                  {/* Top Section: Details Left, QR Right */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    <div className="flex-1 space-y-6">
                      {newReg.entry_type === 'team' ? (
                        <div>
                          <label className="text-white/50 text-[10px] uppercase tracking-widest mb-2 block font-bold">Team Size</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="4"
                              max="12"
                              value={newReg.team_size}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setNewReg({ ...newReg, team_size: isNaN(val) ? 0 : val });
                              }}
                              className="w-24 bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50 text-sm"
                            />
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Members</span>
                          </div>
                          <p className="text-[9px] text-white/20 mt-2 italic">* Group category (4 to 12 members allowed)</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Registration Mode</p>
                          <p className="text-sm text-[#C9A84C] font-display">Individual Participant</p>
                        </div>
                      )}

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Event Category</p>
                        <p className="text-sm text-white/70 font-medium">{newReg.competition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Team Name (Full Width) */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <Users className="w-4 h-4 text-[#C9A84C]/20 group-hover:text-[#C9A84C]/40 transition-colors" />
                    </div>
                    <label className="text-[#C9A84C] text-[10px] uppercase tracking-widest mb-3 block font-bold">Enter Team Name</label>
                    <input
                      type="text"
                      value={newReg.team_name}
                      onChange={(e) => setNewReg({ ...newReg, team_name: e.target.value })}
                      placeholder="Type your creative team name here..."
                      className="w-full bg-transparent border-b-2 border-white/10 py-2 text-xl text-white placeholder:text-white/10 focus:outline-none focus:border-[#C9A84C] transition-all font-display"
                      required
                    />
                  </div>
                  <div className="p-5 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-2xl border border-[#C9A84C]/20 flex justify-between items-center">
                    <div>
                      <p className="text-white/40 uppercase text-[9px] tracking-widest font-bold mb-1">Total Payable</p>
                      <p className="text-[#39FF14] text-[10px] italic">Verified via manual review</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#C9A84C] font-display text-3xl">{newReg.entry_type === 'team' ? '₹500' : '₹200'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Bank Details for Payment</p>
                    <p className="text-[30px] text-[#C9A84C] font-display">Bank Name: <span className="text-white">Axis Bank Ltd.</span></p>
                    <p className="text-[30px] text-[#C9A84C] font-display">Branch Name: <span className="text-white text-[20px]">Narasannapeta, Srikakulam, Andhra Pradesh - 532421.</span></p>
                    <p className="text-[20px] text-[#C9A84C] font-display">IFSC Code: <span className="text-white">UTIB0003677</span></p>
                    <p className="text-[30px] text-[#C9A84C] font-display">Account Number: <span className="text-white">924020006464520</span></p>
                    <p className="text-[20px] text-[#C9A84C] font-display">Account Name: <span className="text-white">Aditya Institute of Technology and Management</span></p>

                  </div>

                  {/* Bottom Section: UTR & Screenshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <label className="text-white/30 text-[9px] uppercase tracking-widest mb-2 block font-bold">UTR ID (12 Digits)</label>
                      <input
                        type="text"
                        value={newReg.utr_id}
                        onChange={(e) => setNewReg({ ...newReg, utr_id: e.target.value })}
                        placeholder="Enter UTR Number"
                        className="w-full bg-transparent text-white focus:outline-none text-sm font-mono tracking-wider"
                        required
                      />
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <label className="text-white/30 text-[9px] uppercase tracking-widest mb-2 block font-bold">Payment Screenshot</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full bg-transparent text-[10px] text-white file:hidden cursor-pointer"
                        required
                      />
                      <p className="text-[8px] text-white/20 mt-1 truncate">
                        {paymentFile ? paymentFile.name : 'No file selected'}
                      </p>
                    </div>
                  </div>

                  

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setRegStep(1)}
                      className="flex-1 py-4 border border-white/10 rounded-2xl text-white/60 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRegisterEvent}
                      className="flex-1 py-4 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] text-[#080614] rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-[0_10px_30px_rgba(201,168,76,0.3)] transition-all"
                    >
                      Complete Registration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReg && (
        <div data-lenis-prevent className="fixed inset-0 z-[300] overflow-y-auto bg-black/60 backdrop-blur-xl flex items-start justify-center p-4 sm:p-6 md:p-10">
          <div className="glass-card w-full max-w-4xl p-6 sm:p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative overflow-hidden my-auto">
            <button
              onClick={() => setSelectedReg(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-[10]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8B0000]" />

            <div className="text-center mb-8">
              <h3 className="font-display text-2xl mb-1 uppercase tracking-wider">{selectedReg.competition}</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest">{selectedReg.status} Registration</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Entry Type</p>
                  <p className="text-sm font-bold text-white/80">{selectedReg.entry_type}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Fee Paid</p>
                  <p className="text-sm font-bold text-[#C9A84C]">₹{selectedReg.fee}</p>
                </div>
              </div>

              {selectedReg.status === 'cancelled' && (
                <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                  <h4 className="text-[10px] uppercase tracking-widest text-red-400 mb-1 font-bold">Registration Declined</h4>
                  <p className="text-xs text-white/40 mb-3">Your registration was declined by the administrator.</p>
                  {selectedReg.decline_reason && (
                    <div className="p-3 bg-red-500/15 border border-red-500/25 rounded-xl mb-4 text-left">
                      <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Reason:</p>
                      <p className="text-xs text-red-200/80">{selectedReg.decline_reason}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setNewReg({
                        competition: selectedReg.competition,
                        entry_type: selectedReg.entry_type,
                        team_name: selectedReg.team_name || '',
                        team_size: selectedReg.team_size || 2,
                        utr_id: selectedReg.utr_id || ''
                      });
                      setUpdatingRegId(selectedReg.id);
                      setPaymentFile(null);
                      setRegStep(1);
                      setShowRegModal(true);
                      setSelectedReg(null);
                    }}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                  >
                    Edit & Re-submit Registration
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                {selectedReg.team_name && (
                  <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between gap-2 mb-4 border-b border-white/5 pb-3">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Team: {selectedReg.team_name}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                        TEAM-#{String(selectedReg.id).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="space-y-3">
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
                  </div>
                )}

                {selectedReg.entry_type === 'team' && (selectedReg.members?.length || 0) < (selectedReg.team_size - 1) && (
                  <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-center">
                    <p className="text-[10px] text-[#C9A84C] uppercase tracking-widest mb-3 font-bold">Add Team Member Details Below</p>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Full Name (min 3 letters)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                      <input
                        type="tel"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        placeholder="Phone Number (10-digit Indian)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                      <input
                        type="text"
                        value={newMember.college}
                        onChange={(e) => setNewMember({ ...newMember, college: e.target.value })}
                        placeholder="College Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                      <input
                        type="text"
                        value={newMember.college_id}
                        onChange={(e) => setNewMember({ ...newMember, college_id: e.target.value })}
                        placeholder="College ID"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                      <button
                        onClick={() => handleAddMember(selectedReg.id)}
                        className="w-full py-3 mt-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl text-xs font-bold hover:bg-[#C9A84C]/20 transition-all"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                )}

                {selectedReg.status === 'confirmed' && (
                  <div className="flex-1 p-6 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/20 flex flex-col">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#39FF14] font-bold mb-4 border-b border-[#39FF14]/10 pb-2 flex items-center justify-center gap-1.5">
                      🎟️ Entry Passes ({1 + (selectedReg.members?.length || 0)})
                    </h4>
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                      
                      {/* Leader Pass */}
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/[0.08] transition-all duration-200">
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 mb-3">
                          Team Leader
                        </span>
                        <div className="p-2.5 bg-white rounded-xl shadow-xl mb-3">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedReg.pass_id || '')}`} 
                            alt="Leader Pass QR" 
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                        <p className="text-xs font-bold text-white/90">{user.name}</p>
                        <p className="font-mono text-[10px] text-[#39FF14] tracking-widest uppercase mt-1">Pass ID: {selectedReg.pass_id || 'ALH-REF-102'}</p>
                      </div>

                      {/* Members Passes */}
                      {selectedReg.members?.map((m: any) => (
                        <div key={m.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/[0.08] transition-all duration-200">
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-white/10 text-white/60 border border-white/20 mb-3">
                            Team Member
                          </span>
                          <div className="p-2.5 bg-white rounded-xl shadow-xl mb-3">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(m.pass_id || '')}`} 
                              alt="Member Pass QR" 
                              className="w-24 h-24 object-contain"
                            />
                          </div>
                          <p className="text-xs font-bold text-white/90">{m.member_name}</p>
                          <p className="font-mono text-[10px] text-[#39FF14] tracking-widest uppercase mt-1">Pass ID: {m.pass_id || 'Pending'}</p>
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>
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