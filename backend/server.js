const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_hms_key_2026';
const DB_FILE = './db.json';

// Initialize DB if not exists
const defaultDb = {
  users: [
    { id: 'u_admin', username: 'admin', password: bcrypt.hashSync('admin123', 8), role: 'admin', name: 'Front Desk Admin' },
    { id: 'u_dr1', username: 'doctor', password: bcrypt.hashSync('doc123', 8), role: 'doctor', name: 'Dr. Sarah Connor' },
    { id: 'u_dr2', username: 'doctor2', password: bcrypt.hashSync('doc123', 8), role: 'doctor', name: 'Dr. Gregory House' }
  ],
  patients: [],
  consultations: [],
  appointments: [],
  bills: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
}

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name, forcePasswordChange: user.forcePasswordChange }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, forcePasswordChange: user.forcePasswordChange } });
});

app.post('/api/change-password', authenticate, (req, res) => {
  const { newPassword } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  db.users[userIndex].password = bcrypt.hashSync(newPassword, 8);
  db.users[userIndex].forcePasswordChange = false;
  writeDb(db);
  res.json({ message: 'Password updated successfully' });
});

app.post('/api/patients', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, age, gender, contact, address, illness } = req.body;
  const db = readDb();
  const seq = (db.patients.length + 1).toString().padStart(4, '0');
  const patientId = `NSR-HMS-2026-${seq}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const newPatient = { id: patientId, name, age, gender, contact, address, illness, createdAt: new Date().toISOString() };
  const newUser = { id: `u_${patientId}`, username: patientId, password: bcrypt.hashSync(otp, 8), role: 'patient', name: name, forcePasswordChange: true };
  db.patients.push(newPatient);
  db.users.push(newUser);
  writeDb(db);
  res.json({ patientId, otp, message: 'Patient registered successfully.' });
});

app.get('/api/patients', authenticate, (req, res) => {
  if (req.user.role === 'patient') return res.status(403).json({ error: 'Forbidden' });
  res.json(readDb().patients);
});

app.get('/api/patients/:id', authenticate, (req, res) => {
  const patient = readDb().patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  res.json(patient);
});

// DOCTORS
app.get('/api/doctors', authenticate, (req, res) => {
  const doctors = readDb().users.filter(u => u.role === 'doctor').map(d => ({ id: d.id, name: d.name }));
  res.json(doctors);
});

// APPOINTMENTS
app.post('/api/appointments', authenticate, (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
  const { doctorId, doctorName, date, timeSlot } = req.body;
  const db = readDb();
  const newAppt = {
    id: `app_${Date.now()}`,
    patientId: req.user.username,
    patientName: req.user.name,
    doctorId, doctorName, date, timeSlot,
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };
  if(!db.appointments) db.appointments = [];
  db.appointments.push(newAppt);
  writeDb(db);
  res.json({ message: 'Appointment booked successfully' });
});

app.get('/api/appointments/:patientId', authenticate, (req, res) => {
  if (req.user.role === 'patient' && req.user.username !== req.params.patientId) return res.status(403).json({ error: 'Forbidden' });
  const db = readDb();
  res.json((db.appointments || []).filter(a => a.patientId === req.params.patientId));
});

// CONSULTATIONS & BILLS
app.post('/api/consultations', authenticate, (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Forbidden' });
  const { patientId, diagnosis, drugs, followUp } = req.body;
  const db = readDb();
  const consultation = { id: `c_${Date.now()}`, patientId, doctorId: req.user.id, doctorName: req.user.name, diagnosis, drugs, followUp, date: new Date().toISOString() };
  db.consultations.push(consultation);
  const bill = { id: `b_${Date.now()}`, patientId, amount: 500, status: 'Unpaid', date: new Date().toISOString() };
  if (!db.bills) db.bills = [];
  db.bills.push(bill);
  writeDb(db);
  res.json({ message: 'Consultation saved successfully' });
});

app.get('/api/consultations/:patientId', authenticate, (req, res) => {
  if (req.user.role === 'patient' && req.user.username !== req.params.patientId) return res.status(403).json({ error: 'Forbidden' });
  res.json(readDb().consultations.filter(c => c.patientId === req.params.patientId));
});

app.get('/api/bills/:patientId', authenticate, (req, res) => {
  if (req.user.role === 'patient' && req.user.username !== req.params.patientId) return res.status(403).json({ error: 'Forbidden' });
  res.json((readDb().bills || []).filter(b => b.patientId === req.params.patientId));
});

// REPORTS
app.get('/api/reports', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const db = readDb();
  const today = new Date().toISOString().split('T')[0];
  const dailyReg = db.patients.filter(p => p.createdAt.startsWith(today)).length;
  
  const illnesses = {};
  db.patients.forEach(p => { illnesses[p.illness] = (illnesses[p.illness] || 0) + 1; });
  
  const doctorLoadMap = {};
  db.users.filter(u => u.role === 'doctor').forEach(d => { doctorLoadMap[d.name] = 0; });
  (db.appointments || []).forEach(a => { if (doctorLoadMap[a.doctorName] !== undefined) doctorLoadMap[a.doctorName]++; });
  const doctorLoad = Object.entries(doctorLoadMap).map(([name, load]) => ({ name, load }));

  res.json({
    dailyRegistrations: dailyReg,
    topIllnesses: Object.entries(illnesses).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count).slice(0, 5),
    doctorLoad: doctorLoad,
    totalPatients: db.patients.length,
    totalConsultations: db.consultations.length
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`HMS Backend running on port ${PORT}`);
});
