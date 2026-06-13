import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState([]);
  const [, setSkills] = useState([]);
  const [formData, setFormData] = useState({ designation: '', department_id: '', phone: '', address: '', salary: '' });
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [deptRes, skillRes, empRes] = await Promise.all([
          API.get('/employees/departments'),
          API.get('/employees/skills'),
          API.get(`/employees/${id}`) // Make sure your backend has GET /api/employees/:id
        ]);
        
        setDepartments(deptRes.data || []);
        setSkills(skillRes.data || []);
        
        if (empRes.data) {
          setFormData({
            designation: empRes.data.designation || '',
            department_id: empRes.data.department_id || '',
            phone: empRes.data.phone || '',
            address: empRes.data.address || '',
            salary: empRes.data.salary || ''
          });
          setSelectedSkills(empRes.data.skills || []);
        }
      } catch (err) {
        setMessage({ text: 'Failed to synchronize row attributes.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        salary: parseFloat(formData.salary),
        skills: selectedSkills
      };
      
      // Hits PUT /api/employees/:id to rewrite row metadata parameters
      await API.put(`/employees/${id}`, payload);
      setMessage({ text: 'Relational metrics updated inside cluster.', type: 'success' });
      setTimeout(() => navigate('/employees'), 1500);
    } catch (err) {
      setMessage({ text: 'Failed to execute modification update routine.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding:'48px'}}>Downloading record parameter logs...</div>;

  return (
    <div style={{ padding: '48px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', color: '#0f172a', margin: '0 0 4px 0' }}>Modify Employee Record</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Update profile parameters for verification audit logging.</p>

      {message.text && (
        <div style={{ 
          padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '500',
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#b91c1c'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>DESIGNATION</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>DEPARTMENT</label>
            <select name="department_id" value={formData.department_id} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
              {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>PHONE</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>SALARY (INR)</label>
            <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>ADDRESS</label>
          <textarea name="address" rows="3" value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <button type="button" onClick={() => navigate('/employees')} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            {submitting ? 'Updating Node...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
