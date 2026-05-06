import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, FileText, Download, BarChart3, Search, Check, Clock, MapPin, CheckCircle, Menu, X, Settings, Upload, QrCode } from 'lucide-react';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'timeline' | 'users' | 'volunteers' | 'checkin_status'>('overview');
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkinUsers, setCheckinUsers] = useState<any[]>([]);
  const [checkinSearchQuery, setCheckinSearchQuery] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [checkinCurrentPage, setCheckinCurrentPage] = useState(1);
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const escapeHtml = (text: string) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcelReport = (type: 'registrations' | 'checkins') => {
    if (type === 'registrations') {
      if (registrations.length === 0) {
        alert('No registration records available to download.');
        return;
      }
      
      const headers = ['S.No', 'Participant Name', 'Email', 'Phone', 'College', 'College ID', 'Event/Competition', 'Entry Type', 'Team Name', 'Members Count', 'Fee (Rupees)', 'UTR ID', 'Registration Date', 'Status', 'Pass ID'];
      const rows = registrations.map((reg, index) => [
        index + 1,
        reg.user_name || '',
        reg.user_email || '',
        reg.phone || '',
        reg.college || '',
        reg.college_id || '',
        reg.competition || '',
        reg.entry_type || '',
        reg.team_name || 'N/A',
        reg.members ? reg.members.length : 0,
        reg.fee || '0',
        reg.utr_id || 'N/A',
        reg.registration_date || '',
        reg.status || '',
        reg.pass_id || 'Pending'
      ]);

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');
      triggerDownload(csvContent, 'ahlaad_2k26_registrations_report.csv');
    } else {
      if (checkinUsers.length === 0) {
        alert('No check-in records available to download.');
        return;
      }

      const headers = ['S.No', 'Name', 'Email', 'Phone', 'College', 'College ID', 'Event/Competition', 'Role', 'Team Name', 'Pass ID', 'Check-In Status', 'Check-In Time'];
      const rows = checkinUsers.map((u, index) => [
        index + 1,
        u.name || '',
        u.email || '',
        u.phone || '',
        u.college || '',
        u.college_id || '',
        u.competition || '',
        u.role || '',
        u.team_name || 'N/A',
        u.pass_id || '',
        u.checked_in === 1 ? 'Checked In' : 'Pending',
        u.checked_in_at || 'N/A'
      ]);

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');
      triggerDownload(csvContent, 'ahlaad_2k26_checkin_status_report.csv');
    }
  };

  const downloadPDFReport = (type: 'registrations' | 'checkins') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site to generate PDF reports.');
      return;
    }

    const reportTitle = type === 'registrations' ? 'Ahlaad 2K26 - Complete Registrations Report' : 'Ahlaad 2K26 - Event Check-In Status Report';
    
    let tableHeaders = '';
    let tableRows = '';

    if (type === 'registrations') {
      if (registrations.length === 0) {
        alert('No registration records available to download.');
        return;
      }
      tableHeaders = `
        <th>S.No</th>
        <th>Participant Details</th>
        <th>College Info</th>
        <th>Competition Details</th>
        <th>Payment (Rs.)</th>
        <th>Status</th>
      `;
      tableRows = registrations.map((reg, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(reg.user_name)}</strong><br/>
            <span style="font-size: 9px; color: #555;">${escapeHtml(reg.user_email)} | ${escapeHtml(reg.phone)}</span>
          </td>
          <td>
            ${escapeHtml(reg.college)}<br/>
            <span style="font-size: 9px; color: #555;">ID: ${escapeHtml(reg.college_id)}</span>
          </td>
          <td>
            <strong>${escapeHtml(reg.competition)}</strong><br/>
            <span style="font-size: 9px; color: #555; text-transform: uppercase;">Type: ${escapeHtml(reg.entry_type)} ${reg.team_name ? `(${escapeHtml(reg.team_name)})` : ''}</span>
          </td>
          <td>
            Rs. ${escapeHtml(reg.fee)}<br/>
            <span style="font-size: 8px; font-family: monospace; color: #666;">UTR: ${escapeHtml(reg.utr_id || 'N/A')}</span>
          </td>
          <td>
            <span class="badge ${reg.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}">
              ${reg.status}
            </span>
            ${reg.pass_id ? `<div style="font-size: 8px; font-family: monospace; margin-top: 4px; color: #0088cc;">${escapeHtml(reg.pass_id)}</div>` : ''}
          </td>
        </tr>
      `).join('');
    } else {
      if (checkinUsers.length === 0) {
        alert('No check-in records available to download.');
        return;
      }
      tableHeaders = `
        <th>S.No</th>
        <th>Participant Details</th>
        <th>College Info</th>
        <th>Event & Role</th>
        <th>Pass ID</th>
        <th>Check-In Status</th>
      `;
      tableRows = checkinUsers.map((u, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(u.name)}</strong><br/>
            <span style="font-size: 9px; color: #555;">${escapeHtml(u.email)} | ${escapeHtml(u.phone)}</span>
          </td>
          <td>
            ${escapeHtml(u.college)}<br/>
            <span style="font-size: 9px; color: #555;">ID: ${escapeHtml(u.college_id)}</span>
          </td>
          <td>
            <strong>${escapeHtml(u.competition)}</strong><br/>
            <span style="font-size: 9px; color: #555; text-transform: uppercase;">Role: ${escapeHtml(u.role)} ${u.team_name ? `(${escapeHtml(u.team_name)})` : ''}</span>
          </td>
          <td style="font-family: monospace; font-size: 10px; color: #0088cc; font-weight: bold;">
            ${escapeHtml(u.pass_id || 'N/A')}
          </td>
          <td>
            <span class="badge ${u.checked_in === 1 ? 'badge-checkedin' : 'badge-notcheckedin'}">
              ${u.checked_in === 1 ? 'Checked In' : 'Pending'}
            </span>
            ${u.checked_in === 1 && u.checked_in_at ? `<div style="font-size: 8px; font-family: monospace; margin-top: 4px; color: #666;">At: ${escapeHtml(u.checked_in_at)}</div>` : ''}
          </td>
        </tr>
      `).join('');
    }

    const totalRevenue = type === 'registrations' 
      ? `Rs. ${registrations.reduce((acc, curr) => acc + parseFloat(curr.fee), 0)}` 
      : 'N/A';

    const confirmedCount = type === 'registrations'
      ? registrations.filter(r => r.status === 'confirmed').length
      : checkinUsers.filter(u => u.checked_in === 1).length;

    const pendingCount = type === 'registrations'
      ? registrations.filter(r => r.status === 'pending').length
      : checkinUsers.filter(u => u.checked_in !== 1).length;

    const htmlContent = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1a1f2c;
              margin: 0;
              padding: 40px;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #C9A84C;
              padding-bottom: 24px;
              margin-bottom: 30px;
            }
            .brand {
              font-family: 'Inter', sans-serif;
              font-size: 26px;
              font-weight: 800;
              letter-spacing: 2px;
              color: #080614;
              margin: 0 0 6px 0;
              text-transform: uppercase;
            }
            .brand span {
              color: #C9A84C;
            }
            .title {
              font-size: 18px;
              font-weight: 600;
              color: #4a5568;
              margin: 0;
            }
            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #718096;
              line-height: 1.6;
            }
            .stats-row {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background-color: #f7fafc;
              border: 1px solid #e2e8f0;
              padding: 16px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-val {
              font-size: 20px;
              font-weight: 700;
              color: #0d0b1e;
              margin-bottom: 4px;
            }
            .stat-lbl {
              font-size: 10px;
              text-transform: uppercase;
              color: #718096;
              letter-spacing: 1px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }
            th {
              background-color: #080614;
              color: #ffffff;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 1px;
              font-weight: 700;
              padding: 12px;
              border: 1px solid #e2e8f0;
              text-align: left;
            }
            td {
              padding: 12px;
              border: 1px solid #e2e8f0;
              color: #2d3748;
              vertical-align: top;
              line-height: 1.5;
            }
            tr:nth-child(even) td {
              background-color: #f7fafc;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .badge-confirmed {
              background-color: #c6f6d5;
              color: #22543d;
            }
            .badge-pending {
              background-color: #feebc8;
              color: #744210;
            }
            .badge-checkedin {
              background-color: #c6f6d5;
              color: #22543d;
            }
            .badge-notcheckedin {
              background-color: #edf2f7;
              color: #4a5568;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              text-align: center;
              font-size: 10px;
              color: #a0aec0;
            }
            @media print {
              @page {
                size: A4 landscape;
                margin: 15mm;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="brand">AHLAAD<span>2K26</span></h1>
              <h2 class="title">${reportTitle}</h2>
            </div>
            <div class="meta-info">
              <strong>Generated At:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Exported By:</strong> Admin Portal<br/>
              <strong>Total Records:</strong> ${type === 'registrations' ? registrations.length : checkinUsers.length}
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-val">${type === 'registrations' ? registrations.length : checkinUsers.length}</div>
              <div class="stat-lbl">${type === 'registrations' ? 'Total Registered' : 'Total Confirmed'}</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${confirmedCount}</div>
              <div class="stat-lbl">${type === 'registrations' ? 'Confirmed Payments' : 'Checked In'}</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${pendingCount}</div>
              <div class="stat-lbl">${type === 'registrations' ? 'Pending Approval' : 'Remaining Check-In'}</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${totalRevenue}</div>
              <div class="stat-lbl">Total Revenue Tracked</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            Ahlaad 2K26 Cultural & Technical Fest &copy; Aditya Institute of Technology and Management (AITAM). All Rights Reserved.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchAdminData, 5000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const [res1, res2, res3, res4] = await Promise.all([
        fetch('http://localhost/ahlaad/backend/admin_get_all_data.php'),
        fetch('http://localhost/ahlaad/backend/admin_get_users.php'),
        fetch('http://localhost/ahlaad/backend/admin_get_volunteers_tasks.php'),
        fetch('http://localhost/ahlaad/backend/checkin_get_all.php')
      ]);
      const data = await res1.json();
      const usersData = await res2.json();
      const volsData = await res3.json();
      const checkinData = await res4.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setTimeline(data.timeline);
        if (data.settings && data.settings.registration_enabled !== undefined) {
          setRegistrationEnabled(data.settings.registration_enabled);
        }
      }
      if (usersData.success) {
        setAllUsers(usersData.users);
      }
      if (volsData.success) {
        setVolunteers(volsData.volunteers);
        // Refresh selected volunteer if open
        if (selectedVolunteer) {
          const updated = volsData.volunteers.find((v: any) => v.id === selectedVolunteer.id);
          if (updated) setSelectedVolunteer(updated);
        }
      }
      if (checkinData.success) {
        setCheckinUsers(checkinData.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch', error);
      setLoading(false);
    }
  };

  const handleApprove = async (regId: number) => {
    try {
      const response = await fetch('http://localhost/ahlaad/backend/admin_approve_registration.php', {
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
      const response = await fetch('http://localhost/ahlaad/backend/update_timeline.php', {
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

  const handleToggleRegistration = async () => {
    try {
      const newStatus = !registrationEnabled;
      const response = await fetch('http://localhost/ahlaad/backend/toggle_registration.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setRegistrationEnabled(newStatus);
      } else {
        alert(data.message || 'Toggle failed');
      }
    } catch (error) {
      alert('Toggle failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ahlaad_user');
    navigate('/');
  };

  const handleUpdateUser = async (updatedData: any) => {
    try {
      const response = await fetch('http://localhost/ahlaad/backend/admin_update_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await response.json();
      if (data.success) {
        alert('User updated successfully');
        fetchAdminData();
        setSelectedUser(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user completely? This action cannot be undone.')) return;
    try {
      const response = await fetch('http://localhost/ahlaad/backend/admin_delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleAssignTask = async (volunteerId: number) => {
    if (!newTaskText) return;
    try {
      const response = await fetch('http://localhost/ahlaad/backend/admin_assign_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteerId, task_description: newTaskText })
      });
      const data = await response.json();
      if (data.success) {
        setNewTaskText('');
        fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to assign task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch('http://localhost/ahlaad/backend/admin_update_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to update task');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(col => col.trim().replace(/^"|"$/g, '')));
      
      const headers = rows[0].map(h => h.toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone'));
      const colIdx = headers.findIndex(h => h.includes('college') && !h.includes('id'));
      const colIdIdx = headers.findIndex(h => h.includes('id') && h.includes('college'));

      const parsedVolunteers = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || (!row[nameIdx !== -1 ? nameIdx : 0] && !row[emailIdx !== -1 ? emailIdx : 1])) continue;
        
        parsedVolunteers.push({
          name: nameIdx !== -1 ? row[nameIdx] : row[0],
          email: emailIdx !== -1 ? row[emailIdx] : row[1],
          phone: phoneIdx !== -1 ? row[phoneIdx] : (row[2] || ''),
          college: colIdx !== -1 ? row[colIdx] : (row[3] || ''),
          college_id: colIdIdx !== -1 ? row[colIdIdx] : (row[4] || '')
        });
      }

      if (parsedVolunteers.length === 0) {
        alert("No valid rows found in CSV. Make sure you export as a CSV (Comma Delimited) file.");
        return;
      }

      try {
        const response = await fetch('http://localhost/ahlaad/backend/admin_import_volunteers.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volunteers: parsedVolunteers })
        });
        const data = await response.json();
        alert(data.message);
        if (data.success) {
          fetchAdminData();
        }
      } catch (error) {
        alert("Failed to upload volunteer data");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const filteredRegistrations = registrations.filter(reg => {
    const term = searchQuery.toLowerCase();
    return (
      (reg.user_name || '').toLowerCase().includes(term) ||
      (reg.college || '').toLowerCase().includes(term) ||
      (reg.user_email || '').toLowerCase().includes(term) ||
      (reg.team_name || '').toLowerCase().includes(term) ||
      (reg.competition || '').toLowerCase().includes(term)
    );
  });
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const paginatedRegistrations = filteredRegistrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!admin || loading) return <div className="min-h-screen bg-[#080614] flex items-center justify-center text-white font-display">Loading Admin Control...</div>;

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
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <img src="/ahlaad.png" alt="Ahlaad" className="h-6" />
            <span className="font-display text-lg tracking-widest text-[#C9A84C]">ADMIN</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>
          <button 
            onClick={() => { setActiveTab('participants'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'participants' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" />
            Registrations
          </button>
          <button 
            onClick={() => { setActiveTab('timeline'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'timeline' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Clock className="w-5 h-5" />
            Live Timeline
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-red-500/10 text-red-500' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" />
            Manage Users
          </button>
          <button 
            onClick={() => { setActiveTab('volunteers'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'volunteers' ? 'bg-blue-500/10 text-blue-400' : 'text-white/60 hover:bg-white/5'}`}
          >
            <CheckCircle className="w-5 h-5" />
            Volunteers & Tasks
          </button>
          <button 
            onClick={() => { setActiveTab('checkin_status'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'checkin_status' ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <QrCode className="w-5 h-5 text-emerald-400" />
            Check-In Overview
          </button>
          <button 
            onClick={() => { navigate('/checkin'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all font-bold"
          >
            <QrCode className="w-5 h-5" />
            Check-In Desk
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
      <main className="flex-1 md:ml-64 p-4 md:p-10 min-h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-white/60 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display">{activeTab === 'overview' ? 'System Overview' : activeTab === 'participants' ? 'Manage Registrations' : activeTab === 'volunteers' ? 'Volunteers Management' : activeTab === 'timeline' ? 'Event Timeline' : activeTab === 'checkin_status' ? 'Check-In Overview' : 'User Management'}</h1>
              <p className="text-xs md:text-sm text-white/40">Ahlaad 2K26 Administrative Control Center</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleToggleRegistration}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${registrationEnabled ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/20'}`}
            >
              {registrationEnabled ? 'Stop Registration' : 'Start Registration'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
              >
                <Download className="w-4 h-4 text-[#C9A84C]" />
                Reports
                <span className="text-white/40 text-[10px] ml-1">▼</span>
              </button>
              
              {isReportDropdownOpen && (
                <>
                  {/* Invisible backdrop to detect clicks outside and close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsReportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[#0d0b1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-2">Registrations Report</p>
                        <div className="grid grid-cols-1 gap-1">
                          <button 
                            onClick={() => {
                              downloadExcelReport('registrations');
                              setIsReportDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-all text-white/80 hover:text-[#39FF14]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Excel / CSV Spreadsheet
                          </button>
                          <button 
                            onClick={() => {
                              downloadPDFReport('registrations');
                              setIsReportDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-all text-white/80 hover:text-[#00FFFF]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            PDF Booklet Report
                          </button>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-2">Check-In Overview</p>
                        <div className="grid grid-cols-1 gap-1">
                          <button 
                            onClick={() => {
                              downloadExcelReport('checkins');
                              setIsReportDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-all text-white/80 hover:text-[#39FF14]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Excel / CSV Spreadsheet
                          </button>
                          <button 
                            onClick={() => {
                              downloadPDFReport('checkins');
                              setIsReportDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-all text-white/80 hover:text-[#00FFFF]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            PDF Booklet Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
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
                  <div 
                    key={reg.id} 
                    className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                    onClick={() => setSelectedReg(reg)}
                  >
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
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                  {paginatedRegistrations.map(reg => (
                    <tr 
                      key={reg.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedReg(reg)}
                    >
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
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedReg(reg); }}
                            className="bg-white/5 text-white/60 px-3 py-1 rounded text-xs font-bold hover:bg-white/10 transition-all border border-white/10"
                          >
                            View
                          </button>
                          {reg.status === 'pending' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleApprove(reg.id); }}
                              className="bg-[#39FF14] text-[#080614] px-3 py-1 rounded text-xs font-bold hover:opacity-80 transition-all flex items-center gap-1"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-white/40">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRegistrations.length)} of {filteredRegistrations.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-white/60">Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
              
              <div className="space-y-12">
                {/* Day 1 Management */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#C9A84C] font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                    Day 1 Schedule
                  </h4>
                  <div className="space-y-4">
                    {timeline.length === 0 ? (
                      <p className="text-white/20 italic text-xs">No events loaded...</p>
                    ) : timeline.map(event => (
                      <div key={event.id} className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-display text-sm text-white">{event.name}</h4>
                            <p className="text-[10px] text-white/30">{event.time_slot} • {event.venue}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${event.status === 'live' ? 'bg-[#39FF14]/20 text-[#39FF14]' : event.status === 'completed' ? 'bg-white/10 text-white/40' : 'bg-blue-500/20 text-blue-400'}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateTimeline(event.id, 'upcoming')}
                            className={`flex-1 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'upcoming' ? 'bg-white/20 border-white/40' : 'hover:bg-white/5'}`}
                          >
                            Upcoming
                          </button>
                          <button 
                            onClick={() => handleUpdateTimeline(event.id, 'live')}
                            className={`flex-1 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'live' ? 'bg-[#39FF14]/20 border-[#39FF14]/40 text-[#39FF14]' : 'hover:bg-white/5'}`}
                          >
                            Go Live
                          </button>
                          <button 
                            onClick={() => handleUpdateTimeline(event.id, 'completed')}
                            className={`flex-1 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border border-white/10 transition-all ${event.status === 'completed' ? 'bg-white/20 border-white/40' : 'hover:bg-white/5'}`}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day 2 Placeholder */}
                <div className="opacity-40">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    Day 2 Schedule
                  </h4>
                  <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Locked until Day 1 Completion</p>
                  </div>
                </div>
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

        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(255,0,0,0.1)]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-red-500/5">
              <div>
                <h3 className="text-xl font-display text-red-400 flex items-center gap-2"><Settings className="w-5 h-5"/> God Mode: User Management</h3>
                <p className="text-xs text-white/40">Total Users: {allUsers.length}</p>
              </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 font-medium">User ID</th>
                    <th className="px-6 py-4 font-medium">Name & Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">College</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {allUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-white/40">{u.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 text-white/70">{u.phone}</td>
                      <td className="px-6 py-4">
                        <p className="text-white/80">{u.college}</p>
                        <p className="text-xs text-white/30">{u.college_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedUser({...u, password: ''})}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-xs transition-colors"
                          >
                            Edit
                          </button>
                          {u.id !== admin.id && (
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="glass-card rounded-2xl border border-blue-500/30 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-blue-500/5">
              <div>
                <h3 className="text-xl font-display text-blue-400 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Volunteers Directory</h3>
                <p className="text-xs text-white/40">Total Volunteers: {volunteers.length}</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload Excel as CSV"
                />
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all text-xs font-bold uppercase tracking-widest">
                  <Upload className="w-4 h-4" />
                  Upload Excel (CSV)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-[#080614]">
              {volunteers.map(v => (
                <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between" onClick={() => setSelectedVolunteer(v)}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">{v.name[0]}</div>
                        <div>
                          <h4 className="font-bold text-white">{v.name}</h4>
                          <p className="text-[10px] text-white/40 font-mono">{v.college_id}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-widest text-white/60 border border-white/10">
                        {v.tasks?.length || 0} Tasks
                      </span>
                    </div>
                    <div className="space-y-1 mb-6">
                      <p className="text-xs text-white/60"><span className="text-white/20 w-12 inline-block">Phone:</span> {v.phone}</p>
                      <p className="text-xs text-white/60"><span className="text-white/20 w-12 inline-block">Email:</span> {v.email}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest rounded hover:bg-blue-500/20 transition-all">Manage Tasks</button>
                </div>
              ))}
              {volunteers.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No volunteers found</p>
                  <p className="text-white/20 text-xs mt-1">Change a user's role to 'volunteer' in Manage Users tab to see them here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checkin_status' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Total Confirmed Participants', 
                  value: checkinUsers.length, 
                  icon: Users, 
                  color: '#C9A84C',
                  desc: 'All individual participants & team members'
                },
                { 
                  label: 'Checked In', 
                  value: checkinUsers.filter(u => u.checked_in === 1).length, 
                  icon: CheckCircle, 
                  color: '#39FF14',
                  desc: `${checkinUsers.length > 0 ? Math.round((checkinUsers.filter(u => u.checked_in === 1).length / checkinUsers.length) * 100) : 0}% of total participants`
                },
                { 
                  label: 'Not Checked In', 
                  value: checkinUsers.filter(u => u.checked_in !== 1).length, 
                  icon: Clock, 
                  color: '#FF4136',
                  desc: `${checkinUsers.length > 0 ? Math.round((checkinUsers.filter(u => u.checked_in !== 1).length / checkinUsers.length) * 100) : 0}% remaining`
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden bg-white/[0.01]">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-display mb-1">{stat.value}</p>
                  <p className="text-xs text-white/60 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-[10px] text-white/30 mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>

            {/* List and Filter Section */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-[#0d0b1e]">
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-display text-emerald-400">Check-In Directory</h3>
                  <p className="text-xs text-white/40">Real-time status tracking for all event attendees</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  {/* Filters */}
                  <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button 
                      onClick={() => { setCheckinFilter('all'); setCheckinCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${checkinFilter === 'all' ? 'bg-[#C9A84C] text-[#080614]' : 'text-white/60 hover:text-white'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => { setCheckinFilter('checked_in'); setCheckinCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${checkinFilter === 'checked_in' ? 'bg-emerald-500 text-[#080614]' : 'text-white/60 hover:text-white'}`}
                    >
                      Checked In
                    </button>
                    <button 
                      onClick={() => { setCheckinFilter('not_checked_in'); setCheckinCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${checkinFilter === 'not_checked_in' ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      Not Checked In
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 md:flex-initial min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input 
                      type="text" 
                      value={checkinSearchQuery}
                      onChange={(e) => { setCheckinSearchQuery(e.target.value); setCheckinCurrentPage(1); }}
                      placeholder="Search name, college, or Pass ID..." 
                      className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 font-medium">Participant</th>
                      <th className="px-6 py-4 font-medium">College Details</th>
                      <th className="px-6 py-4 font-medium">Event & Role</th>
                      <th className="px-6 py-4 font-medium">Pass ID</th>
                      <th className="px-6 py-4 font-medium">Check-In Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(() => {
                      const filtered = checkinUsers.filter(u => {
                        const matchesSearch = 
                          (u.name || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.phone || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.college || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.pass_id || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.team_name || '').toLowerCase().includes(checkinSearchQuery.toLowerCase()) ||
                          (u.competition || '').toLowerCase().includes(checkinSearchQuery.toLowerCase());

                        if (checkinFilter === 'checked_in') {
                          return matchesSearch && u.checked_in === 1;
                        }
                        if (checkinFilter === 'not_checked_in') {
                          return matchesSearch && u.checked_in !== 1;
                        }
                        return matchesSearch;
                      });

                      const totalCheckinPages = Math.ceil(filtered.length / itemsPerPage);
                      const paginated = filtered.slice((checkinCurrentPage - 1) * itemsPerPage, checkinCurrentPage * itemsPerPage);

                      if (paginated.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-white/30 italic">
                              No participants match the selected criteria.
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <>
                          {paginated.map(u => (
                            <tr key={`${u.role}-${u.id}`} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-xs text-white/40">{u.email}</p>
                                <p className="text-xs text-white/40">{u.phone}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-white/80">{u.college}</p>
                                <p className="text-xs text-white/30">{u.college_id}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-[#C9A84C]">{u.competition}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    u.role === 'TEAM LEADER' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 
                                    u.role === 'MEMBER' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {u.role}
                                  </span>
                                  {u.team_name && (
                                    <span className="text-[10px] text-white/40 font-mono">({u.team_name})</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-[#00FFFF]">
                                {u.pass_id || 'Generating...'}
                              </td>
                              <td className="px-6 py-4">
                                {u.checked_in === 1 ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Checked In
                                    </span>
                                    <p className="text-[10px] text-white/30 mt-1 font-mono">{u.checked_in_at}</p>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-white/40 border border-white/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    Not Checked In
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}

                          {/* Pagination Row inside the Table Container */}
                          {totalCheckinPages > 1 && (
                            <tr>
                              <td colSpan={5} className="p-4 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-white/40">
                                    Showing {(checkinCurrentPage - 1) * itemsPerPage + 1} to {Math.min(checkinCurrentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => setCheckinCurrentPage(prev => Math.max(prev - 1, 1))}
                                      disabled={checkinCurrentPage === 1}
                                      className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors text-white"
                                    >
                                      Previous
                                    </button>
                                    <span className="text-xs text-white/60">Page {checkinCurrentPage} of {totalCheckinPages}</span>
                                    <button 
                                      onClick={() => setCheckinCurrentPage(prev => Math.min(prev + 1, totalCheckinPages))}
                                      disabled={checkinCurrentPage === totalCheckinPages}
                                      className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors text-white"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
          <div className="glass-card w-full max-w-2xl p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8B0000]" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-display text-3xl mb-1">{selectedReg.user_name}</h3>
                <p className="text-white/40 text-sm">{selectedReg.college}</p>
              </div>
              <button 
                onClick={() => setSelectedReg(null)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <Users className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Participant Contact</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Email:</span> {selectedReg.user_email}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Phone:</span> {selectedReg.phone}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">College ID:</span> {selectedReg.college_id}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Competition Info</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Event:</span> {selectedReg.competition}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Type:</span> {selectedReg.entry_type}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Fee:</span> ₹{selectedReg.fee}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">UTR ID:</span> <span className="text-blue-400 font-mono">{selectedReg.utr_id || 'N/A'}</span></p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Reg Date:</span> {selectedReg.registration_date}</p>
                  </div>
                </div>

                {selectedReg.payment_proof && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Payment Proof</h4>
                    <a 
                      href={`http://localhost/ahlaad/backend/uploads/${selectedReg.payment_proof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#C9A84C]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">View Screenshot</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Opens in new tab</p>
                        </div>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {selectedReg.entry_type === 'team' && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Team Details ({selectedReg.team_name})</h4>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 max-h-[200px] overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] text-[#C9A84C] font-bold shrink-0">
                          {selectedReg.user_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/90">{selectedReg.user_name}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-tighter">Team Leader</p>
                        </div>
                      </div>
                      {selectedReg.members.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white/60 font-bold shrink-0">
                            {m.member_name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white/90">{m.member_name}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-tighter">Member</p>
                          </div>
                        </div>
                      ))}
                      {selectedReg.members.length === 0 && (
                        <p className="text-[10px] text-white/20 text-center py-4">No team members added yet.</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-3 text-right">Target Size: {selectedReg.team_size}</p>
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => setSelectedReg(null)}
                className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
              >
                Close
              </button>
              {selectedReg.status === 'pending' && (
                <button 
                  onClick={() => {
                    handleApprove(selectedReg.id);
                    setSelectedReg(null);
                  }}
                  className="flex-2 py-3 bg-[#39FF14] text-[#080614] rounded-xl font-bold hover:opacity-90 transition-all text-sm uppercase tracking-widest px-8"
                >
                  Approve Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal (God Mode) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="glass-card w-full max-w-lg p-8 rounded-3xl border border-red-500/40 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-900" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display text-white">Edit User <span className="text-red-400">#{selectedUser.id}</span></h3>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Name</label>
                  <input type="text" value={selectedUser.name} onChange={e => setSelectedUser({...selectedUser, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Email</label>
                  <input type="email" value={selectedUser.email} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Phone</label>
                  <input type="text" value={selectedUser.phone} onChange={e => setSelectedUser({...selectedUser, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Role</label>
                  <select value={selectedUser.role} onChange={e => setSelectedUser({...selectedUser, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none [&>option]:bg-[#080614]">
                    <option value="participant">Participant</option>
                    <option value="admin">Admin</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">College</label>
                  <input type="text" value={selectedUser.college} onChange={e => setSelectedUser({...selectedUser, college: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">College ID</label>
                  <input type="text" value={selectedUser.college_id} onChange={e => setSelectedUser({...selectedUser, college_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-red-400 mb-1 mt-2 font-bold">New Password (Leave blank to keep current)</label>
                <input type="text" placeholder="Enter new password" value={selectedUser.password || ''} onChange={e => setSelectedUser({...selectedUser, password: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => handleUpdateUser(selectedUser)} className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Task Management Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="glass-card w-full max-w-2xl p-8 rounded-3xl border border-blue-500/40 animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-blue-800" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-display text-white mb-1">Tasks for <span className="text-blue-400">{selectedVolunteer.name}</span></h3>
                <p className="text-xs text-white/40">{selectedVolunteer.college} • {selectedVolunteer.phone}</p>
              </div>
              <button onClick={() => setSelectedVolunteer(null)} className="text-white/40 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="flex gap-2 mb-6 shrink-0">
              <input 
                type="text" 
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="Describe new task..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
              <button 
                onClick={() => handleAssignTask(selectedVolunteer.id)}
                className="px-6 py-3 bg-blue-500/20 text-blue-400 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-blue-500/30 transition-all border border-blue-500/30"
              >
                Assign
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {(!selectedVolunteer.tasks || selectedVolunteer.tasks.length === 0) ? (
                <p className="text-center text-white/30 text-xs py-8">No tasks assigned yet.</p>
              ) : (
                selectedVolunteer.tasks.map((task: any) => (
                  <div key={task.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-white/90">{task.task_description}</p>
                      <p className="text-[10px] text-white/30 mt-1">{task.assigned_at}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select 
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider rounded px-3 py-1.5 focus:outline-none appearance-none cursor-pointer ${
                          task.status === 'completed' ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30' :
                          task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          'bg-white/10 text-white/60 border border-white/20'
                        }`}
                      >
                        <option value="pending" className="bg-[#080614]">Pending</option>
                        <option value="in_progress" className="bg-[#080614]">In Progress</option>
                        <option value="completed" className="bg-[#080614]">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

