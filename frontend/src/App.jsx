import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientPortal from './components/PatientPortal';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('hms_token');
    const savedUser = localStorage.getItem('hms_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('hms_token', jwtToken);
    localStorage.setItem('hms_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Force password change for patient first login
  if (user.role === 'patient' && user.forcePasswordChange) {
    return <ForcePasswordChange token={token} onComplete={() => setUser({ ...user, forcePasswordChange: false })} onLogout={handleLogout} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard token={token} />;
      case 'doctor':
        return <DoctorDashboard token={token} user={user} />;
      case 'patient':
        return <PatientPortal token={token} user={user} />;
      default:
        return <div>Invalid Role</div>;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          SmartCure
        </div>
        <div className="nav-menu">
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item" style={{ marginTop: 'auto' }} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </aside>
      <main className="main-content">
        {renderDashboard()}
      </main>
    </div>
  );
}

const ForcePasswordChange = ({ token, onComplete, onLogout }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: password })
      });
      if (res.ok) {
        onComplete();
        const user = JSON.parse(localStorage.getItem('hms_user'));
        user.forcePasswordChange = false;
        localStorage.setItem('hms_user', JSON.stringify(user));
      } else {
        setError('Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Update Password</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>For security, please set a new password for your first login.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update & Continue</button>
            <button type="button" className="btn btn-outline" onClick={onLogout}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
