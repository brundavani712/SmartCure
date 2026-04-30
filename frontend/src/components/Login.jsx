import React, { useState } from 'react';
import { Activity } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>
          <Activity size={32} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>HMS Portal</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username (or Patient ID)</label>
            <input 
              type="text" 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. admin, doctor, NSR-HMS-2026-..." 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
            Secure Login
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <p>Demo Accounts:</p>
          <p>Admin: admin / admin123</p>
          <p>Doctor: doctor / doc123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
