/* =============================================
   ANIMAL AID CONNECT — script.js
   All frontend logic: data, rendering, form, 
   track, dashboard, navigation
   ============================================= */

// =============================================
// DATA & CONSTANTS
// =============================================

const EMOJIS = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦',
  Cow: '🐄', Horse: '🐴', Monkey: '🐒', Other: '🐾'
};

const LOC = [
  'Connaught Place, Delhi',
  'Bandra West, Mumbai',
  'Koramangala, Bangalore',
  'Park Street, Kolkata',
  'Anna Nagar, Chennai',
  'Jubilee Hills, Hyderabad',
  'Viman Nagar, Pune',
  'Gomti Nagar, Lucknow'
];

const BREEDS = {
  Dog:    ['Labrador', 'German Shepherd', 'Stray', 'Indie', 'Pomeranian'],
  Cat:    ['Persian', 'Stray', 'Siamese', 'Tabby'],
  Bird:   ['Pigeon', 'Parrot', 'Sparrow'],
  Cow:    ['Desi Breed'],
  Horse:  ['Thoroughbred'],
  Monkey: ['Rhesus Macaque'],
  Other:  ['Unknown']
};

const NOTES = [
  'Limping badly, seems in pain',
  'Found near highway, very frightened',
  'Friendly, has a collar but no tag',
  'Appears malnourished and weak',
  'Being used for roadside begging',
  'Lost near the market, keeps circling',
  'Injured eye, needs urgent care',
  'Abandoned puppy, 3–4 weeks old'
];

const NAMES = [
  'Priya Sharma', 'Amit Kumar', 'Neha Singh', 'Rahul Gupta',
  'Sanjana Patel', 'Vikram Nair', 'Deepa Iyer', 'Arjun Mehta'
];

// Verified Unsplash animal photos
const ANIMAL_PHOTOS = {
  Dog: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1534361960057-19f4434a4fb?w=400&h=280&fit=crop&auto=format&q=75'
  ],
  Cat: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1573865526182-f93ee1cb3dc4?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=400&h=280&fit=crop&auto=format&q=75'
  ],
  Bird: [
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&h=280&fit=crop&auto=format&q=75'
  ],
  Cow: [
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=280&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=400&h=280&fit=crop&auto=format&q=75'
  ],
  Horse:  ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=280&fit=crop&auto=format&q=75'],
  Monkey: ['https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&h=280&fit=crop&auto=format&q=75'],
  Other:  ['https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=280&fit=crop&auto=format&q=75']
};

// State variables
let reports     = [];
let selSit      = null;
let photoData   = null;
let curStep     = 1;
let isLoggedIn  = false;
let dbTab       = 'overview';

// =============================================
// UTILITY FUNCTIONS
// =============================================

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genId() {
  return 'AAC-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function dAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getAnimalPhoto(type) {
  const pool = ANIMAL_PHOTOS[type] || ANIMAL_PHOTOS.Other;
  return pool[Math.floor(Math.random() * pool.length)];
}

// =============================================
// SEED DATA — 14 demo reports
// =============================================

