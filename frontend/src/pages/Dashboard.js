import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }


        // Fetch user data from Phase 3 Backend API
        const response = await API.get('/user/profile');


        setProfile(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to establish terminal session profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Mock metric blocks to fill out the user interface cleanly
  const systemMetrics = [
    { title: 'Assigned Core Tasks', value: '12', change: '+2 this week', color: '#2563eb' },
    { title: 'Project Status', value: '89%', change: 'On Schedule', color: '#16a34a' },
    { title: 'System Node Access', value: 'Level 2', change: 'Standard Security', color: '#7c3aed' },
  ];

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Synchronizing iSOFTZONE EMS Cloud Nodes...</p>
      </div>
    );
  }

  // Fallback state if your backend route isn't fully wired yet (Phase 3 testing)
  const user = profile || {
    name: 'John Doe',
    email: 'j.doe@isoftzone.com',
    role: 'Senior Project Manager',
    lastLogin: new Date().toLocaleString(),
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* SIDEBAR NAVIGATION */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBadge}>iZ</div>
          <div>
            <h2 style={styles.sidebarTitle}>iSOFTZONE</h2>
            <span style={styles.sidebarSubtitle}>EMS PORTAL v2.4</span>
          </div>
        </div>



        <nav style={styles.sidebarNav}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'overview' ? styles.navItemActive : styles.navItemInactive)
            }}
          >
            <span style={{ marginRight: '10px' }}>👤</span> My Profile
          </button>
        </nav>



        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            📴 Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN DATA WORKSPACE */}
      <main style={styles.mainContent}>
        {/* UPPER HEADER BAR */}
        <header style={styles.topHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {user.name.split(' ')[0]}</h1>
            <p style={styles.welcomeSubtitle}>Here is what's happening across the enterprise platform today.</p>
          </div>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{user.name.charAt(0)}</div>
            <div style={styles.userBadgeInfo}>
              <span style={styles.badgeName}>{user.name}</span>
              <span style={styles.badgeRole}>{user.role.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {error && <div style={styles.errorBanner}>⚠️ Configuration Alert: {error} (Displaying sandbox state)</div>}

        {/* WORKSPACE VIEWS */}
        {activeTab === 'overview' && (
          <>
            {/* GRID OF METRICS */}
            <section style={styles.metricsGrid}>
              {systemMetrics.map((metric, i) => (
                <div key={i} style={styles.metricCard}>
                  <div style={{ ...styles.metricIndicator, backgroundColor: metric.color }}></div>
                  <span style={styles.metricTitle}>{metric.title}</span>
                  <span style={styles.metricValue}>{metric.value}</span>
                  <span style={styles.metricChange}>{metric.change}</span>
                </div>
              ))}
            </section>

            {/* PHASE 3 USER REGISTRATION SPECIFICATIONS CARD */}
            <section style={styles.dataSection}>
              <h3 style={styles.sectionHeader}>Active Credential Profile</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeadRow}>
                      <th style={styles.th}>Data Architecture Parameter</th>
                      <th style={styles.th}>Current Verified Environment Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}><strong>Full Legal Name</strong></td>
                      <td style={styles.td}>{user.name}</td>
                    </tr>
                    <tr style={styles.tableRowAlternate}>
                      <td style={styles.td}><strong>Corporate Communication Email</strong></td>
                      <td style={styles.td}>{user.email}</td>
                    </tr>
                    <tr>
                      <td style={styles.td}><strong>Assigned Access Role Privilege</strong></td>
                      <td style={styles.td}>
                        <span style={styles.roleTag}>{user.role}</span>
                      </td>
                    </tr>
                    <tr style={styles.tableRowAlternate}>
                      <td style={styles.td}><strong>Last Terminal Session Handshake</strong></td>
                      <td style={styles.td}>{user.lastLogin}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'profile' && (
          <section style={styles.dataSection}>
            <h3 style={styles.sectionHeader}>Full Employee File</h3>
            <p style={styles.placeholderText}>This screen connects directly to Prisma Model queries inside Phase 8 setup parameters.</p>
          </section>
        )}

        {activeTab === 'settings' && (
          <section style={styles.dataSection}>
            <h3 style={styles.sectionHeader}>Enterprise Security Configurations</h3>
            <p style={styles.placeholderText}>Role privileges, token refresh tracking, and encryption node adjustments live here.</p>
          </section>
        )}
      </main>
    </div>
  );
};

// Executive EMS UI System Styling Model
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    margin: 0, padding: 0, boxSizing: 'border-box',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 24px',
    borderRight: '1px solid #1e293b',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '48px',
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    backgroundColor: '#3b82f6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navItem: {
    width: '100%',
    padding: '14px 16px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontWeight: '600',
  },

  navItemInactive: {
    backgroundColor: 'transparent',      // Removes any stuck background highlight
    color: '#94a3b8',                    // Soft slate gray text for closed windows
    borderLeft: '3px solid transparent', // Prevents layout shifting when swapping states
    paddingLeft: '13px',
  },


  sidebarFooter: {
    paddingTop: '24px',
    borderTop: '1px solid #1e293b',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mainContent: {
    flexGrow: 1,
    padding: '48px',
    overflowY: 'auto',
    maxWidth: 'calc(100vw - 280px)',
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '30px', border: '1px solid #e2e8f0',
  }
  , avatar: { width: '36px', height: '36px', backgroundColor: '#1e3a8a', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', }, userBadgeInfo: { display: 'flex', flexDirection: 'column', }, badgeName: { fontSize: '14px', fontWeight: '600', color: '#0f172a', }, badgeRole: { fontSize: '10px', color: '#2563eb', fontWeight: '700', letterSpacing: '0.5px', }, errorBanner: { backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', border: '1px solid #fca5a5', fontWeight: '500', }, metricsGrid: { display: 'flex', gap: '24px', marginBottom: '40px', }, metricCard: { flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', }, metricIndicator: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', }, metricTitle: { fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', }, metricValue: { fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', }, metricChange: { fontSize: '12px', color: '#64748b', fontWeight: '500', }, dataSection: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', }, sectionHeader: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0', }, tableWrapper: { overflowX: 'auto', }, table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px', }, tableHeadRow: { borderBottom: '2px solid #e2e8f0', }, th: { padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', }, td: { padding: '16px', color: '#334155', borderBottom: '1px solid #f1f5f9', }, tableRowAlternate: { backgroundColor: '#f8fafc', }, roleTag: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', }, placeholderText: { color: '#64748b', fontSize: '14px', lineHeight: '1.6', }, loadingScreen: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#0f172a', }, loadingText: { color: '#94a3b8', marginTop: '24px', fontSize: '16px', fontWeight: '500', fontFamily: 'sans-serif', }, spinner: { width: '40px', height: '40px', border: '4px solid #1e293b', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', }
};
export default Dashboard;