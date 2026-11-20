
# LifeOS – Personal Life Management System

LifeOS is a personal management platform designed to help users
manage their daily activities, track goals, and monitor career
progress with an integrated AI assistant.

## Modules

1. Daily Command Center
2. Goals & Milestones
3. Career Progress
4. NOVA – AI Assistant

## Technology Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- Database: SQLite
- AI: Google Gemini

## Getting Started

### Frontend

cd frontend
npm install
npm run dev

### Backend

cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

## Team Development

All contributors should work on their own feature branches.
Pull requests should target the develop branch.

Never commit API keys or .env files.
