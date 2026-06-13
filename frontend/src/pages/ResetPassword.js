import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); // Reads the ?token=xyz from browser address bar

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('Security mismatch. Passwords do not target identical strings.');
    }

    if (!token) {
      return setError('Core parameters missing. Reset validation token could not be verified.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      setMessage(data.message || 'System architecture updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      
      // Bounce back to sign in screen after successful recovery transaction
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* LEFT SIDE: Matching Branding Panel */}
      <div style={styles.brandingPanel}>
        <div style={styles.overlay}></div>
        <div style={styles.brandingContent}>
          <div style={styles.logoBadge}>iZ</div>
          <h1 style={styles.brandTitle}>iSOFTZONE</h1>
          <h2 style={styles.brandSubtitle}>Employee Management System</h2>
          <p style={styles.brandTagline}>
            Identity credential update gateway. Re-initializing core workspace permissions via encrypted node verification handshake.
          </p>
          <div style={styles.footerSpecs}>
            <span>Secure Enterprise Portal v2.4</span>
            <span>•</span>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Reset Configuration Input Panel */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Update Security Key</h2>
          <p style={styles.subheading}>Rewrite system authorization access password requirements</p>
          
          {error && <div style={styles.errorAlert}>{error}</div>}
          {message && <div style={styles.successAlert}>{message}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New System Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={styles.input}
                disabled={loading}
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Security Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={styles.input}
                disabled={loading}
                required 
              />
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Updating Credentials...' : 'Commit System Password Rewrite'}
            </button>
          </form>

          <div style={styles.navContainer}>
            <Link to="/login" style={styles.navLink}>Cancel Operation & Return</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mirroring Exact Styles across the entire core suite
const styles = {
  pageWrapper: { display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', margin: 0, padding: 0, boxSizing: 'border-box', overflowX: 'hidden' },
  brandingPanel: { flex: '1.2', position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', color: '#ffffff' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  brandingContent: { position: 'relative', zIndex: 2, maxWidth: '520px' },
  logoBadge: { width: '56px', height: '56px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '32px', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' },
  brandTitle: { fontSize: '42px', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 4px 0', color: '#ffffff' },
  brandSubtitle: { fontSize: '20px', fontWeight: '400', color: '#93c5fd', margin: '0 0 24px 0' },
  brandTagline: { fontSize: '16px', lineHeight: '1.6', color: '#cbd5e1', margin: '0 0 64px 0' },
  footerSpecs: { display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', fontWeight: '500' },
  formPanel: { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', backgroundColor: '#ffffff' },
  card: { width: '100%', maxWidth: '420px' },
  heading: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  subheading: { fontSize: '15px', color: '#64748b', margin: '0 0 32px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '14px 16px', fontSize: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', color: '#0f172a' },
  primaryButton: { width: '100%', padding: '15px', fontSize: '15px', fontWeight: '600', backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)' },
  errorAlert: { backgroundColor: '#fef2f2', color: '#b91c1c', padding: '14px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', border: '1px solid #fca5a5' },
  successAlert: { backgroundColor: '#f0fdf4', color: '#15803d', padding: '14px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', border: '1px solid #86efac' },
  navContainer: { textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' },
  navLink: { fontSize: '14px', color: '#64748b', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }
};

export default ResetPassword;
