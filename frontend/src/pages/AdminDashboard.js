import React, { useEffect, useState } from 'react';
import API from '../api';

const AdminDashboard = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Triggers the secure Phase 7 RBAC backend endpoint
        const response = await API.get('/user/admin-dashboard');
        setData(response.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Access Denied: Lacking clearance nodes.');
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#3b82f6' }}>🛡️ iSOFTZONE EMS Admin Panel</h1>
      <p>Security Privilege Level: Elevated Administrator Matrix</p>
      {error && <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '15px', borderRadius: '6px', marginTop: '20px' }}>⚠️ {error}</div>}
      {data && <div style={{ backgroundColor: '#1e293b', color: '#4ade80', padding: '15px', borderRadius: '6px', marginTop: '20px', borderLeft: '4px solid #4ade80' }}>✅ Server Response: {data}</div>}
    </div>
  );
};

export default AdminDashboard;