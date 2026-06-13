import React, { useState, useEffect } from 'react';
import API from '../api';

const DepartmentMaster = () => {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      const res = await API.get('/employees/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    try {
      await API.post('/employees/departments', { department_name: newDept });
      setNewDept('');
      setMessage('Department configuration node appended successfully.');
      fetchDepts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error creating department.');
    }
  };

  if (loading) return <div style={{padding: '48px', color: '#64748b'}}>Syncing Department Clusters...</div>;

  return (
    <div style={{ padding: '48px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Department Master</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Instantiate additional organizational nodes dynamically within PostgreSQL.</p>
      
      {message && <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <input 
          type="text" placeholder="e.g. Finance Operations" value={newDept} onChange={(e) => setNewDept(e.target.value)} required
          style={{ flexGrow: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f8fafc' }}
        />
        <button type="submit" style={{ padding: '12px 24px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Instantiate Node
        </button>
      </form>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Active Departments</div>
        {departments.map((dept) => (
          <div key={dept.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
            🏢 <strong>ID {dept.id}:</strong> {dept.department_name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentMaster;
