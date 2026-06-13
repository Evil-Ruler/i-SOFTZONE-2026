import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userRole = (localStorage.getItem('role') || 'user').toLowerCase();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await API.get('/employees/list');
        setEmployees(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to query combined database relations.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this profile?")) return;
    try {
      await API.delete(`/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      alert("System Execution Mismatch: Restricted to Full System Administrators.");
    }
  };

  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.spinner}></div>
        <p>Parsing relational data matrices...</p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      <header style={styles.headerBlock}>
        <div>
          <h1 style={styles.title}>Workforce Directory</h1>
          <p style={styles.subtitle}>Relational table displaying real-time data fetched via SQL INNER JOIN queries.</p>
        </div>
        {userRole === 'admin' && (
          <button onClick={() => navigate('/employees/create')} style={styles.actionBtn}>
            ➕ Onboard New Employee
          </button>
        )}
      </header>

      {error && <div style={styles.errorAlert}>⚠️ Configuration Alert: {error}</div>}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              <th style={styles.th}>Employee Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Designation</th>
              <th style={styles.th}>System Controls</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} style={styles.emptyCell}>
                  No active employee profiles found across local Postgres clusters.
                </td>
              </tr>
            ) : (
              employees.map((emp, idx) => (
                <tr key={emp.id} style={idx % 2 === 1 ? styles.tableRowAlternate : {}}>
                  <td style={styles.td}><strong>{emp.employee_name}</strong><br/><span style={{fontSize:'12px', color:'#64748b'}}>{emp.employee_email}</span></td>
                  <td style={styles.td}><span style={styles.deptTag}>{emp.department_name || 'General Node'}</span></td>
                  <td style={styles.td}>{emp.designation}</td>
                  <td style={styles.td}>
                    {userRole === 'admin' ? (
                      <>
                        <button onClick={() => navigate(`/employees/edit/${emp.profile_id || emp.id}`)} style={styles.editBtn}>✏️ Modify</button>
                        <button onClick={() => handleDelete(emp.profile_id || emp.id)} style={styles.deleteBtn}>🗑️ Purge</button>
                      </>
                    ) : (
                      <span style={{color: '#94a3b8', fontSize: '13px'}}>Read-Only Privileges</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  listContainer: { padding: '48px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  headerBlock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
  subtitle: { fontSize: '15px', color: '#64748b', margin: 0 },
  actionBtn: { padding: '12px 24px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  errorAlert: { backgroundColor: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' },
  tableCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  tableHeadRow: { borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' },
  th: { padding: '14px 16px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px' },
  td: { padding: '16px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  tableRowAlternate: { backgroundColor: '#f8fafc' },
  emptyCell: { padding: '48px', textAlign: 'center', color: '#64748b' },
  deptTag: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  editBtn: { background: 'none', border: 'none', color: '#2563eb', marginRight: '16px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' },
  centerScreen: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default EmployeeList;
