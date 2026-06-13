import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const CreateEmployee = () => {
  const navigate = useNavigate();
  
  // Data metadata arrays states
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  
  // Track selected values matching your database structural inputs
  const [formData, setFormData] = useState({
    user_id: '',
    designation: '',
    department_id: '',
    phone: '',
    address: '',
    salary: '',
  });
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all structural metadata matrices simultaneously on screen load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [userRes, deptRes, skillRes] = await Promise.all([
          API.get('/employees/unassigned-users'),
          API.get('/employees/departments'),
          API.get('/employees/skills')
        ]);
        setUnassignedUsers(userRes.data || []);
        setDepartments(deptRes.data || []);
        setSkills(skillRes.data || []);
      } catch (err) {
        setError('Failed to fetch system parameter nodes.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('System Restriction Violation: Maximum 5 files allowed.');
      e.target.value = null;
      return;
    }
    setError('');
    setUploadedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let uploadedImageUrls = [];

      // Step 1: Execute asset upload to Multer nodes
      if (uploadedFiles.length > 0) {
        const filePayload = new FormData();
        uploadedFiles.forEach((file) => {
          filePayload.append('images', file);
        });

        const uploadResponse = await API.post('/employees/upload', filePayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrls = uploadResponse.data.urls || [];
      }

      // Step 2: Pack everything into clean transaction parameters
      const jsonPayload = {
        user_id: parseInt(formData.user_id, 10),
        department_id: parseInt(formData.department_id, 10),
        phone: formData.phone,
        address: formData.address,
        designation: formData.designation,
        salary: parseFloat(formData.salary),
        imageUrls: uploadedImageUrls,
        skillIds: selectedSkills
      };

      await API.post('/employees/create', jsonPayload);

      setSuccess('Corporate profile parameters compiled and attached flawlessly!');
      setTimeout(() => navigate('/employees'), 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Relational insertion breakdown.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: '48px', color: '#64748b'}}>Syncing enterprise components...</div>;

  return (
    <div style={styles.formContainer}>
      <header style={styles.headerBlock}>
        <h1 style={styles.title}>Attach Corporate Profile</h1>
        <p style={styles.subtitle}>Select a registered portal identity and define corporate operational parameters.</p>
      </header>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}
      {success && <div style={styles.successAlert}>✅ {success}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.gridFields}>
          
          {/* 🛠️ CHOOSE REGISTERED USER ACCOUNT DROPDOWN */}
          <div style={{ ...styles.inputGroup, gridColumn: 'span 2', marginBottom: '16px' }}>
            <label style={styles.label}>Select Target User Account Ledger</label>
            <select name="user_id" required value={formData.user_id} onChange={handleInputChange} style={styles.select}>
              <option value="">-- Choose Active Account --</option>
              {unassignedUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Corporate Designation</label>
            <input type="text" name="designation" required placeholder="e.g. Lead Developer" value={formData.designation} onChange={handleInputChange} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Assigned Corporate Department</label>
            <select name="department_id" required value={formData.department_id} onChange={handleInputChange} style={styles.select}>
              <option value="">-- Choose Corporate Node --</option>
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.department_name}</option>)}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contact Number</label>
            <input type="text" name="phone" required placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Financial Compensation Tier (INR)</label>
            <input type="number" name="salary" required placeholder="e.g. 60000" value={formData.salary} onChange={handleInputChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.inputGroupFull}>
          <label style={styles.label}>Residential Address Architecture</label>
          <textarea name="address" rows="3" required placeholder="Enter active mailing landmarks" value={formData.address} onChange={handleInputChange} style={styles.textarea} />
        </div>

        <div style={styles.inputGroupFull}>
          <label style={styles.label}>Assign Core Technical Skills (Many-to-Many)</label>
          <div style={styles.skillsGrid}>
            {skills.map(skill => (
              <label key={skill.id} style={{...styles.skillCheckboxCard, ...(selectedSkills.includes(skill.id) ? styles.skillCardActive : {})}}>
                <input type="checkbox" checked={selectedSkills.includes(skill.id)} onChange={() => handleSkillToggle(skill.id)} style={styles.hiddenCheckbox} />
                <span>{skill.skill_name}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.inputGroupFull}>
          <label style={styles.label}>Upload Verification Assets (Max 5 Images: Profile, Aadhar, etc.)</label>
          <div style={styles.uploadZone}>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} style={styles.fileInput} required />
            <p style={styles.uploadHint}>Selected files: {uploadedFiles.length} / 5</p>
          </div>
        </div>

        <div style={styles.actionsBar}>
          <button type="button" onClick={() => navigate('/admin-dashboard')} style={styles.cancelBtn}>Cancel Handshake</button>
          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Committing Parameters...' : 'Commit Operational Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styling layout dictionary matching your framework rules
// Executive EMS UI System Form Styling Model
const styles = {
  formContainer: { 
    padding: '48px', 
    backgroundColor: '#f8fafc', 
    minHeight: '100vh', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    boxSizing: 'border-box'
  },
  headerBlock: { 
    marginBottom: '32px' 
  },
  title: { 
    fontSize: '32px', 
    fontWeight: '700', 
    color: '#0f172a', 
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: { 
    fontSize: '15px', 
    color: '#64748b', 
    margin: 0 
  },
  formCard: { 
    backgroundColor: '#ffffff', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    padding: '32px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
  },
  gridFields: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '24px', 
    marginBottom: '24px' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  inputGroupFull: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px', 
    marginBottom: '24px' 
  },
  label: { 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#475569', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px' 
  },
  input: { 
    padding: '12px 16px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    fontSize: '14px', 
    outline: 'none', 
    transition: 'border 0.2s', 
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  select: { 
    padding: '12px 16px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    fontSize: '14px', 
    outline: 'none', 
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer'
  },
  textarea: { 
    padding: '12px 16px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    fontSize: '14px', 
    outline: 'none', 
    backgroundColor: '#f8fafc', 
    resize: 'vertical',
    color: '#0f172a',
    fontFamily: 'inherit'
  },
  skillsGrid: { 
    display: 'flex', 
    gap: '12px', 
    flexWrap: 'wrap', 
    marginTop: '4px' 
  },
  skillCheckboxCard: { 
    border: '1px solid #e2e8f0', 
    padding: '10px 18px', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: '500', 
    color: '#64748b', 
    cursor: 'pointer', 
    backgroundColor: '#f8fafc', 
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  skillCardActive: { 
    backgroundColor: '#e0f2fe', 
    color: '#0369a1', 
    borderColor: '#38bdf8' 
  },
  hiddenCheckbox: { 
    marginRight: '8px',
    cursor: 'pointer'
  },
  uploadZone: { 
    border: '2px dashed #e2e8f0', 
    padding: '24px', 
    borderRadius: '8px', 
    textAlign: 'center', 
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  fileInput: { 
    fontSize: '14px', 
    color: '#475569',
    cursor: 'pointer'
  },
  uploadHint: { 
    margin: '8px 0 0 0', 
    fontSize: '12px', 
    color: '#64748b', 
    fontWeight: '500' 
  },
  actionsBar: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '16px', 
    borderTop: '1px solid #e2e8f0', 
    paddingTop: '24px', 
    marginTop: '32px' 
  },
  cancelBtn: { 
    padding: '12px 24px', 
    border: '1px solid #e2e8f0', 
    background: 'none', 
    color: '#64748b', 
    borderRadius: '8px', 
    fontWeight: '600', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  submitBtn: { 
    padding: '12px 24px', 
    border: 'none', 
    backgroundColor: '#2563eb', 
    color: '#ffffff', 
    borderRadius: '8px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'opacity 0.2s'
  },
  errorAlert: { 
    backgroundColor: '#fef2f2', 
    color: '#b91c1c', 
    padding: '16px', 
    borderRadius: '8px', 
    border: '1px solid #fca5a5', 
    marginBottom: '24px', 
    fontWeight: '500',
    fontSize: '14px'
  },
  successAlert: { 
    backgroundColor: '#f0fdf4', 
    color: '#16a34a', 
    padding: '16px', 
    borderRadius: '8px', 
    border: '1px solid #bbf7d0', 
    marginBottom: '24px', 
    fontWeight: '500',
    fontSize: '14px'
  },
  centerScreen: { 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    color: '#64748b',
    backgroundColor: '#f8fafc',
    gap: '16px'
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '4px solid #e2e8f0', 
    borderTop: '4px solid #3b82f6', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};

export default CreateEmployee;