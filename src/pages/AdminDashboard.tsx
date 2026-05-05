import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, FileText, Download, BarChart3, Search, Check, X, Clock, MapPin, Trophy, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'timeline'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('ahlaad_user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/dashboard');
    } else {
      setAdmin(userData);
      fetchAdminData();
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost/ahlaad_backend/admin_get_all_data.php');
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setTimeline(data.timeline);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch', error);
      setLoading(false);
    }
  };

  const handleApprove = async (regId: number) => {
    try {
      const response = await fetch('http://localhost/ahlaad_backend/admin_approve_registration.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Approval failed');
    }
  };

  const handleUpdateTimeline = async (eventId: number, status: string) => {
    try {
      const response = await fetch('http://localhost/ahlaad_backend/update_timeline.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, status })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ahlaad_user');
    navigate('/');
  };

  if (!admin || loading) return <div className="min-h-screen bg-[#080614] flex items-center justify-center text-white font-display">Loading Admin Control...</div>;

  return (
    <div className="min-h-screen bg-[#080614] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0d0b1e] p-6 flex flex-col fixed h-full z-[100]">
        <div className="flex items-center gap-3 mb-10">
          <img src="/ahlaad.png" alt="Ahlaad" className="h-6" />
          <span className="font-display text-lg tracking-widest text-[#C9A84C]">ADMIN</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('participants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'participants' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" />
            Registrations
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'timeline' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Clock className="w-5 h-5" />
            Live Timeline
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-display">{activeTab === 'overview' ? 'System Overview' : activeTab === 'participants' ? 'Manage Registrations' : 'Event Timeline'}</h1>
            <p className="text-white/40">Ahlaad 2K26 Administrative Control Center</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: registrations.length, icon: Users, color: '#C9A84C' },
                { label: 'Confirmed', value: registrations.filter(r => r.status === 'confirmed').length, icon: FileText, color: '#00FFFF' },
                { label: 'Pending', value: registrations.filter(r => r.status === 'pending').length, icon: Clock, color: '#FFD700' },
                { label: 'Total Revenue', value: `₹${registrations.reduce((acc, curr) => acc + parseFloat(curr.fee), 0)}`, icon: BarChart3, color: '#39FF14' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-6 rounded-xl border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-display mb-1">{stat.value}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8 rounded-2xl border border-white/10">
              <h3 className="text-xl font-display mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {registrations.slice(0, 5).map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold">{reg.user_name[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{reg.user_name} <span className="text-white/40 font-normal">registered for</span> {reg.competition}</p>
                        <p className="text-xs text-white/20">{reg.registration_date}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-display">Registration List</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search participant or college..." 
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all w-80"
                />
              </div>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 font-medium">Participant</th>
                    <th className="px-6 py-4 font-medium">Event Detail</th>
                    <th className="px-6 py-4 font-medium">Team Info</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold">{reg.user_name}</p>
                        <p className="text-xs text-white/40">{reg.user_email}</p>
                        <p className="text-xs text-white/40">{reg.college}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#C9A84C]">{reg.competition}</p>
                        <p className="text-[10px] uppercase text-white/30 tracking-wider">{reg.entry_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        {reg.entry_type === 'team' ? (
                          <div>
                            <p className="font-bold text-xs">{reg.team_name}</p>
                            <p className="text-xs text-white/40">{reg.members.length + 1} / {reg.team_size} members</p>
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {reg.status}
                        </span>
                        {reg.pass_id && <p className="text-[10px] font-mono text-white/30 mt-1">{reg.pass_id}</p>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reg.status === 'pending' ? (
                          <button 
                            onClick={() => handleApprove(reg.id)}
                            className="bg-[#39FF14] text-[#080614] px-3 py-1 rounded text-xs font-bold hover:opacity-80 transition-all flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                        ) : (
                          <span className="text-[#39FF14]/40 text-xs flex items-center justify-end gap-1 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="glass-card p-8 rounded-2xl border border-white/10">
              <h3 className="text-xl font-display mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C9A84C]" />
                Update Live Status
              </h3>
              <div className="space-y-6">
                {timeline.map(event => (
                  <div key={event.id} className="p-5 border border-white/5 rounded-xl bg-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-display text-white">{event.name}</h4>
                        <p className="text-xs text-white/40">{event.category} • {event.time_slot} • {event.venue}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${event.status === 'live' ? 'bg-[#39FF14]/20 text-[#39FF14]' : event.status === 'completed' ? 'bg-white/10 text-white/40' : 'bg-blue-500/20 text-blue-400'}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateTimeline(event.id, 'upcoming')}
                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'upcoming' ? 'bg-white/20 border-white/40' : 'hover:bg-white/5'}`}
                      >
                        Upcoming
                      </button>
                      <button 
                        onClick={() => handleUpdateTimeline(event.id, 'live')}
                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'live' ? 'bg-[#39FF14]/20 border-[#39FF14]/40 text-[#39FF14]' : 'hover:bg-white/5'}`}
                      >
                        Go Live
                      </button>
                      <button 
                        onClick={() => handleUpdateTimeline(event.id, 'completed')}
                        className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'completed' ? 'bg-white/20 border-white/40' : 'hover:bg-white/5'}`}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/10 bg-[#C9A84C]/5">
              <h3 className="text-xl font-display mb-6">Timeline Preview</h3>
              <div className="space-y-8 relative">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />
                {timeline.map(event => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#080614] z-10 transition-colors ${event.status === 'live' ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]' : event.status === 'completed' ? 'bg-white/20' : 'bg-[#C9A84C]'}`} />
                    <p className="text-[10px] font-mono text-white/40 mb-1">{event.time_slot} — {event.status.toUpperCase()}</p>
                    <h4 className="font-display text-sm">{event.name}</h4>
                    <p className="text-[10px] text-white/20 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {event.venue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
