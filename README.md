# LifeOS — Personal Life Operating System

A production-ready MERN stack application for personal tracking and self-improvement.

## Features
- **Habits** — Daily/weekly tracking, streaks, completion rates
- **Mood** — 1–10 scoring with trends and insights
- **Sleep** — Duration, quality tracking and analytics
- **Hydration** — Water intake with goal tracking
- **Breathing** — Guided sessions with built-in techniques
- **Journal** — Rich text editor with tags and search
- **Goals** — Progress tracking with milestones
- **Analytics** — Charts and correlations across all modules
- **Calendar** — Monthly activity heatmap
- **11 Themes** — Dark, Light, Catppuccin, Nord, Dracula, Tokyo Night, Gruvbox, Rosé Pine, Everforest, One Dark, Solarized

## Stack
**Backend:** Node.js · Express · TypeScript · MongoDB · Mongoose · JWT
**Frontend:** React · Vite · TypeScript · TailwindCSS · React Query · Zustand

## Quick Start

### 1. Install dependencies
```bash
# Backend
cd apps/backend && npm install

# Frontend
cd apps/frontend && npm install
```

### 2. Configure environment
```bash
# Backend
cd apps/backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Frontend
cd apps/frontend
cp .env.example .env
```

### 3. Start MongoDB
```bash
mongod
# or use MongoDB Atlas (set MONGODB_URI in backend .env)
```

### 4. Run development servers
```bash
# Backend (port 5000)
cd apps/backend && npm run dev

# Frontend (port 3000)
cd apps/frontend && npm run dev
```

Open http://localhost:3000

## Environment Variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | 64+ char random secret for access tokens |
| `JWT_REFRESH_SECRET` | 64+ char random secret for refresh tokens |
| `CLIENT_URL` | Frontend URL for CORS |
| `EMAIL_FROM` | Sender email address |
| `RESEND_API_KEY` | Resend API key (or use SMTP_* vars) |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Project Structure
```
lifeos/
├── apps/
│   ├── backend/     # Express API
│   └── frontend/    # React app
└── README.md
```
