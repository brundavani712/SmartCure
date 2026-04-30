import React, { useState, useEffect } from 'react';
import { Calendar, FileText, CreditCard, User, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PatientPortal = ({ token, user }) => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [consultations, setConsultations] = useState([]);
  const [bills, setBills] = useState([]);
  const [profile, setProfile] = useState(null);
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', timeSlot: '10:00 AM' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProfile(data));

    fetch(`http://localhost:5000/api/consultations/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setConsultations(data));

    fetch(`http://localhost:5000/api/bills/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setBills(data));
      
    // Fetch appointments and doctors
    fetch(`http://localhost:5000/api/appointments/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAppointments(data));
      
    fetch(`http://localhost:5000/api/doctors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
          setDoctors(data);
          if (data.length > 0) setBookingData(prev => ({ ...prev, doctorId: data[0].id }));
      });
  }, [token, user.username, activeTab]); // Re-fetch on tab change to get fresh appointments

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const doctor = doctors.find(d => d.id === bookingData.doctorId);
    try {
        const res = await fetch('http://localhost:5000/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                doctorId: bookingData.doctorId,
                doctorName: doctor.name,
                date: bookingData.date,
                timeSlot: bookingData.timeSlot
            })
        });
        if (res.ok) {
            alert('Appointment booked successfully!');
            // Re-fetch appointments
            const freshAppts = await fetch(`http://localhost:5000/api/appointments/${user.username}`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json());
            setAppointments(freshAppts);
            setBookingData({ ...bookingData, date: '' }); // reset form slightly
        }
    } catch(err) {
        alert('Booking failed.');
    }
  };

  const downloadPrescription = (cons) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(2, 132, 199);
    doc.text('HMS Medical Prescription', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient ID: ${cons.patientId}`, 14, 32);
    doc.text(`Doctor: ${cons.doctorName}`, 14, 38);
    doc.text(`Date: ${new Date(cons.date).toLocaleDateString()}`, 14, 44);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Diagnosis:', 14, 55);
    doc.setFontSize(10);
    doc.text(cons.diagnosis, 14, 62, { maxWidth: 180 });

    const tableData = cons.drugs.map((d, i) => [i + 1, d.name, d.dosage]);
    
    doc.autoTable({
      startY: 75,
      head: [['#', 'Drug Name', 'Dosage Instructions']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });

    const finalY = doc.lastAutoTable.finalY || 75;
    doc.setFontSize(10);
    doc.text(`Follow-up Date: ${new Date(cons.followUp).toLocaleDateString()}`, 14, finalY + 10);
    
    doc.save(`Prescription_${cons.patientId}_${new Date(cons.date).toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Patient Portal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome, {user.name}</p>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Appointments
        </div>
        <div className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
          <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Prescriptions
        </div>
        <div className={`tab ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>
          <CreditCard size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Bills
        </div>
        <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> Profile
        </div>
      </div>

      {activeTab === 'appointments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Book an Appointment</h2>
            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                    <label>Select Doctor</label>
                    <select className="input" value={bookingData.doctorId} onChange={e => setBookingData({...bookingData, doctorId: e.target.value})} required>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input type="date" className="input" required value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Time Slot</label>
                    <select className="input" value={bookingData.timeSlot} onChange={e => setBookingData({...bookingData, timeSlot: e.target.value})} required>
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>01:00 PM</option>
                        <option>02:00 PM</option>
                        <option>03:00 PM</option>
                        <option>04:00 PM</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Book Slot</button>
            </form>
          </div>
          
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>My Appointments</h2>
            <div className="list-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {appointments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled.</p>
                ) : (
                    appointments.map(a => (
                        <div key={a.id} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--primary)' }}>{a.doctorName}</strong>
                                <span className="badge success">{a.status}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                <span>📅 {a.date}</span>
                                <span>⏰ {a.timeSlot}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Medical History</h2>
          {consultations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No prescriptions found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {consultations.map(cons => (
                <div key={cons.id} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{new Date(cons.date).toLocaleDateString()} - {cons.doctorName}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Diagnosis: {cons.diagnosis}</p>
                  </div>
                  <button className="btn btn-outline" onClick={() => downloadPrescription(cons)}>
                    <Download size={16} /> PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Billing & Invoices</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>${b.amount}</td>
                    <td><span className={`badge ${b.status === 'Paid' ? 'success' : 'warning'}`}>{b.status}</span></td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bills found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profile' && profile && (
        <div className="card" style={{ maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Demographics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Patient ID</div>
            <div style={{ fontWeight: '500' }}>{profile.id}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Full Name</div>
            <div style={{ fontWeight: '500' }}>{profile.name}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Age/Gender</div>
            <div>{profile.age} / {profile.gender}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Contact</div>
            <div>{profile.contact}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Address</div>
            <div>{profile.address}</div>
            
            <div style={{ color: 'var(--text-muted)' }}>Registered</div>
            <div>{new Date(profile.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPortal;