function initData() {
  const seed = [
    { type: 'Dog',    breed: 'Golden Retriever', color: 'Golden',        sit: 'injured',   stat: 'pending',    loc: LOC[0], note: NOTES[0], photo: ANIMAL_PHOTOS.Dog[0] },
    { type: 'Cat',    breed: 'Tabby',            color: 'Orange Tabby',  sit: 'lost',      stat: 'pending',    loc: LOC[1], note: NOTES[2], photo: ANIMAL_PHOTOS.Cat[0] },
    { type: 'Dog',    breed: 'Stray',            color: 'Brown',         sit: 'lost',      stat: 'pending',    loc: LOC[2], note: NOTES[1], photo: ANIMAL_PHOTOS.Dog[1] },
    { type: 'Cat',    breed: 'Persian',          color: 'White',         sit: 'injured',   stat: 'responding', loc: LOC[3], note: NOTES[6], photo: ANIMAL_PHOTOS.Cat[1] },
    { type: 'Dog',    breed: 'German Shepherd',  color: 'Black & Tan',   sit: 'exploited', stat: 'responding', loc: LOC[4], note: NOTES[4], photo: ANIMAL_PHOTOS.Dog[2] },
    { type: 'Bird',   breed: 'Parrot',           color: 'Green',         sit: 'injured',   stat: 'responding', loc: LOC[5], note: NOTES[6], photo: ANIMAL_PHOTOS.Bird[0] },
    { type: 'Dog',    breed: 'Labrador',         color: 'Black',         sit: 'lost',      stat: 'responding', loc: LOC[6], note: NOTES[3], photo: ANIMAL_PHOTOS.Dog[3] },
    { type: 'Cat',    breed: 'Siamese',          color: 'Cream & Brown', sit: 'lost',      stat: 'responding', loc: LOC[7], note: NOTES[1], photo: ANIMAL_PHOTOS.Cat[2] },
    { type: 'Dog',    breed: 'Indie',            color: 'Grey & White',  sit: 'injured',   stat: 'responding', loc: LOC[0], note: NOTES[5], photo: ANIMAL_PHOTOS.Dog[4] },
    { type: 'Cow',    breed: 'Desi Breed',       color: 'White & Brown', sit: 'injured',   stat: 'resolved',   loc: LOC[1], note: NOTES[3], photo: ANIMAL_PHOTOS.Cow[0] },
    { type: 'Bird',   breed: 'Pigeon',           color: 'Grey',          sit: 'injured',   stat: 'resolved',   loc: LOC[2], note: NOTES[6], photo: ANIMAL_PHOTOS.Bird[1] },
    { type: 'Dog',    breed: 'Pomeranian',       color: 'White',         sit: 'lost',      stat: 'resolved',   loc: LOC[3], note: NOTES[7], photo: ANIMAL_PHOTOS.Dog[5] },
    { type: 'Cat',    breed: 'Stray',            color: 'Brown spots',   sit: 'exploited', stat: 'resolved',   loc: LOC[4], note: NOTES[4], photo: ANIMAL_PHOTOS.Cat[3] },
    { type: 'Monkey', breed: 'Rhesus Macaque',   color: 'Brown',         sit: 'exploited', stat: 'resolved',   loc: LOC[5], note: NOTES[4], photo: ANIMAL_PHOTOS.Monkey[0] }
  ];

  seed.forEach((s, i) => {
    reports.push({
      id:           genId(),
      animalType:   s.type,
      breed:        s.breed,
      color:        s.color,
      age:          rnd(['Young (under 1 year)', 'Adult (1–7 years)', 'Senior (7+ years)']),
      location:     s.loc,
      situation:    s.sit,
      status:       s.stat,
      notes:        s.note,
      reporterName: NAMES[i % NAMES.length],
      reporterPhone:'98' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0'),
      reporterEmail:'reporter@email.com',
      dateReported: dAgo(i % 7),
      photoUrl:     s.photo,
      emoji:        EMOJIS[s.type] || '🐾'
    });
  });
}

// Run on load
initData();
refreshStats();

// =============================================
// NAVIGATION
// =============================================

function showPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  window.scrollTo(0, 0);

  if (p === 'home')      renderHome();
  if (p === 'lost-found') renderLF();
  if (p === 'track') {
    document.getElementById('track-res').style.display = 'none';
    document.getElementById('track-err').style.display = 'none';
    document.getElementById('track-in').value = '';
  }
  if (p === 'dashboard' && isLoggedIn) renderDBContent();
}

function openReportWith(sit) {
  showPage('report');
  resetForm();
  goStep(3);
  pickSit(sit);
}

// =============================================
// STATS
// =============================================

