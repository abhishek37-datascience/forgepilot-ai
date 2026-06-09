# ForgePilot AI 🚀 — AI-Powered Engineering Project Mentor

ForgePilot AI 🚀 is a premium, full-stack educational platform that assists engineering students in finding, building, and presenting their projects. It utilizes an academic recommendation engine and integrates with the Google Gemini API to provide real-time, context-aware mentoring.

---

## Key Features

- **Personalized Recommendations**: A client-side matching engine that ranks and filters 50 engineering projects across multiple disciplines (CS, ECE, ME, Civil) based on the student's branch, specialization, languages, and skill level.
- **AI Project Mentor Workspace**: A dual-pane workspace that pairs interactive roadmap checklists with a chat console. It supports quick-action triggers to:
  - 📝 **Explain active step**: Breaks down complex processes.
  - 💻 **Generate starter code**: Produces compile-ready code templates (Python, C++, Node.js).
  - 🔧 **Debug errors**: Diagnoses failure logs and proposes fixes.
  - 🎓 **Oral exam (Viva) prep**: Runs interactive oral mock interview questions.
  - 📄 **Resume generator**: Generates high-impact career-ready profile bullet points.
- **Robust Database Resiliency**: Built to run on PostgreSQL in production, with an automatic fallback to an emulated local JSON file database (`database.json`) when database servers are disconnected or during offline local trials.
- **Secure Authentication**: Includes JWT user session tokens and Bcrypt credentials hashing.
- **Comprehensive Activity Logging**: Tracks search history, bookmarks, favorites, and viewed history.

---

## System Architecture

```mermaid
graph TD
    Client["Web Browser (User)"] -- "HTTPS (Static Files)" --> Frontend["Vercel Frontend (React + Vite)"]
    Client -- "API Requests / JWT Headers" --> Backend["Render Backend (Express + Node)"]
    Backend -- "SQL Queries (Port 5432)" --> DB["Neon Serverless PostgreSQL"]
    Backend -- "HTTPS REST Call" --> Gemini["Google Gemini API (gemini-2.5-flash)"]
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), PG Client (`pg`), TypeScript (`ts-node-dev`).
- **Database**: PostgreSQL / Emulated Local JSON File Database.
- **AI API**: Google Generative Language Developer API (`gemini-2.5-flash`).

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <your-repository-url>
   cd forgepilot-ai
   ```

2. **Backend Configuration**:
   Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following keys:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_session_jwt_key
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   GEMINI_API_KEY=your_google_ai_studio_api_key
   ```
   *Note: If no database or Gemini API key is configured, the server falls back to the emulated JSON database and local mock replies.*

3. **Start the Backend**:
   ```bash
   npm run dev
   ```
   The backend server will activate on `http://localhost:5000`.

4. **Frontend Configuration**:
   Navigate back to the project root and install client-side dependencies:
   ```bash
   cd ..
   npm install
   ```
   Create a `.env.local` or `.env.production` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the Frontend**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## Environment Variables Configuration Reference

### Backend Settings

| Environment Variable | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Port for the backend API. |
| `NODE_ENV` | Yes | `development` / `production` | Execution environment. |
| `JWT_SECRET` | Yes | `my_secure_jwt_secret_phrase` | Secret key used to sign authorization tokens. |
| `DATABASE_URL` | No | `postgresql://localhost:5432/forge` | Connection string for PostgreSQL (falls back to local JSON file db if missing/invalid). |
| `GEMINI_API_KEY` | No | `AIzaSy...` | API Key from Google AI Studio (falls back to local mock replies if missing). |

### Frontend Settings

| Environment Variable | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `http://localhost:5000/api` | Target endpoint of the API backend. |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
