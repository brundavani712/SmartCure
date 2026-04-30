import React, { useState, useEffect } from 'react';
import { Users, FilePlus, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = ({ token }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [reports, setReports] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contact: '', address: '', illness: '' });
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetch('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setReports(data));
    }
  }, [activeTab, token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessData(null);
    try {
      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessData(data);
        setFormData({ name: '', age: '', gender: 'Male', contact: '', address: '', illness: '' });
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Front Desk / Admin</h1>
        <p style={{ color: 'var(--text-muted)' }}>Patient registration and system reports.</p>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
          <FilePlus size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Register Patient
        </div>
        <div className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <BarChart2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Reports
        </div>
      </div>

      {activeTab === 'register' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>New Patient Demographics</h2>
          {successData && (
            <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>Registration Successful!</strong>
              <p style={{ marginTop: '0.5rem' }}>Patient ID: <strong>{successData.patientId}</strong></p>
              <p>One-Time Password (OTP): <strong>{successData.otp}</strong></p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>* An SMS/Email has been mocked to the patient.</p>
            </div>
          )}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Age</label>
                <input type="number" className="input" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" className="input" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Presenting Illness</label>
              <input type="text" className="input" required placeholder="e.g. Fever, Cough" value={formData.illness} onChange={e => setFormData({...formData, illness: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="input" required style={{ minHeight: '80px', resize: 'vertical' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register & Generate ID</button>
          </form>
        </div>
      )}

      {activeTab === 'reports' && reports && (
        <div>
          <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#e0f2fe', color: 'var(--primary)', borderRadius: '0.5rem' }}><Users size={24} /></div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Patients</p>
                  <h3 style={{ fontSize: '1.5rem' }}>{reports.totalPatients}</h3>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#dcfce7', color: 'var(--success)', borderRadius: '0.5rem' }}><FilePlus size={24} /></div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Today's Registrations</p>
                  <h3 style={{ fontSize: '1.5rem' }}>{reports.dailyRegistrations}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Top Presenting Illnesses</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.topIllnesses}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Doctor Appointment Load</h3>
                  <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                  data={reports.doctorLoad} 
                                  cx="50%" 
                                  cy="50%" 
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  outerRadius={100} 
                                  fill="#8884d8" 
                                  dataKey="load"
                              >
                                  {reports.doctorLoad.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
