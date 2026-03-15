# Animal Aid Connect 🐾

A web platform to report animals in distress — injured, lost, or being abused — and automatically notify the right authority.

Built as a college project to solve a real problem: when someone finds a hurt animal, they don't know who to call or what to do. This app fixes that.

---

## What it does

You find an animal → fill a quick form → select the situation → done.

- **Injured / Sick** → nearby vets get alerted
- **Lost / Stray** → matched against missing pet reports, owners notified
- **Exploited / Abused** → complaint sent to police and animal welfare board

Every report gets a unique Case ID so you can track what happened.

---

## Features

- Photo upload for the animal
- 3-step report form (animal info, your details, situation)
- Public Lost & Found board with filters
- Authority dashboard for vets / shelters / police to manage cases
- Case status tracking: Pending → Responding → Resolved

---

## Tech Stack

| Part | Used |
|------|------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | JSON file |
| File uploads | Multer |

---

## How to Run

**Just the frontend** — open `index.html` in a browser. Works with demo data, no setup needed.

**With backend:**
```bash
cd backend
npm install
npm start
```
Then open `http://localhost:3000`

---

## API

| Method | Route | What it does |
|--------|-------|-------------|
| GET | `/api/reports` | Get all reports |
| POST | `/api/reports` | Submit new report |
| PATCH | `/api/reports/:id/status` | Update case status |
| GET | `/api/stats` | Dashboard numbers |

---

## Project Structure

```
animal-aid-connect/
├── index.html
├── css/style.css
├── js/script.js
└── backend/
    ├── server.js
    ├── package.json
    └── data/reports.json
```

---

Made for college project · MIT License
