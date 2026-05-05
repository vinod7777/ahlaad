import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Plus, CheckCircle, Clock, MapPin, QrCode, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState({ competition: '', entry_type: 'individual', team_name: '', team_size: 2 });
  const [newMemberName, setNewMemberName] = useState('');
  const [activeRegId, setActiveRegId] = useState<number | null>(null);

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
      const response = await fetch(`http://localhost/ahlaad_backend/get_user_dashboard_data.php?user_id=${userId}`);
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
    try {
      const response = await fetch('http://localhost/ahlaad_backend/register_event.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReg, user_id: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setShowRegModal(false);
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
      const response = await fetch('http://localhost/ahlaad_backend/add_team_member.php', {
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

  if (!user || loading) return <div className="min-h-screen bg-[#080614] flex items-center justify-center text-white font-display">Loading Ahlaad Experience...</div>;

  return (
    <div className="min-h-screen bg-[#080614] text-white">
      <nav className="border-b border-white/10 px-[6vw] py-4 flex justify-between items-center bg-[#0d0b1e] sticky top-0 z-[200] backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3">
          <img src="/ahlaad.png" alt="Ahlaad" className="h-8" />
          <span className="font-display text-xl tracking-wider hidden sm:block">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4 text-[#C9A84C]" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="px-[6vw] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Stats & Profile */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-[#C9A84C]/20 text-center">
              <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border-2 border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-4 relative">
                <User className="w-10 h-10 text-[#C9A84C]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#39FF14] rounded-full border-4 border-[#080614]" />
              </div>
              <h2 className="text-xl font-display">{user.name}</h2>
              <p className="text-white/40 text-sm mb-4">{user.college}</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-white/60 border border-white/10">ID: {user.college_id}</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h4 className="font-display text-xs uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/80">Events Joined</span>
                  </div>
                  <span className="text-[#C9A84C] font-display">{registrations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/80">Status</span>
                  </div>
                  <span className="text-[#39FF14] text-xs font-medium px-2 py-0.5 bg-[#39FF14]/10 rounded">Active</span>
                </div>
              </div>
            </div>

            {/* Event Pass Preview (If confirmed) */}
            {registrations.some(r => r.status === 'confirmed') && (
              <div className="glass-card p-6 rounded-2xl border border-[#39FF14]/20 bg-[#39FF14]/5 overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#39FF14]/10 rounded-full blur-xl" />
                <h4 className="font-display text-xs uppercase tracking-[0.2em] text-[#39FF14] mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Your Active Pass
                </h4>
                <div className="bg-white p-2 rounded-lg mb-4 w-fit mx-auto">
                   <QrCode className="w-24 h-24 text-black" />
                </div>
                <p className="text-center font-mono text-xs text-white/60">VALID FOR ALL REGISTERED EVENTS</p>
              </div>
            )}
          </div>

          {/* Center Column - Main Actions & Registrations */}
          <div className="lg:col-span-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display tracking-tight">Your <span className="text-gradient-gold">Registrations</span></h2>
              <button 
                onClick={() => setShowRegModal(true)}
                className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Join Event
              </button>
            </div>

            {registrations.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl border border-dashed border-white/10 text-center">
                <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl text-white/60 mb-2 font-display">No events registered</h3>
                <p className="text-white/40 text-sm mb-6">Explore competitions and register to get your entry pass.</p>
                <button onClick={() => setShowRegModal(true)} className="text-[#C9A84C] hover:underline text-sm">Browse Competitions →</button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-[#C9A84C]/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {reg.status}
                          </span>
                          <span className="text-white/30 text-xs font-mono">{reg.registration_date}</span>
                        </div>
                        <h3 className="text-xl font-display mb-1">{reg.competition}</h3>
                        <p className="text-white/40 text-sm mb-4">
                          {reg.entry_type === 'team' ? `Team: ${reg.team_name} (${reg.team_size} members)` : 'Individual Participation'}
                        </p>
                        
                        {reg.pass_id && (
                          <div className="flex items-center gap-2 text-[#39FF14] text-xs font-mono bg-[#39FF14]/5 p-2 rounded w-fit border border-[#39FF14]/20">
                            <QrCode className="w-4 h-4" />
                            PASS ID: {reg.pass_id}
                          </div>
                        )}
                      </div>

                      {reg.entry_type === 'team' && (
                        <div className="md:text-right">
                          <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">Team Members</h4>
                          <div className="flex flex-wrap md:justify-end gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] text-[#C9A84C] font-bold" title={user.name}>
                              {user.name[0]}
                            </div>
                            {reg.members.map((m: any) => (
                              <div key={m.id} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white/80 font-bold" title={m.member_name}>
                                {m.member_name[0]}
                              </div>
                            ))}
                            {reg.members.length < (reg.team_size - 1) && (
                              <button 
                                onClick={() => setActiveRegId(activeRegId === reg.id ? null : reg.id)}
                                className="w-8 h-8 rounded-full bg-white/5 border border-dashed border-white/30 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {activeRegId === reg.id && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <input 
                                type="text" 
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Member Name"
                                className="bg-white/5 border border-white/20 rounded py-1 px-2 text-xs text-white focus:outline-none focus:border-[#C9A84C]/50"
                              />
                              <button 
                                onClick={() => handleAddMember(reg.id)}
                                className="bg-[#C9A84C] text-[#080614] px-3 py-1 rounded text-xs font-bold"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Event Timeline */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="font-display text-lg mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C9A84C]" />
                Live <span className="text-[#C9A84C]">Timeline</span>
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/5" />
                
                {timeline.map((event) => (
                  <div key={event.id} className="relative pl-8 group">
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#080614] z-10 transition-colors ${event.status === 'live' ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]' : event.status === 'completed' ? 'bg-white/20' : 'bg-[#C9A84C]'}`} />
                    <p className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-1 ${event.status === 'live' ? 'text-[#39FF14]' : 'text-white/40'}`}>
                      {event.time_slot} — {event.status}
                    </p>
                    <h4 className={`font-display text-sm ${event.status === 'live' ? 'text-white' : 'text-white/60'}`}>{event.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </div>
                    {event.status === 'live' && (
                      <div className="mt-3 p-2 bg-[#39FF14]/5 rounded border border-[#39FF14]/10">
                        <p className="text-[10px] text-[#39FF14] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
                          HAPPENING NOW
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                      onChange={(e) => setNewReg({ ...newReg, team_size: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#C9A84C]/50"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Registration Fee</span>
                  <span className="text-[#C9A84C] font-display text-xl">{newReg.entry_type === 'team' ? '₹500' : '₹200'}</span>
                </div>
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
    </div>
  );
}