function refreshStats() {
  document.getElementById('s-total').textContent    = reports.length;
  document.getElementById('s-resolved').textContent = reports.filter(r => r.status === 'resolved').length;
  document.getElementById('s-active').textContent   = reports.filter(r => r.status === 'responding').length;
}

// =============================================
// CARD HTML BUILDER
// =============================================

function cardHTML(r) {
  const bm = { injured: 'b-injured', lost: 'b-lost', exploited: 'b-exploited' };
  const bs = { pending: 'b-pending', responding: 'b-responding', resolved: 'b-resolved' };
  const sl = { injured: '🩺 Injured', lost: '🔍 Lost', exploited: '⚠️ Abused' };

  const imgHTML = r.photoUrl
    ? `<img src="${r.photoUrl}" alt="${r.animalType}" loading="lazy" onerror="this.style.display='none'">`
    : r.emoji;

  return `
    <div class="report-card">
      <div class="rcard-img">${imgHTML}</div>
      <div class="rcard-body">
        <div class="badges">
          <span class="badge ${bm[r.situation]}">${sl[r.situation]}</span>
          <span class="badge ${bs[r.status]}">${r.status}</span>
        </div>
        <h4>${r.animalType} · ${r.breed}</h4>
        <div class="rcard-meta">📍 ${r.location.split(',')[0]} &nbsp;·&nbsp; ${r.dateReported}</div>
        <div class="rcard-notes">${r.notes}</div>
      </div>
    </div>`;
}

// =============================================
// HOME PAGE
// =============================================

function renderHome() {
  const el = document.getElementById('home-recent');
  el.innerHTML = [...reports].reverse().slice(0, 6).map(cardHTML).join('');
  refreshStats();
}

// =============================================
// REPORT FORM — STEPS
// =============================================

function drawSteps() {
  const labels = ['Animal Info', 'Your Details', 'Situation', 'Confirmation'];
  const el = document.getElementById('steps-ui');

  el.innerHTML = labels.map((label, i) => {
    const n  = i + 1;
    const dc = n < curStep ? 'sd-done' : n === curStep ? 'sd-active' : 'sd-inactive';
    const lc = n === curStep ? 'active' : 'inactive';
    const cnt = n < curStep ? '✓' : n;

    return (i > 0 ? '<div class="step-line"></div>' : '') +
      `<div class="step-dot ${dc}">${cnt}</div>` +
      `<span class="step-lbl ${lc}">${label}</span>`;
  }).join('');
}

drawSteps();

function goStep(n) {
  document.querySelectorAll('[id^=fstep-]').forEach(el => el.style.display = 'none');
  document.getElementById('fstep-' + n).style.display = 'block';
  curStep = n;
  drawSteps();
  window.scrollTo(0, 0);
}

function step2() {
  if (!document.getElementById('a-type').value)         { alert('Please select the animal type.'); return; }
  if (!document.getElementById('a-color').value.trim()) { alert('Please enter the color / markings.'); return; }
  if (!document.getElementById('a-loc').value.trim())   { alert('Please enter the current location.'); return; }
  goStep(2);
}

function step3() {
  if (!document.getElementById('r-name').value.trim())  { alert('Please enter your name.'); return; }
  if (!document.getElementById('r-phone').value.trim()) { alert('Please enter your phone number.'); return; }
  goStep(3);
}

function handlePhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      photoData = e.target.result;
      document.getElementById('photo-prev').src = e.target.result;
      document.getElementById('photo-prev').style.display = 'block';
      document.getElementById('photo-ph').style.display   = 'none';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function pickSit(s) {
  selSit = s;
  document.querySelectorAll('.sit-opt').forEach(el => { el.className = 'sit-opt'; });
  document.getElementById('sopt-' + s).className = 'sit-opt sel-' + s;
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
}

// =============================================
// SUBMIT REPORT
// =============================================

