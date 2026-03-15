/* =============================================
   ANIMAL AID CONNECT — server.js
   Node.js + Express Backend
   ============================================= */

const express    = require('express');
const cors       = require('cors');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARE
// =============================================

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend files (index.html, css, js)
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// FILE STORAGE — Photos
// =============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// =============================================
// DATABASE — JSON file (simple, no setup needed)
// =============================================

const DB_PATH = path.join(__dirname, 'data', 'reports.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function writeDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// =============================================
// API ROUTES
// =============================================

// GET /api/reports — get all reports
app.get('/api/reports', (req, res) => {
  const reports = readDB();
  const { situation, status, animalType } = req.query;

  let filtered = reports;
  if (situation)  filtered = filtered.filter(r => r.situation  === situation);
  if (status)     filtered = filtered.filter(r => r.status     === status);
  if (animalType) filtered = filtered.filter(r => r.animalType === animalType);

  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET /api/reports/:id — get one report by ID
app.get('/api/reports/:id', (req, res) => {
  const reports = readDB();
  const report  = reports.find(r => r.id === req.params.id.toUpperCase());
  if (!report) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, data: report });
});

// POST /api/reports — create new report (JSON body or multipart)
app.post('/api/reports', upload.single('photo'), (req, res) => {
  try {
    const reports = readDB();
    const body    = req.body;

    if (!body.animalType || !body.location || !body.situation) {
      return res.status(400).json({ success: false, message: 'animalType, location and situation are required' });
    }

    const newReport = {
      id:           body.id || genId(),
      animalType:   body.animalType,
      breed:        body.breed       || 'Unknown',
      color:        body.color       || 'Unknown',
      age:          body.age         || 'Unknown',
      location:     body.location,
      situation:    body.situation,    // 'injured' | 'lost' | 'exploited'
      status:       'pending',
      notes:        body.notes       || '',
      reporterName: body.reporterName || '',
      reporterPhone:body.reporterPhone || '',
      reporterEmail:body.reporterEmail || '',
      dateReported: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      photoUrl:     req.file ? `/uploads/${req.file.filename}` : (body.photoUrl || null),
      createdAt:    new Date().toISOString()
    };

    reports.push(newReport);
    writeDB(reports);

    // Simulate notification
    triggerNotification(newReport);

    res.status(201).json({ success: true, data: newReport, message: 'Report submitted and authorities notified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/reports/:id/status — update case status
app.patch('/api/reports/:id/status', (req, res) => {
  const reports = readDB();
  const index   = reports.findIndex(r => r.id === req.params.id.toUpperCase());

  if (index === -1) return res.status(404).json({ success: false, message: 'Case not found' });

  const allowed = ['pending', 'responding', 'resolved'];
  const { status } = req.body;

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Use: pending, responding, resolved' });
  }

  reports[index].status    = status;
  reports[index].updatedAt = new Date().toISOString();
  writeDB(reports);

  res.json({ success: true, data: reports[index], message: `Status updated to ${status}` });
});

// DELETE /api/reports/:id — delete a report (admin only)
app.delete('/api/reports/:id', (req, res) => {
  let reports = readDB();
  const len   = reports.length;
  reports     = reports.filter(r => r.id !== req.params.id.toUpperCase());

  if (reports.length === len) return res.status(404).json({ success: false, message: 'Case not found' });

  writeDB(reports);
  res.json({ success: true, message: 'Report deleted' });
});

// GET /api/stats — dashboard stats
app.get('/api/stats', (req, res) => {
  const reports = readDB();
  res.json({
    success: true,
    data: {
      total:      reports.length,
      pending:    reports.filter(r => r.status === 'pending').length,
      responding: reports.filter(r => r.status === 'responding').length,
      resolved:   reports.filter(r => r.status === 'resolved').length,
      injured:    reports.filter(r => r.situation === 'injured').length,
      lost:       reports.filter(r => r.situation === 'lost').length,
      exploited:  reports.filter(r => r.situation === 'exploited').length
    }
  });
});

// =============================================
// NOTIFICATION LOGIC (simulated)
// In production: replace console.log with 
// Twilio SMS, Nodemailer email, or WhatsApp API
// =============================================

function triggerNotification(report) {
  const messages = {
    injured: [
      `🏥 [VET ALERT] Animal reported injured at ${report.location}`,
      `   Type: ${report.animalType} (${report.breed}), Color: ${report.color}`,
      `   Case ID: ${report.id} | Reporter: ${report.reporterName} | ${report.reporterPhone}`
    ],
    lost: [
      `🔍 [LOST ANIMAL] New lost/stray report at ${report.location}`,
      `   Type: ${report.animalType} (${report.breed}), Color: ${report.color}`,
      `   Case ID: ${report.id} | Reporter: ${report.reporterName} | ${report.reporterPhone}`,
      `   → Checking missing pet database for matches...`
    ],
    exploited: [
      `⚠️  [POLICE ALERT] Animal abuse/exploitation at ${report.location}`,
      `   Type: ${report.animalType} (${report.breed})`,
      `   Case ID: ${report.id} | Reported by: ${report.reporterName} | ${report.reporterPhone}`,
      `   → Complaint filed with Animal Welfare Board`
    ]
  };

  const lines = messages[report.situation] || [];
  console.log('\n' + '─'.repeat(55));
  lines.forEach(l => console.log(l));
  console.log('─'.repeat(55) + '\n');

  /*
  ── TO SEND REAL SMS VIA TWILIO ──────────────────────
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  client.messages.create({
    body: lines.join('\n'),
    from: process.env.TWILIO_FROM,
    to:   '+91XXXXXXXXXX'   // authority phone
  });

  ── TO SEND EMAIL VIA NODEMAILER ─────────────────────
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to:   'authority@example.com',
    subject: `[Animal Aid] New ${report.situation} case — ${report.id}`,
    text: lines.join('\n')
  });
  */
}

// =============================================
// HELPERS
// =============================================

function genId() {
  return 'AAC-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
  console.log(`\n🐾 Animal Aid Connect — Server running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api/reports`);
  console.log(`   Press Ctrl+C to stop\n`);
});

module.exports = app;
