import React, { useState, useEffect } from 'react';
import { Search, Stethoscope, Clock, FileText } from 'lucide-react';

const DoctorDashboard = ({ token, user }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [consultation, setConsultation] = useState({
    diagnosis: '',
    followUp: '',
    drugs: [{ name: '', dosage: '' }]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/patients', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPatients(data));
  }, [token]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addDrugRow = () => {
    setConsultation({ ...consultation, drugs: [...consultation.drugs, { name: '', dosage: '' }] });
  };

  const updateDrug = (index, field, value) => {
    const newDrugs = [...consultation.drugs];
    newDrugs[index][field] = value;
    setConsultation({ ...consultation, drugs: newDrugs });
  };

  const submitConsultation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          ...consultation
        })
      });
      if (res.ok) {
        alert('Consultation saved successfully');
        setSelectedPatient(null);
        setConsultation({ diagnosis: '', followUp: '', drugs: [{ name: '', dosage: '' }] });
      }
    } catch (err) {
      alert('Failed to save consultation');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Doctor Console</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
      </div>

      {!selectedPatient ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Patient Queue</h2>
            <div style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Search ID or Name..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Presenting Illness</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id} onClick={() => setSelectedPatient(p)}>
                    <td style={{ fontWeight: '500', color: 'var(--primary)' }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.age} / {p.gender.charAt(0)}</td>
                    <td><span className="badge warning">{p.illness}</span></td>
                    <td><button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Consult</button></td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No patients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Patient Details</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID</p>
            <p style={{ fontWeight: '600', marginBottom: '1rem' }}>{selectedPatient.id}</p>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name</p>
            <p style={{ fontWeight: '500', marginBottom: '1rem' }}>{selectedPatient.name}</p>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Demographics</p>
            <p style={{ marginBottom: '1rem' }}>{selectedPatient.age} yrs • {selectedPatient.gender}</p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Reported Illness</p>
            <p style={{ color: 'var(--danger)', fontWeight: '500', marginBottom: '2rem' }}>{selectedPatient.illness}</p>

            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setSelectedPatient(null)}>
              Back to Queue
            </button>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope color="var(--primary)" /> Consultation Notes
            </h2>
            
            <form onSubmit={submitConsultation}>
              <div className="form-group">
                <label>Clinical Diagnosis</label>
                <textarea 
                  className="input" 
                  required 
                  style={{ minHeight: '100px' }}
                  value={consultation.diagnosis}
                  onChange={e => setConsultation({...consultation, diagnosis: e.target.value})}
                  placeholder="Enter detailed diagnosis..."
                ></textarea>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Prescription</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addDrugRow}>+ Add Drug</button>
                </div>
                
                {consultation.drugs.map((drug, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <input type="text" className="input" placeholder="Drug Name (e.g. Paracetamol)" value={drug.name} onChange={e => updateDrug(idx, 'name', e.target.value)} required />
                    <input type="text" className="input" placeholder="Dosage (e.g. 500mg BID)" value={drug.dosage} onChange={e => updateDrug(idx, 'dosage', e.target.value)} required />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Follow-up Date</label>
                <input type="date" className="input" required value={consultation.followUp} onChange={e => setConsultation({...consultation, followUp: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary"><FileText size={16} style={{ marginRight: '0.5rem' }}/> Save Consultation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