function submitReport() {
  if (!selSit) return;

  const type = document.getElementById('a-type').value;
  const rec  = {
    id:           genId(),
    animalType:   type || 'Other',
    breed:        document.getElementById('a-breed').value  || 'Unknown',
    color:        document.getElementById('a-color').value  || 'Unknown',
    age:          document.getElementById('a-age').value    || 'Unknown',
    location:     document.getElementById('a-loc').value,
    situation:    selSit,
    status:       'pending',
    notes:        document.getElementById('a-notes').value,
    reporterName: document.getElementById('r-name').value,
    reporterPhone:document.getElementById('r-phone').value,
    reporterEmail:document.getElementById('r-email').value,
    dateReported: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    photoUrl:     photoData || getAnimalPhoto(type),
    emoji:        EMOJIS[type] || '🐾'
  };

  reports.push(rec);
  refreshStats();

  // POST to backend if available
  fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rec)
  }).catch(() => {
    // Silently ignore if backend not running (frontend-only mode)
    console.log('Backend not available — running in frontend-only mode');
  });

  // Show confirmation
  document.getElementById('sc-id').textContent = rec.id;
  document.getElementById('track-in').value    = rec.id;

  const notifMap = {
    injured: [
      { i: '🏥', t: 'Apollo Pet Clinic, nearby — Alerted' },
      { i: '🏥', t: 'PetVet Hospital — Alerted' },
      { i: '🚑', t: 'Animal Ambulance — Dispatched to location' }
    ],
    lost: [
      { i: '👤', t: '3 owners with matching lost pet reports — Notified' },
      { i: '🏠', t: 'City Animal Shelter — Report Added to Board' },
      { i: '📋', t: 'Public Lost & Found Board — Updated' }
    ],
    exploited: [
      { i: '👮', t: 'Police Animal Welfare Cell — Complaint Filed' },
      { i: '⚖️', t: 'PETA India — Case Forwarded' },
      { i: '📋', t: 'Animal Welfare Board of India — Notified' }
    ]
  };

  const notifLabel = `
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;
      letter-spacing:0.5px;margin-bottom:8px">Notifications Sent</div>`;

  document.getElementById('sc-notifs').innerHTML =
    notifLabel +
    notifMap[selSit].map(n =>
      `<div class="notif-item">
        <span>${n.i}</span><span>${n.t}</span>
        <span class="notif-check">✓ SENT</span>
      </div>`
    ).join('');

  goStep(4);
}

// =============================================
// RESET FORM
// =============================================

function resetForm() {
  ['a-type','a-breed','a-color','a-age','a-loc','a-notes','r-name','r-phone','r-email']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

  document.getElementById('photo-prev').style.display = 'none';
  document.getElementById('photo-ph').style.display   = 'block';
  document.getElementById('photo-file').value = '';
  photoData = null;
  selSit    = null;

  document.querySelectorAll('.sit-opt').forEach(el => el.className = 'sit-opt');
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;

  goStep(1);
}

// =============================================
// LOST & FOUND BOARD
// =============================================

