import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      setMessage(data.message);
      localStorage.setItem('token', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome Back</h2>
        <p style={styles.subheading}>Please enter your details to sign in</p>
        
        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={styles.input}
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={styles.input}
              required 
            />
          </div>
          <button type="submit" style={styles.primaryButton}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

// Reusable styling system object
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05), 0 20px 48px rgba(0, 0, 0, 0.05)',
    padding: '40px',
    textAlign: 'left',
    border: '1px solid #f0f0f0',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subheading: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a4a4a',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #dcdcdc',
    backgroundColor: '#f9f9f9',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#4F46E5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s ease',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid #FCA5A5',
  },
  successAlert: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid #86EFAC',
  }
};

export default Login;
