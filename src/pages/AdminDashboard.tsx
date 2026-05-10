import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Users, FileText, Download, BarChart3, Search, Check, Clock,
  CheckCircle, Menu, X, Settings, QrCode, Plus, Trash2,
  Trophy, Activity, TrendingUp
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config';
import { usePagination } from '../hooks/usePagination';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import PaginationControls from '../components/PaginationControls';
import { useNotification } from '../components/Notification';

gsap.registerPlugin(ScrollTrigger);

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'users' | 'checkin_status' | 'teams_report'>('overview');
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [checkinUsers, setCheckinUsers] = useState<any[]>([]);
  const [checkinSearchQuery, setCheckinSearchQuery] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineRegId, setDeclineRegId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ member_name: '', email: '', phone: '', college: '', college_id: '' });
  const [analytics, setAnalytics] = useState<any>(null);
  const [itemsPerPage = 10] = useState(10);
  const isEditingRef = useRef(false);

  const setEditingStatus = (status: boolean) => {
    // We only need the ref for polling, but keeping state for potential UI triggers
    isEditingRef.current = status;
  };

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [selectedEventForModal, setSelectedEventForModal] = useState<string | null>(null);

  useEffect(() => {
    if (selectedReg) {
      setNewMember({
        member_name: '',
        email: '',
        phone: '',
        college: selectedReg.college || '',
        college_id: ''
      });
      setShowAddMemberForm(false);
    }
  }, [selectedReg]);

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

  const downloadExcelReport = (type: 'registrations' | 'checkins' | 'teams') => {
    if (type === 'registrations') {
      if (registrations.length === 0) {
        alert('No registration records available to download.');
        return;
      }

      const headers = ['S.No', 'TID', 'Team ID', 'Participant Name', 'Email', 'Phone', 'College', 'College ID', 'Event/Competition', 'Entry Type', 'Team Name', 'Members Count', 'Fee (Rupees)', 'UTR ID', 'Registration Date', 'Status', 'Pass ID'];
      const rows = registrations.map((reg, index) => [
        index + 1,
        reg.tid || '',
        reg.team_id || 'N/A',
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

      const csvRows = [
        headers.join(','),
        ...rows.map((row: any[]) =>
          row.map((val: any) => {
            const strVal = val === null || val === undefined ? '' : String(val);
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      const csvContent = "\uFEFF" + csvRows.join('\r\n');
      triggerDownload(csvContent, 'ahlaad_2k26_registrations_report.csv');
    } else if (type === 'checkins') {
      if (checkinUsers.length === 0) {
        alert('No check-in records available to download.');
        return;
      }

      const headers = ['S.No', 'TID', 'Team ID', 'Name', 'Email', 'Phone', 'College', 'College ID', 'Event/Competition', 'Role', 'Team Name', 'Pass ID', 'Check-In Status', 'Check-In Time'];
      const rows = checkinUsers.map((u, index) => [
        index + 1,
        u.tid || '',
        u.team_id || 'N/A',
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

      const csvRows = [
        headers.join(','),
        ...rows.map((row: any[]) =>
          row.map((val: any) => {
            const strVal = val === null || val === undefined ? '' : String(val);
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      const csvContent = "\uFEFF" + csvRows.join('\r\n');
      triggerDownload(csvContent, 'ahlaad_2k26_checkin_status_report.csv');
    } else if (type === 'teams') {
      const teamRegs = registrations.filter((reg: any) =>
        reg.entry_type?.toLowerCase() === 'team' ||
        (reg.team_name && reg.team_name !== 'N/A' && reg.team_name !== '')
      );
      if (teamRegs.length === 0) {
        alert('No team registration records available to download.');
        return;
      }

      const headers = ['Team ID', 'Team Name', 'TID', 'Registration ID', 'Role (Team Leader / Member)', 'Person Name', 'College ID', 'Mobile', 'Email', 'Pass ID'];
      const rows: any[] = [];

      teamRegs.forEach((reg: any) => {
        // Add Team Leader
        rows.push([
          reg.team_id || '',
          reg.team_name || '',
          reg.tid || '',
          reg.id || '',
          'Team Leader',
          reg.user_name || '',
          reg.college_id || '',
          reg.phone || '',
          reg.user_email || '',
          reg.pass_id || 'Pending'
        ]);

        // Add Team Members
        if (reg.members && Array.isArray(reg.members)) {
          reg.members.forEach((m: any) => {
            rows.push([
              m.team_id || reg.team_id || '',
              reg.team_name || '',
              m.tid || reg.tid || '',
              reg.id || '',
              'Member',
              m.member_name || '',
              m.college_id || '',
              m.phone || '',
              m.email || '',
              m.pass_id || 'Pending'
            ]);
          });
        }
      });

      const csvRows = [
        headers.join(','),
        ...rows.map((row: any[]) =>
          row.map((val: any) => {
            const strVal = val === null || val === undefined ? '' : String(val);
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      const csvContent = "\uFEFF" + csvRows.join('\r\n');
      triggerDownload(csvContent, 'ahlaad_2k26_teams_report.csv');
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
            ${reg.team_id ? `<br/><span style="font-size: 8px; font-family: monospace; font-weight: bold; color: #a855f7; background-color: rgba(168, 85, 247, 0.1); padding: 1px 4px; border-radius: 4px; display: inline-block; margin-top: 3px;">Team ID: ${escapeHtml(reg.team_id)}</span>` : ''}
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
            ${u.team_id ? `<br/><span style="font-size: 8px; font-family: monospace; font-weight: bold; color: #a855f7; background-color: rgba(168, 85, 247, 0.1); padding: 1px 4px; border-radius: 4px; display: inline-block; margin-top: 3px;">Team ID: ${escapeHtml(u.team_id)}</span>` : ''}
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

      // Set up polling for real-time updates - skip if user is currently interacting with forms
      const interval = setInterval(() => {
        if (!isEditingRef.current && !selectedReg && !selectedUser && !showDeclineModal) {
          fetchAdminData();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedReg || selectedUser || showDeclineModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedReg, selectedUser, showDeclineModal]);

  const fetchAdminData = async () => {
    try {
      const safeFetchJson = async (url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`Fetch to ${url} failed with status: ${res.status}`);
            return { success: false, status: res.status };
          }
          return await res.json();
        } catch (err) {
          console.error(`Failed to parse/fetch JSON from ${url}:`, err);
          return { success: false, error: err };
        }
      };

      const [data, usersData, checkinData, analyticsRes] = await Promise.all([
        safeFetchJson(`${API_BASE_URL}/admin_get_all_data.php`),
        safeFetchJson(`${API_BASE_URL}/admin_get_users.php`),
        safeFetchJson(`${API_BASE_URL}/checkin_get_all.php`),
        safeFetchJson(`${API_BASE_URL}/admin_get_analytics.php`)
      ]);

      if (analyticsRes && analyticsRes.success) {
        setAnalytics(analyticsRes);
      }
      if (data && data.success) {
        setRegistrations(data.registrations);
        // Sync active registration details modal view in real-time
        if (!isEditingRef.current) {
          setSelectedReg((prevSelected: any) => {
            if (!prevSelected) return null;
            const updated = data.registrations.find((r: any) => r.id === prevSelected.id);
            return updated || prevSelected;
          });
        }
        if (data.settings && data.settings.registration_enabled !== undefined) {
          setRegistrationEnabled(data.settings.registration_enabled);
        }
      }
      if (usersData && usersData.success) {
        setAllUsers(usersData.users);
        // Sync active user details modal view in real-time
        if (!isEditingRef.current) {
          setSelectedUser((prevSelected: any) => {
            if (!prevSelected) return null;
            const updated = usersData.users.find((u: any) => u.id === prevSelected.id);
            return updated || prevSelected;
          });
        }
      }
      if (checkinData && checkinData.success) {
        setCheckinUsers(checkinData.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch', error);
      setLoading(false);
    }
  };

  const handleUpdateRegistrationStatus = async (regId: any, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_update_registration_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: Number(regId),
          status: status
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification(`Success: ${data.message}`, 'success');
        if (selectedReg) {
          setSelectedReg({ ...selectedReg, status: status });
          setRegistrations((prev: any[]) => prev.map(r => r.id === selectedReg.id ? { ...r, status: status } : r));
        }
        fetchAdminData();
      } else {
        showNotification(`Error updating status for ID ${regId}: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification(`Network/Server Error for ID ${regId}. Check connection.`, 'error');
    }
  };

  const handleRevertCheckin = async (id: number, role: string) => {
    if (!confirm('Are you sure you want to revert this check-in? This will set them as "Not Checked In".')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin_revert_checkin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Check-in reverted successfully!', 'success');
        fetchAdminData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to revert check-in', 'error');
    }
  };

  const handleApprove = async (regId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_approve_registration.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Approval failed', 'error');
    }
  };

  const handleDecline = async (regId: number, reason: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_decline_registration.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId, decline_reason: reason })
      });
      const data = await response.json();
      if (data.success) {
        setShowDeclineModal(false);
        setDeclineReason('');
        setDeclineRegId(null);
        setEditingStatus(false);
        fetchAdminData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Decline failed', 'error');
    }
  };

  const handleRemoveTeamMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin_remove_team_member.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Team member removed successfully!', 'success');
        if (selectedReg) {
          const updatedMembers = selectedReg.members.filter((m: any) => m.id !== memberId);
          setSelectedReg({
            ...selectedReg,
            members: updatedMembers
          });
          setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? { ...r, members: updatedMembers } : r));
        }
      } else {
        alert(data.message || 'Failed to remove member.');
      }
    } catch (error) {
      console.error(error);
      alert('Error removing team member.');
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMember.member_name || !newMember.email || !newMember.phone || !newMember.college || !newMember.college_id) {
      alert('Please fill in all member details.');
      return;
    }

    // Validations (matching add_team_member.php standards for high security)
    if (newMember.member_name.trim().length < 3 || !/^[A-Za-z\s]+$/.test(newMember.member_name)) {
      alert('Member Name must be at least 3 characters and contain only letters and spaces.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      alert('Invalid email address format.');
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(newMember.phone)) {
      alert('Phone Number must be a valid 10-digit Indian mobile number.');
      return;
    }
    if (newMember.college.trim().length < 3) {
      alert('College Name must be at least 3 characters.');
      return;
    }
    if (newMember.college_id.trim().length < 2) {
      alert('College ID must be at least 2 characters.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add_team_member.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: selectedReg.id,
          ...newMember,
          bypass_limit: true
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Team member added successfully!');
        fetchAdminData(); // Refresh all state
        // Close modal and let admin re-open or update selectedReg with new member list
        const updatedResponse = await fetch(`${API_BASE_URL}/admin_get_all_data.php`);
        const updatedData = await updatedResponse.json();
        if (updatedData.success && selectedReg) {
          const freshReg = updatedData.registrations.find((r: any) => r.id === selectedReg.id);
          if (freshReg) {
            setSelectedReg(freshReg);
          }
        }
        setNewMember({
          member_name: '',
          email: '',
          phone: '',
          college: selectedReg.college || '',
          college_id: ''
        });
        setShowAddMemberForm(false);
        setEditingStatus(false);
      } else {
        showNotification(data.message || 'Failed to add member.', 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification('Error adding team member.', 'error');
    }
  };



  const handleToggleRegistration = async () => {
    try {
      const newStatus = !registrationEnabled;
      const response = await fetch(`${API_BASE_URL}/toggle_registration.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setRegistrationEnabled(newStatus);
      } else {
        showNotification(data.message || 'Toggle failed', 'error');
      }
    } catch (error) {
      showNotification('Toggle failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ahlaad_user');
    navigate('/');
  };

  const handleUpdateUser = async (updatedData: any) => {
    // --- FRONTEND VALIDATIONS ---
    const nameTrimmed = (updatedData.name || '').trim();
    if (nameTrimmed.length < 3 || !/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      showNotification('Full Name must be at least 3 characters and contain only letters and spaces.', 'warning');
      return;
    }

    const emailTrimmed = (updatedData.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      showNotification('Please enter a valid email address.', 'warning');
      return;
    }

    const phoneTrimmed = (updatedData.phone || '').trim();
    if (!/^[6-9]\d{9}$/.test(phoneTrimmed)) {
      showNotification('Phone Number must be a valid 10-digit Indian mobile number starting with 6,7,8 or 9.', 'warning');
      return;
    }

    const collegeTrimmed = (updatedData.college || '').trim();
    if (collegeTrimmed.length < 3) {
      showNotification('College Name must be at least 3 characters.', 'warning');
      return;
    }

    const collegeIdTrimmed = (updatedData.college_id || '').trim();
    if (collegeIdTrimmed.length < 2) {
      showNotification('College ID must be at least 2 characters.', 'warning');
      return;
    }

    if (updatedData.password && updatedData.password.length < 6) {
      showNotification('Password must be at least 6 characters.', 'warning');
      return;
    }
    // ----------------------------

    try {
      const response = await fetch(`${API_BASE_URL}/admin_update_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          name: nameTrimmed,
          email: emailTrimmed,
          phone: phoneTrimmed,
          college: collegeTrimmed,
          college_id: collegeIdTrimmed
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('User updated successfully', 'success');
        fetchAdminData();
        setSelectedUser(null);
        setEditingStatus(false);
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user completely? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin_delete_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  };




  // --- SEARCH AND PAGINATION HOOKS ---

  // 1. Participants (Registrations)
  const filteredRegsByStatus = useMemo(() => {
    return registrations.filter((reg: any) => registrationFilter === 'all' || reg.status === registrationFilter);
  }, [registrations, registrationFilter]);

  const searchResultsRegs = useAdvancedSearch(
    filteredRegsByStatus,
    searchQuery,
    ['user_name', 'college', 'user_email', 'team_name', 'competition', 'pass_id', 'utr_id']
  );

  const finalRegs = useMemo(() => {
    return searchQuery.trim() ? searchResultsRegs.map((r: any) => r.item) : filteredRegsByStatus;
  }, [searchQuery, searchResultsRegs, filteredRegsByStatus]);

  const regsPagination = usePagination(finalRegs, itemsPerPage);

  // 2. Users
  const searchResultsUsers = useAdvancedSearch(
    allUsers,
    usersSearchQuery,
    ['name', 'email', 'phone', 'college', 'college_id', 'role']
  );

  const finalUsers = useMemo(() => {
    return usersSearchQuery.trim() ? searchResultsUsers.map((r: any) => r.item) : allUsers;
  }, [usersSearchQuery, searchResultsUsers, allUsers]);

  const usersPagination = usePagination(finalUsers, itemsPerPage);



  // 4. Check-ins
  const filteredCheckinByStatus = useMemo(() => {
    return checkinUsers.filter((u: any) => {
      if (checkinFilter === 'checked_in') return u.checked_in === 1;
      if (checkinFilter === 'not_checked_in') return u.checked_in !== 1;
      return true;
    });
  }, [checkinUsers, checkinFilter]);

  const searchResultsCheckin = useAdvancedSearch(
    filteredCheckinByStatus,
    checkinSearchQuery,
    ['name', 'email', 'phone', 'college', 'pass_id', 'team_name', 'competition']
  );

  const finalCheckin = useMemo(() => {
    return checkinSearchQuery.trim() ? searchResultsCheckin.map((r: any) => r.item) : filteredCheckinByStatus;
  }, [checkinSearchQuery, searchResultsCheckin, filteredCheckinByStatus]);

  const checkinPagination = usePagination(finalCheckin, itemsPerPage);

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
            onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-white/60 hover:bg-white/5'}`}
          >

            <Settings className="w-5 h-5" />
            Manage Users
          </button>

          <button
            onClick={() => { setActiveTab('checkin_status'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'checkin_status' ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <QrCode className="w-5 h-5 text-emerald-400" />
            Check-In
          </button>
          <button
            onClick={() => { setActiveTab('teams_report'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'teams_report' ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Trophy className="w-5 h-5 text-purple-400" />
            Teams Report
          </button>
          <button
            onClick={() => { navigate('/checkin'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all font-bold"
          >
            <QrCode className="w-5 h-5" />
            Check-In Desk
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 min-h-screen flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-white/60 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display">
                {activeTab === 'overview' ? 'System Overview' :
                  activeTab === 'participants' ? 'Manage Registrations' :
                    activeTab === 'checkin_status' ? 'Check-In Overview' :
                      activeTab === 'teams_report' ? 'Teams Registration Report' :
                        'User Management'}
              </h1>
              <p className="text-xs md:text-sm text-white/40">Ahlaad 2K26 Administrative Control Center</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={handleToggleRegistration}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${registrationEnabled ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/20'}`}
            >
              {registrationEnabled ? 'Stop Registration' : 'Start Registration'}
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/60 transition-all flex items-center justify-center"
              title="Refresh Data"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
            </button>
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
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

                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-2">Team Details Report</p>
                        <div className="grid grid-cols-1 gap-1">
                          <button
                            onClick={() => {
                              downloadExcelReport('teams');
                              setIsReportDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-all text-white/80 hover:text-[#39FF14]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Excel / CSV Spreadsheet
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
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: 'Registered', val: analytics?.stats?.total_participants || 0, icon: Users, col: '#C9A84C', sub: 'Total persons' },
                { label: 'Payments', val: analytics?.stats?.payments_count || 0, icon: FileText, col: '#00FFFF', sub: 'Successful' },
                { label: 'Approved', val: analytics?.stats?.approved_count || 0, icon: CheckCircle, col: '#39FF14', sub: 'Paid teams' },
                { label: 'Passes', val: analytics?.stats?.passes_count || 0, icon: QrCode, col: '#FFD700', sub: 'Generated' },
                { label: 'Checked-In', val: analytics?.stats?.checkin_count || 0, icon: Activity, col: '#39FF14', sub: 'At venue' },
                { label: 'Teams In', val: analytics?.stats?.teams_in_count || 0, icon: Trophy, col: '#FF3131', sub: 'Team checkins' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5" style={{ color: stat.col }} />
                    </div>
                  </div>
                  <h4 className="text-2xl font-display text-white">{stat.val}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">{stat.label}</p>
                  <p className="text-[9px] text-white/20 mt-0.5 italic">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Daily Trend */}
              <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/10 bg-white/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-display flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      Registration Velocity
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Daily signup trends for last 14 days</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.daily_trend || []}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#ffffff30"
                        fontSize={10}
                        tickFormatter={(val) => val ? val.split('-').slice(1).join('/') : ''}
                      />
                      <YAxis stroke="#ffffff30" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0d0b1e', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#C9A84C" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Check-in Progress */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white/[0.01] flex flex-col">
                <h3 className="text-lg font-display mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#39FF14]" />
                  Check-in Status
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-6">Real-time attendance ratio</p>

                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Checked In', value: analytics?.stats?.checkin_count || 0, color: '#39FF14' },
                          { name: 'Pending', value: Math.max(0, (analytics?.stats?.total_participants || 0) - (analytics?.stats?.checkin_count || 0)), color: '#FF3131' }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {[
                          { name: 'Checked In', value: analytics?.stats?.checkin_count || 0, color: '#39FF14' },
                          { name: 'Pending', value: Math.max(0, (analytics?.stats?.total_participants || 0) - (analytics?.stats?.checkin_count || 0)), color: '#FF3131' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-display text-white">
                      {Math.round(((analytics?.stats?.checkin_count || 0) / (analytics?.stats?.total_participants || 1)) * 100)}%
                    </span>
                    <span className="text-[8px] uppercase text-white/40 font-bold">Attendance</span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  {[
                    { name: 'Checked In', value: analytics?.stats?.checkin_count || 0, color: '#39FF14' },
                    { name: 'Pending', value: Math.max(0, (analytics?.stats?.total_participants || 0) - (analytics?.stats?.checkin_count || 0)), color: '#FF3131' }
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-white/60">{d.name}</span>
                      </div>
                      <span className="font-mono font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Grid */}
              <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/10 bg-white/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-display flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#C9A84C]" />
                      Recent Activity
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Latest 9 registration events from the database</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(analytics?.recent_activity || []).map((reg: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                      onClick={() => {
                        const fullReg = registrations.find(full => full.id === reg.id);
                        setSelectedReg(fullReg || reg);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] font-bold text-xs">
                          {reg.user_name[0]}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {reg.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-[#C9A84C] transition-colors line-clamp-1">{reg.user_name}</p>
                      <p className="text-[10px] text-white/40 mb-2">{reg.competition}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">
                          {reg.entry_type}
                        </span>
                        <span className="text-[9px] text-white/20">
                          {reg.registration_date.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Standings & Registration Summary */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white/[0.01] flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-display mb-2 flex items-center gap-2 text-[#C9A84C]">
                    <Trophy className="w-5 h-5 text-[#C9A84C]" />
                    Event Analytics
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Registration & Check-In Summary</p>

                  <div data-lenis-prevent className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {[
                      'Short Films', 'Rock Band', 'Photography', 'Singing', 'Cover Song',
                      'Dance — Classical Solo', 'Dance — Classical Group',
                      'Dance — Western Solo', 'Dance — Western Group',
                      'Drama / Skit', 'Painting', 'Handicrafts'
                    ].map((evt) => {
                      const eventRegs = registrations.filter(r => r.competition === evt && r.status === 'confirmed');
                      const registeredCount = eventRegs.length;
                      const checkedInCount = eventRegs.filter(r => {
                        return checkinUsers.some(u => u.registration_id == r.id && u.checked_in === 1);
                      }).length;

                      return (
                        <div
                          key={evt}
                          onClick={() => setSelectedEventForModal(evt)}
                          className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-[#C9A84C]/40 transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-[#C9A84C] transition-colors line-clamp-1">{evt}</h4>
                            <p className="text-[9px] text-white/40 uppercase tracking-wider font-semibold font-mono">
                              Reg: <span className="text-white font-bold">{registeredCount}</span>
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${checkedInCount === registeredCount && registeredCount > 0 ? 'bg-[#39FF14]/20 text-[#39FF14]' : checkedInCount > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/30'}`}>
                              IN: {checkedInCount} / {registeredCount}
                            </span>
                            {/* Progress track bar */}
                            <div className="w-14 bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-gradient-to-r from-[#C9A84C] to-[#39FF14] h-full rounded-full transition-all duration-500"
                                style={{ width: `${registeredCount > 0 ? (checkedInCount / registeredCount) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 font-mono">
                  <span>SYSTEM STATUS:</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
        {activeTab === 'teams_report' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-display">Teams Registration Report</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Unified view of teams and individual participants</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  placeholder="Filter by Team Name or Event..."
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 bg-white/5">
                    <th className="px-8 py-5 font-bold">Team / Participant Name</th>
                    <th className="px-8 py-5 font-bold">Event Category</th>
                    <th className="px-8 py-5 font-bold text-center">Status</th>
                    <th className="px-8 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {(analytics?.teams_report || [])
                    .filter((r: any) => {
                      const search = reportSearchQuery.toLowerCase();
                      return (r.team_name?.toLowerCase() || r.leader_name?.toLowerCase()).includes(search) ||
                        r.competition?.toLowerCase().includes(search);
                    })
                    .map((reg: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[#C9A84C]">
                              {reg.entry_type === 'team' ? 'T' : 'I'}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                                {reg.team_name || reg.leader_name}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {reg.entry_type === 'team' ? `Leader: ${reg.leader_name} (${reg.member_count} members)` : 'Individual'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-white/60">{reg.competition}</span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => {
                              // We need to find the full registration object from the main 'registrations' state
                              const fullReg = registrations.find(full => full.id === reg.id);
                              setSelectedReg(fullReg || reg);
                            }}
                            className="px-4 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] rounded-lg hover:bg-[#C9A84C] hover:text-[#080614] transition-all text-xs font-bold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <h3 className="text-xl font-display">Registration List</h3>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                {/* Status Filter Tab Buttons */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => { setRegistrationFilter('all'); regsPagination.goToPage(1); }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${registrationFilter === 'all' ? 'bg-[#C9A84C] text-[#080614] shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setRegistrationFilter('confirmed'); regsPagination.goToPage(1); }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${registrationFilter === 'confirmed' ? 'bg-[#39FF14] text-[#080614] shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => { setRegistrationFilter('pending'); regsPagination.goToPage(1); }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${registrationFilter === 'pending' ? 'bg-yellow-500 text-[#080614] shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => { setRegistrationFilter('cancelled'); regsPagination.goToPage(1); }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${registrationFilter === 'cancelled' ? 'bg-red-500 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                  >
                    Declined
                  </button>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); regsPagination.goToPage(1); }}
                    placeholder="Search participant or college..."
                    className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all w-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
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
                  {regsPagination.paginatedItems.map((reg: any) => (
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
                        {reg.team_name ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                                TEAM-#{String(reg.id).padStart(3, '0')}
                              </span>
                              <p className="font-bold text-xs">{reg.team_name}</p>
                            </div>
                            {reg.entry_type === 'team' && (
                              <p className="text-[10px] text-white/40">{reg.members.length + 1} / {reg.team_size} members</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${reg.status === 'confirmed'
                          ? 'bg-[#39FF14]/20 text-[#39FF14]'
                          : reg.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                          {reg.status === 'cancelled' ? 'declined' : reg.status}
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
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(reg.id); }}
                                className="bg-[#39FF14] text-[#080614] px-3 py-1 rounded text-xs font-bold hover:opacity-80 transition-all flex items-center gap-1 shrink-0"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeclineRegId(reg.id);
                                  setShowDeclineModal(true);
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1 shrink-0"
                              >
                                <X className="w-3 h-3" />
                                Decline
                              </button>
                            </>
                          )}
                          {reg.status === 'confirmed' && (
                            <span className="text-[#39FF14]/60 text-xs flex items-center justify-end gap-1 font-bold">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {reg.status === 'cancelled' && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-red-400 text-xs flex items-center gap-1 font-bold">
                                <X className="w-3 h-3" />
                                Declined
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(reg.id); }}
                                className="bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30 px-3 py-1 rounded text-xs font-bold hover:bg-[#39FF14]/30 transition-all flex items-center gap-1 shrink-0"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <PaginationControls
                currentPage={regsPagination.currentPage}
                totalPages={regsPagination.totalPages}
                totalItems={regsPagination.totalItems}
                itemsPerPage={regsPagination.itemsPerPage}
                onNextPage={regsPagination.nextPage}
                onPrevPage={regsPagination.prevPage}
                onGoToPage={regsPagination.goToPage}
              />
            </div>
          </div>
        )}



        {activeTab === 'users' && (() => {
          return (
            <div className="glass-card rounded-2xl border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(255,0,0,0.1)]">
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-red-500/5">
                <div>
                  <h3 className="text-xl font-display text-red-400 flex items-center gap-2"><Settings className="w-5 h-5" />  User Management</h3>
                  <p className="text-xs text-white/40">Total Users: {allUsers.length} {usersSearchQuery && `(Found ${usersPagination.totalItems})`}</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={usersSearchQuery}
                    onChange={(e) => { setUsersSearchQuery(e.target.value); usersPagination.goToPage(1); }}
                    placeholder="Search name, email, college, ID..."
                    className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all w-full text-white"
                  />
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
                    {usersPagination.paginatedItems.map((u: any) => (
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
                              onClick={() => {
                                setSelectedUser({ ...u, password: '' });
                                setEditingStatus(true);
                              }}
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
                    {usersPagination.totalItems === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-white/30 italic">No users found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <PaginationControls
                  currentPage={usersPagination.currentPage}
                  totalPages={usersPagination.totalPages}
                  totalItems={usersPagination.totalItems}
                  itemsPerPage={usersPagination.itemsPerPage}
                  onNextPage={usersPagination.nextPage}
                  onPrevPage={usersPagination.prevPage}
                  onGoToPage={usersPagination.goToPage}
                />
              </div>
            </div>
          );
        })()}



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
                      onClick={() => { setCheckinFilter('all'); checkinPagination.goToPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${checkinFilter === 'all' ? 'bg-[#C9A84C] text-[#080614]' : 'text-white/60 hover:text-white'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setCheckinFilter('checked_in'); checkinPagination.goToPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${checkinFilter === 'checked_in' ? 'bg-emerald-500 text-[#080614]' : 'text-white/60 hover:text-white'}`}
                    >
                      Checked In
                    </button>
                    <button
                      onClick={() => { setCheckinFilter('not_checked_in'); checkinPagination.goToPage(1); }}
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
                      onChange={(e) => { setCheckinSearchQuery(e.target.value); checkinPagination.goToPage(1); }}
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
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {checkinPagination.paginatedItems.map((u: any) => (
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
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${u.role === 'TEAM LEADER' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' :
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
                        <td className="px-6 py-4 text-right">
                          {u.checked_in === 1 && (
                            <button
                              onClick={() => handleRevertCheckin(u.id, u.role)}
                              className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-[10px] font-bold uppercase tracking-wider"
                              title="Revert Check-in"
                            >
                              Revert
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {checkinPagination.totalItems === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-white/30 italic">
                          No participants match the selected criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <PaginationControls
                  currentPage={checkinPagination.currentPage}
                  totalPages={checkinPagination.totalPages}
                  totalItems={checkinPagination.totalItems}
                  itemsPerPage={checkinPagination.itemsPerPage}
                  onNextPage={checkinPagination.nextPage}
                  onPrevPage={checkinPagination.prevPage}
                  onGoToPage={checkinPagination.goToPage}
                />
              </div>
            </div>
          </div>
        )}
        <footer className="py-8 border-t border-white/5 text-center mt-auto">
          <p className="text-xs text-white/30 font-mono uppercase tracking-[0.2em] mb-1.5">
            Ahlaad 2K26 — AITAM Silver Jubilee Celebration
          </p>
          <p className="text-sm text-white/50 font-light">
            Developed by <a href="https://www.linkedin.com/in/saisateeshwarareddy/" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:text-[#E0C97F] transition-colors underline underline-offset-2 font-bold">T. Saisateeshwara Reddy</a> | Technical Trainer, IIC
          </p>
        </footer>
      </main>

      {/* Event Details Modal */}
      {selectedEventForModal && (() => {
        const eventRegs = registrations.filter(r => r.competition === selectedEventForModal && r.status === 'confirmed');
        return (
          <div data-lenis-prevent className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl p-6 sm:p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8B0000]" />

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[#C9A84C] text-[10px] uppercase tracking-widest font-bold">Event Standing & Analytics</span>
                  <h3 className="font-display text-3xl text-white mt-1">{selectedEventForModal}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">
                    Registered Teams & Individuals ({eventRegs.length} Confirmed)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEventForModal(null)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/60 transition-all font-bold text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Content */}
              <div className="overflow-x-auto">
                {eventRegs.length === 0 ? (
                  <p className="text-center text-white/40 italic py-8">No confirmed registrations for this event yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-3">
                        <th className="pb-3 font-bold px-4">Team / Participant Name</th>
                        <th className="pb-3 font-bold px-4">Type</th>
                        <th className="pb-3 font-bold px-4 text-center">Members Count</th>
                        <th className="pb-3 font-bold px-4 text-center">Check-In Status</th>
                        <th className="pb-3 font-bold px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {eventRegs.map((r, index) => {
                        const isCheckedIn = checkinUsers.some(u => u.registration_id == r.id && u.checked_in === 1);
                        const memberCount = r.entry_type === 'team' ? (1 + (r.members?.length || 0)) : 1;
                        return (
                          <tr key={index} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="py-4 px-4">
                              <p className="font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                                {r.team_name || r.leader_name || r.name}
                              </p>
                              {r.entry_type === 'team' && (
                                <p className="text-[10px] text-white/40">Leader: {r.leader_name}</p>
                              )}
                            </td>
                            <td className="py-4 px-4 uppercase text-xs font-semibold text-white/60">
                              {r.entry_type}
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-xs">
                              {memberCount}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {isCheckedIn ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Checked In
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-white/40 border border-white/10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedReg(r);
                                  setSelectedEventForModal(null);
                                }}
                                className="px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] rounded-lg hover:bg-[#C9A84C] hover:text-[#080614] transition-all text-xs font-bold"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detail Modal */}
      {selectedReg && (
        <div data-lenis-prevent className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/40">
          <div className="glass-card w-full max-w-2xl p-4 sm:p-8 rounded-3xl border border-[#C9A84C]/30 animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto">
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
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">TID:</span> <span className="text-[#C9A84C] font-mono">{selectedReg.tid || 'N/A'}</span></p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">UTR ID:</span> <span className="text-blue-400 font-mono">{selectedReg.utr_id || 'N/A'}</span></p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Pass ID:</span> <span className="text-emerald-400 font-mono">{selectedReg.pass_id || 'N/A'}</span></p>
                    <p className="text-sm text-white/80 flex items-center gap-2"><span className="text-white/20 w-16">Reg Date:</span> {selectedReg.registration_date}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Registration Status</h4>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedReg.status}
                      onChange={(e) => handleUpdateRegistrationStatus(selectedReg.id, e.target.value)}
                      onFocus={() => setEditingStatus(true)}
                      onBlur={() => setEditingStatus(false)}
                      disabled={selectedReg.checked_in === 1}
                      className={`flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none transition-all ${selectedReg.checked_in === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#C9A84C]/50'}`}
                    >
                      <option value="pending" className="bg-[#080614]">Pending</option>
                      <option value="confirmed" className="bg-[#080614]">Confirmed</option>
                      <option value="cancelled" className="bg-[#080614]">Cancelled</option>
                    </select>
                    {selectedReg.checked_in === 1 && (
                      <span className="text-[9px] text-red-400/60 font-bold uppercase italic">Locked (Checked-in)</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Check-in Status</h4>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${selectedReg.checked_in === 1 ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]' : 'bg-white/20'}`} />
                      <p className="text-xs font-bold text-white">
                        {selectedReg.checked_in === 1 ? 'Checked In' : 'Not Checked In'}
                      </p>
                    </div>
                    {selectedReg.checked_in === 1 && (
                      <p className="text-[10px] text-white/40 mt-1 ml-5">at {selectedReg.checked_in_at}</p>
                    )}
                  </div>
                </div>

                {selectedReg.payment_proof && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2 font-bold">Payment Proof</h4>
                    <a
                      href={`${API_BASE_URL}/uploads/${selectedReg.payment_proof}`}
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

                {selectedReg.status === 'cancelled' && selectedReg.decline_reason && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mt-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-red-400 mb-1 font-bold">Decline Reason</h4>
                    <p className="text-sm text-red-200/80">{selectedReg.decline_reason}</p>
                  </div>
                )}
              </div>

              {selectedReg.team_name && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Team Details ({selectedReg.team_name})</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                      TEAM-#{String(selectedReg.id).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 max-h-[300px] overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] text-[#C9A84C] font-bold shrink-0">
                          {selectedReg.user_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/90">{selectedReg.user_name}</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-tighter">Team Leader / Participant</p>
                        </div>
                      </div>
                      {selectedReg.entry_type === 'team' && selectedReg.members && selectedReg.members.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-white/60 font-bold shrink-0">
                              {m.member_name ? m.member_name[0] : 'M'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white/90">{m.member_name}</p>
                              <p className="text-[9px] text-white/40 uppercase tracking-tighter">Member • {m.phone || 'No Phone'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveTeamMember(m.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-1 shrink-0"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ))}
                      {selectedReg.entry_type === 'team' && (!selectedReg.members || selectedReg.members.length === 0) && (
                        <p className="text-[10px] text-white/20 text-center py-4">No team members added yet.</p>
                      )}
                    </div>
                  </div>

                  {selectedReg.entry_type === 'team' && (
                    <div className="mt-3">
                      {!showAddMemberForm ? (
                        <button
                          onClick={() => { setShowAddMemberForm(true); setEditingStatus(true); }}
                          className="w-full py-2 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/20 text-[#39FF14] hover:text-[#39FF14] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Team Member</span>
                        </button>
                      ) : (
                        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-3 mt-2">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h5 className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-bold">Add New Team Member</h5>
                            <button
                              onClick={() => { setShowAddMemberForm(false); setEditingStatus(false); }}
                              className="text-white/40 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase text-white/40 mb-1 font-bold">Member Name</label>
                              <input
                                type="text"
                                value={newMember.member_name}
                                onChange={e => setNewMember({ ...newMember, member_name: e.target.value })}
                                placeholder="Full Name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-white/40 mb-1 font-bold">Email</label>
                              <input
                                type="email"
                                value={newMember.email}
                                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                placeholder="email@address.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-white/40 mb-1 font-bold">Phone Number</label>
                              <input
                                type="tel"
                                value={newMember.phone}
                                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                                placeholder="10-digit Mobile"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase text-white/40 mb-1 font-bold">College ID / Roll No</label>
                              <input
                                type="text"
                                value={newMember.college_id}
                                onChange={e => setNewMember({ ...newMember, college_id: e.target.value })}
                                placeholder="College ID Number"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[9px] uppercase text-white/40 mb-1 font-bold">College Name</label>
                              <input
                                type="text"
                                value={newMember.college}
                                onChange={e => setNewMember({ ...newMember, college: e.target.value })}
                                placeholder="College Name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C9A84C]"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setShowAddMemberForm(false)}
                              className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white/60 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddTeamMember}
                              className="px-4 py-1.5 bg-[#39FF14] hover:opacity-90 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#080614] transition-all"
                            >
                              Add Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-white/30 mt-3 text-right">Target Size: {selectedReg.team_size}</p>
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4 flex-wrap">
              <button
                onClick={() => setSelectedReg(null)}
                className="flex-1 min-w-[120px] py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
              >
                Close
              </button>
              {selectedReg.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setDeclineRegId(selectedReg.id);
                      setShowDeclineModal(true);
                      setEditingStatus(true);
                      setSelectedReg(null);
                    }}
                    className="flex-1 min-w-[120px] py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-sm uppercase tracking-widest"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedReg.id);
                      setSelectedReg(null);
                    }}
                    className="flex-2 min-w-[150px] py-3 bg-[#39FF14] text-[#080614] rounded-xl font-bold hover:opacity-90 transition-all text-sm uppercase tracking-widest px-8"
                  >
                    Approve
                  </button>
                </>
              )}
              {selectedReg.status === 'cancelled' && (
                <button
                  onClick={() => {
                    handleApprove(selectedReg.id);
                    setSelectedReg(null);
                  }}
                  className="flex-2 min-w-[150px] py-3 bg-[#39FF14] text-[#080614] rounded-xl font-bold hover:opacity-90 transition-all text-sm uppercase tracking-widest px-8"
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
        <div data-lenis-prevent className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/60">
          <div className="glass-card w-full max-w-lg p-4 sm:p-8 rounded-3xl border border-red-500/40 animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-900" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display text-white">Edit User <span className="text-red-400">#{selectedUser.id}</span></h3>
              <button onClick={() => { setSelectedUser(null); setEditingStatus(false); }} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Name</label>
                  <input type="text" value={selectedUser.name} onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Email</label>
                  <input type="email" value={selectedUser.email} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Phone</label>
                  <input type="text" value={selectedUser.phone} onChange={e => setSelectedUser({ ...selectedUser, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">Role</label>
                  <select value={selectedUser.role} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none [&>option]:bg-[#080614]">
                    <option value="participant">Participant</option>
                    <option value="admin">Admin</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">College</label>
                  <input type="text" value={selectedUser.college} onChange={e => setSelectedUser({ ...selectedUser, college: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 mb-1">College ID</label>
                  <input type="text" value={selectedUser.college_id} onChange={e => setSelectedUser({ ...selectedUser, college_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-red-400 mb-1 mt-2 font-bold">New Password (Leave blank to keep current)</label>
                <input type="text" placeholder="Enter new password" value={selectedUser.password || ''} onChange={e => setSelectedUser({ ...selectedUser, password: e.target.value })} className="w-full bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => { setSelectedUser(null); setEditingStatus(false); }} className="flex-1 py-3 bg-white/5 rounded-xl text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => { handleUpdateUser(selectedUser); setEditingStatus(false); }} className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}



      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div data-lenis-prevent className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/60">
          <div className="glass-card w-full max-w-md p-4 sm:p-8 rounded-3xl border border-red-500/40 animate-in zoom-in-95 duration-300 relative overflow-hidden bg-[#0d0b1e]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-900" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display text-white">Decline Registration</h3>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setDeclineRegId(null);
                  setEditingStatus(false);
                }}
                className="text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Please specify a reason for declining this registration. The participants will see this reason in their dashboard and will be able to edit and re-submit their form.
              </p>

              <div>
                <label className="block text-[10px] uppercase text-white/40 mb-2 font-bold tracking-wider">Quick Select Reasons</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    'Incorrect UTR ID provided',
                    'Invalid/Fake Payment Screenshot',
                    'Incomplete Team Details',
                    'Incorrect Event Selection',
                    'Payment amount does not match event fee'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setDeclineReason(reason)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${declineReason === reason
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/40 mb-1 font-bold tracking-wider">Custom Reason / Additional Notes</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Type a custom reason or additional details here..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                    setDeclineRegId(null);
                    setEditingStatus(false);
                  }}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!declineReason.trim()) {
                      alert('Please select or enter a reason.');
                      return;
                    }
                    if (declineRegId) {
                      handleDecline(declineRegId, declineReason);
                    }
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-sm uppercase tracking-widest"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

