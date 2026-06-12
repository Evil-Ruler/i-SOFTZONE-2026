import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      setMessage(data.message);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* LEFT SIDE: Premium Enterprise Branding Panel (Mirrored from Login) */}
      <div style={styles.brandingPanel}>
        <div style={styles.overlay}></div>
        <div style={styles.brandingContent}>
          <div style={styles.logoBadge}>iZ</div>
          <h1 style={styles.brandTitle}>iSOFTZONE</h1>
          <h2 style={styles.brandSubtitle}>Employee Management System</h2>
          <p style={styles.brandTagline}>
            Streamline workflows, manage talent, and drive productivity across your entire enterprise architecture.
          </p>
          <div style={styles.footerSpecs}>
            <span>Secure Enterprise Portal v2.4</span>
            <span>•</span>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Signup Workspace */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          <div style={styles.mobileHeader}>
            <span style={styles.mobileLogo}>iZ</span>
            <h3 style={styles.mobileTitle}>iSOFTZONE EMS</h3>
          </div>

          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subheading}>Register your digital credentials to join the portal</p>
          
          {error && <div style={styles.errorAlert}>{error}</div>}
          {message && <div style={styles.successAlert}>{message}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Corporate Email Address</label>
              <input 
                type="email" 
                placeholder="username@isoftzone.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input}
                required 
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Security Password</label>
              <input 
                type="password" 
                placeholder="Create a strong password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input}
                required 
              />
            </div>

            <div style={styles.termsRow}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} required /> I accept the security protocols & terms of use.
              </label>
            </div>

            <button type="submit" style={styles.primaryButton}>
              Register New Account
            </button>
          </form>

          <div style={styles.navContainer}>
  <span style={styles.navText}>Already registered? </span>
  <Link to="/login" style={styles.navLink}>
    Sign In to Dashboard
  </Link>
</div>
        </div>
      </div>
    </div>
  );
};

// Corporate Identity Styling System (Matched perfectly to Login)
const styles = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  brandingPanel: {
    flex: '1.2',
    position: 'relative',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px',
    color: '#ffffff',
    '@media (maxWidth: 960px)': {
      display: 'none',
    },
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  brandingContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '520px',
  },
  logoBadge: {
    width: '56px',
    height: '56px',
    backgroundColor: '#3b82f6',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '32px',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
  },
  brandTitle: {
    fontSize: '42px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 4px 0',
    color: '#ffffff',
  },
  brandSubtitle: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#93c5fd',
    margin: '0 0 24px 0',
  },
  brandTagline: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#cbd5e1',
    margin: '0 0 64px 0',
  },
  footerSpecs: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#ffffff',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  mobileHeader: {
    display: 'none',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  heading: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '15px',
    color: '#64748b',
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0f172a',
  },
  termsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '-4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
  },
  primaryButton: {
    width: '100%',
    padding: '15px',
    fontSize: '15px',
    fontWeight: '600',
    backgroundColor: '#1e3a8a', // Kept deep blue corporate tone for seamless onboarding transitions
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '14px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    border: '1px solid #fca5a5',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    padding: '14px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    border: '1px solid #86efac',
  },
  navContainer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #f1f5f9',
  },
  navText: {
    fontSize: '14px',
    color: '#64748b',
  },
  navLink: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default Signup;