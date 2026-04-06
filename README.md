# RAMS — Research Activity Management System

A full-stack platform for managing academic research projects, publications, and faculty-student collaboration. Built for universities and research institutions.

**Live Demo:** [https://project-management-system-mu-self.vercel.app](https://project-management-system-mu-self.vercel.app)  
**API Backend:** [https://rams-backend-3e2m.onrender.com](https://rams-backend-3e2m.onrender.com)

---

## Features

### Role-Based Access Control
- **Faculty** — Can create projects, manage members, add publications, sync from Crossref
- **Student** — Can browse and discover faculty projects, send join requests with a personal note
- **Admin** — Full platform oversight

### Project Management
- Create and manage research projects with descriptions and status tracking
- Visual **OrgChart** showing project hierarchy (Lead → Collaborator → Student)
- **Join Request system** — Students/collaborators write a note explaining their interest; Leads review, accept, or decline
- **Lead elevation** — Promote any member to project lead
- **Leave project** — Safe exit with a guard preventing the last lead from leaving

### Publications
- Manual publication entry (Title, Authors, DOI, Date, Citations)
- **Crossref API sync** — Auto-fetch publications by faculty name from the global research database
- Split view: **My Publications** vs **Discover Community** publications by department

### Analytics Dashboard
- Live publication trend chart (grouped by month)
- Department comparison chart (publications per department)
- Key stats: total projects, publications, citations, active members
- Empty state handling — charts gracefully display "No data" when the database is empty

### UI/UX
- **Light/Dark mode** toggle with animated Sun/Moon icon
- Fully responsive layout
- Shadcn/ui component library with Tailwind CSS
- Semantic HSL color tokens for consistent theming

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Recharts |
| **Backend** | Flask 3.0, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS |
| **Database** | PostgreSQL (production), SQLite (local development) |
| **Auth** | JWT (PyJWT) — stateless token-based authentication |
| **Charts** | Recharts with ResponsiveContainer |
| **External API** | Crossref REST API (publication sync) |
| **Deployment** | Vercel (frontend), Render (backend + PostgreSQL) |

---

## Project Structure

```
Research-Management/
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard with analytics
│   │   │   ├── login/          # Authentication
│   │   │   ├── signup/         # Registration (Faculty / Student)
│   │   │   ├── projects/       # Project discovery & management
│   │   │   └── publications/   # Publications explorer
│   │   ├── components/
│   │   │   ├── Charts.tsx      # Publication trend + department charts
│   │   │   ├── OrgChart.tsx    # Project member hierarchy
│   │   │   ├── ThemeToggle.tsx # Dark/light mode switch
│   │   │   └── ui/             # Shadcn component library
│   │   └── lib/
│   │       └── api.ts          # Authenticated fetch wrapper
│   └── vercel.json
│
├── backend/                    # Flask API
│   ├── app/
│   │   ├── __init__.py         # App factory, CORS, extensions
│   │   ├── models.py           # SQLAlchemy models
│   │   └── routes/
│   │       ├── auth.py         # Register, login, /me
│   │       ├── projects.py     # Projects + join requests
│   │       ├── publications.py # Publications + Crossref sync
│   │       ├── dashboard.py    # Analytics aggregation
│   │       ├── users.py        # User management
│   │       └── search.py       # Global search
│   ├── migrations/             # Alembic migration files
│   ├── requirements.txt
│   ├── runtime.txt             # Python 3.11.0
│   └── run.py
│
├── render.yaml                 # Render Blueprint (backend + DB)
├── runtime.txt                 # Python version for Render
└── .gitignore
```

---

## Database Models

| Model | Description |
|---|---|
| `User` | Platform users with `role` (Faculty / Student / Admin), `department`, `email` |
| `Project` | Research projects with `title`, `description`, `status` |
| `ProjectMember` | Many-to-many: Users ↔ Projects with `role` (lead / collaborator / student) |
| `ProjectJoinRequest` | Join request with `note`, `status` (Pending / Accepted / Declined) |
| `Publication` | Research papers with `doi`, `citations`, `published_date`, Crossref data |
| `ActivityEvent` | Audit log of platform actions |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create account (Faculty or Student) |
| `POST` | `/login` | Authenticate, returns JWT token |
| `GET` | `/me` | Get current user profile |

### Projects — `/api/projects`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all projects with user connection status |
| `POST` | `/` | Create project (Faculty/Admin only) |
| `POST` | `/<id>/request` | Submit a join request with a note |
| `GET` | `/<id>/requests` | Get pending requests (Lead only) |
| `POST` | `/<id>/requests/<rid>` | Accept or decline a request (Lead only) |
| `POST` | `/<id>/members/<uid>/role` | Elevate member to lead (Lead only) |
| `DELETE` | `/<id>/members/leave` | Leave a project |

### Publications — `/api/publications`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all publications |
| `POST` | `/` | Add publication manually |
| `POST` | `/sync` | Sync from Crossref API by author name |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Live counts + chart data (trends, department comparison) |

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run migrations
flask db upgrade

# Start development server
flask run
```

Backend runs at `http://127.0.0.1:5000`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-flask-secret-key
DATABASE_URL=sqlite:///rams_v2.db     # Dev | PostgreSQL URL for production
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000    # Dev | Vercel URL for production
```

### Frontend (Vercel Dashboard or `.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api   # Dev | Render URL for production
```

---

## Deployment

### Backend → Render
1. Push repo to GitHub
2. Render → **New → Blueprint** → connect repo
3. Render detects `render.yaml` and creates:
   - `rams-backend` (Flask web service)
   - `rams-pg` (PostgreSQL database)
4. Add `FRONTEND_URL` env var in Render dashboard → Redeploy

### Frontend → Vercel
1. Vercel → **New Project** → import repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL
4. Deploy

---

## Departments Supported
- Computer Science
- Biology
- Chemistry
- Physics
- Mathematics
- Economics

---

## License

MIT License — feel free to fork and adapt for your institution.