function renderLF() {
  const tv   = document.getElementById('f-type').value;
  const sv   = document.getElementById('f-status').value;
  const sitv = document.getElementById('f-sit').value;

  // Exclude exploited from public board
  let list = reports.filter(r => r.situation !== 'exploited');
  if (tv)   list = list.filter(r => r.animalType === tv);
  if (sv)   list = list.filter(r => r.status === sv);
  if (sitv) list = list.filter(r => r.situation === sitv);

  document.getElementById('lf-count').textContent =
    list.length + ' report' + (list.length !== 1 ? 's' : '');

  const grid = document.getElementById('lf-grid');
  grid.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;
        color:var(--text-muted);font-size:14px">
        No reports match your filters.
       </div>`;
}

// =============================================
// CASE TRACKER
// =============================================

function trackCase() {
  const val   = document.getElementById('track-in').value.trim().toUpperCase();
  const resEl = document.getElementById('track-res');
  const errEl = document.getElementById('track-err');
  const found = reports.find(x => x.id === val);

  if (!found) {
    resEl.style.display = 'none';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  resEl.style.display = 'block';

  const bm = { injured: 'b-injured', lost: 'b-lost', exploited: 'b-exploited' };
  const bs = { pending: 'b-pending', responding: 'b-responding', resolved: 'b-resolved' };
  const sl = { injured: 'Injured / Sick', lost: 'Lost / Stray', exploited: 'Being Exploited' };

  const stOrd  = ['pending', 'responding', 'resolved'];
  const ci     = stOrd.indexOf(found.status);

  const authLine = {
    injured:   'Nearby veterinary clinics have been alerted.',
    lost:      'Shelters and matching pet owners have been contacted.',
    exploited: 'Police and animal welfare authority have been notified.'
  }[found.situation];

  const timeline = [
    { l: 'Report Submitted',       d: 'Your report was received and a Case ID was issued.',         t: found.dateReported },
    { l: 'Authority Notified',     d: authLine,                                                     t: ci >= 1 ? 'Same day as report' : null },
    { l: 'Response In Progress',   d: 'Authority is coordinating action on the ground.',            t: ci >= 2 ? 'Completed' : ci === 1 ? 'Ongoing' : null },
    { l: 'Case Resolved',          d: 'Animal has been assisted and the case is closed.',           t: ci === 2 ? found.dateReported : null }
  ];

  resEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;
      flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;
          text-transform:uppercase;letter-spacing:0.4px">Case ID</div>
        <div style="font-size:20px;font-weight:900;font-family:'Courier New',monospace;
          letter-spacing:2px">${found.id}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge ${bm[found.situation]}">${sl[found.situation]}</span>
        <span class="badge ${bs[found.status]}">${found.status}</span>
      </div>
    </div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);
      padding:13px;margin-bottom:18px;font-size:13px;display:grid;
      grid-template-columns:1fr 1fr;gap:8px">
      <div><span style="color:var(--text-muted)">Animal: </span>${found.animalType} · ${found.breed}</div>
      <div><span style="color:var(--text-muted)">Color: </span>${found.color}</div>
      <div><span style="color:var(--text-muted)">Location: </span>${found.location.split(',')[0]}</div>
      <div><span style="color:var(--text-muted)">Reported: </span>${found.dateReported}</div>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;
      letter-spacing:0.5px;margin-bottom:14px">Timeline</div>
    <div class="timeline">
      ${timeline.map((s, i) => {
        const dc  = i < ci ? 'tl-done' : i === ci ? 'tl-active' : 'tl-idle';
        const cnt = i < ci ? '✓' : i === ci ? '●' : '';
        return `
          <div class="tl-item">
            <div class="tl-dot ${dc}">${cnt}</div>
            <div class="tl-content" style="${i > ci ? 'opacity:0.35' : ''}">
              <h5>${s.l}</h5>
              <p>${s.d}</p>
              ${s.t ? `<div class="tl-time">${s.t}</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// =============================================
// DASHBOARD
// =============================================

function loginDB() {
  isLoggedIn = true;
  const at   = document.getElementById('auth-type-sel').value;
  document.getElementById('db-who-lbl').textContent        = at;
  document.getElementById('db-login').style.display        = 'none';
  document.getElementById('db-dash').style.display         = 'block';
  setDBTab('overview', document.getElementById('sbi-overview'));
}

function logoutDB() {
  isLoggedIn = false;
  document.getElementById('db-login').style.display = 'flex';
  document.getElementById('db-dash').style.display  = 'none';
}

function setDBTab(t, el) {
  dbTab = t;
  document.querySelectorAll('.sb-item').forEach(e => e.classList.remove('active'));
  if (el) el.classList.add('active');
  renderDBContent();
}

function renderDBContent() {
  const el  = document.getElementById('db-content');
  const now = new Date().toLocaleDateString('en-IN',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (dbTab === 'overview') {
    const p  = reports.filter(r => r.status === 'pending').length;
    const a  = reports.filter(r => r.status === 'responding').length;
    const re = reports.filter(r => r.status === 'resolved').length;

    el.innerHTML = `
      <div>
        <div style="font-size:21px;font-weight:900;margin-bottom:3px">Overview</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:24px">${now}</div>
        <div class="db-stats">
          <div class="db-stat"><div class="db-stat-num">${reports.length}</div><div class="db-stat-lbl">Total Reports</div></div>
          <div class="db-stat"><div class="db-stat-num" style="color:var(--red)">${p}</div><div class="db-stat-lbl">Pending</div></div>
          <div class="db-stat"><div class="db-stat-num" style="color:var(--blue)">${a}</div><div class="db-stat-lbl">In Progress</div></div>
          <div class="db-stat"><div class="db-stat-num" style="color:var(--green)">${re}</div><div class="db-stat-lbl">Resolved</div></div>
        </div>
        <div class="table-box">
          <div class="tbl-hdr">
            <span style="font-size:15px;font-weight:800">Recent Cases</span>
            <button class="link-btn"
              onclick="setDBTab('assigned',document.getElementById('sbi-assigned'))">View all →</button>
          </div>
          ${dbTableHead()}
          ${[...reports].reverse().slice(0, 7).map(r => dbRow(r, false)).join('')}
        </div>
      </div>`;
  } else {
    const list = dbTab === 'resolved'
      ? reports.filter(r => r.status === 'resolved')
      : reports.filter(r => r.status !== 'resolved');

    el.innerHTML = `
      <div>
        <div style="font-size:21px;font-weight:900;margin-bottom:20px">
          ${dbTab === 'resolved' ? 'Resolved Cases' : 'Assigned Cases'}
        </div>
        <div class="table-box">
          ${dbTableHead()}
          ${list.length
            ? list.map(r => dbRow(r, true)).join('')
            : '<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:14px">No cases here.</div>'}
        </div>
      </div>`;
  }
}

function dbTableHead() {
  return `<div class="tbl-row hdr">
    <div>Case ID</div><div>Animal / Location</div>
    <div>Situation</div><div>Status</div>
    <div>Reporter</div><div>Action</div>
  </div>`;
}

function dbRow(r, showBtn) {
  const bm   = { injured: 'b-injured', lost: 'b-lost', exploited: 'b-exploited' };
  const bs   = { pending: 'b-pending', responding: 'b-responding', resolved: 'b-resolved' };
  const sl   = { injured: '🩺 Injured', lost: '🔍 Lost', exploited: '⚠️ Abused' };
  const next = { pending: '→ Mark Responding', responding: '→ Mark Resolved', resolved: '✓ Closed' };

  return `
    <div class="tbl-row">
      <div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700">${r.id}</div>
      <div>
        <div style="font-weight:700;font-size:13px">${r.emoji} ${r.animalType} · ${r.breed}</div>
        <div style="font-size:11px;color:var(--text-muted)">📍 ${r.location.split(',')[0]}</div>
      </div>
      <div><span class="badge ${bm[r.situation]}">${sl[r.situation]}</span></div>
      <div><span class="badge ${bs[r.status]}">${r.status}</span></div>
      <div style="font-size:12px">
        <div style="font-weight:700">${r.reporterName}</div>
        <div style="color:var(--text-muted)">${r.reporterPhone}</div>
      </div>
      <div>${showBtn && r.status !== 'resolved'
        ? `<button class="link-btn" style="font-size:11px"
              onclick="advanceStatus('${r.id}')">${next[r.status]}</button>`
        : r.dateReported}
      </div>
    </div>`;
}

function advanceStatus(id) {
  const r   = reports.find(x => x.id === id);
  const ord = ['pending', 'responding', 'resolved'];
  const i   = ord.indexOf(r.status);
  if (i < 2) {
    r.status = ord[i + 1];
    refreshStats();
    renderDBContent();

    // PATCH to backend if running
    fetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: r.status })
    }).catch(() => {});
  }
}
