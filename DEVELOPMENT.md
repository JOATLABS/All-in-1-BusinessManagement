# Development Environment Setup Guide

Complete guide to setting up the OjaPlus Venture System development environment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## Prerequisites

Ensure you have these tools installed on your system:

### Required
- **Node.js** v20.x or higher ([Download](https://nodejs.org/))
- **npm** v10.x or higher (comes with Node.js)
- **Git** v2.x or higher ([Download](https://git-scm.com/))
- **Docker** v24.x or higher ([Download](https://www.docker.com/get-started))

### Verify Installation
```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
git --version     # Should show 2.x.x or higher
docker --version  # Should show 24.x.x or higher
```

---

## Quick Start

For experienced developers, here's the fastest way to get running:

```bash
# 1. Clone and enter the repository
git clone <repository-url>
cd OjaPlusVentureSystem

# 2. Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Start PostgreSQL database
docker-compose up -d

# 4. Wait for database to be ready (check health)
docker-compose ps

# 5. Seed the database
npm run db:seed

# 6. Start development servers (both backend and frontend)
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:4000
# pgAdmin: http://localhost:5050
```

---

## Detailed Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd OjaPlusVentureSystem
```

**What this does:** Downloads the project code to your local machine.

---

### Step 2: Install Project Dependencies

```bash
# Install root-level tools (Husky, lint-staged, concurrently)
npm install

# Install backend dependencies (Express, TypeScript, Drizzle ORM, etc.)
cd backend
npm install
cd ..

# Install frontend dependencies (React, Vite, Tailwind CSS, etc.)
cd frontend
npm install
cd ..
```

**What this does:**
- Root: Installs Git hooks and development utilities
- Backend: Installs Express server, database tools, TypeScript
- Frontend: Installs React, Vite build tool, UI libraries

---

### Step 3: Configure Environment Variables

Environment files are already created from templates, but you can customize them:

#### Backend Configuration
```bash
# Edit backend/.env if needed
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ojaplus
PORT=4000
ROOT_ADMIN_EMAIL=admin@rhythmplusroot.com
ROOT_ADMIN_PASSWORD=admin
```

**What these do:**
- `DATABASE_URL`: Connection string to PostgreSQL database
- `PORT`: Backend API server port
- `ROOT_ADMIN_EMAIL/PASSWORD`: Default admin login credentials

#### Frontend Configuration
```bash
# Edit frontend/.env.local if needed
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:4000
```

**What these do:**
- `VITE_API_BASE_URL`: API endpoint (empty = same origin)
- `VITE_API_PROXY_TARGET`: Where to proxy API requests during development

---

### Step 4: Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                 STATUS              PORTS
# ojaplus-postgres     Up (healthy)        0.0.0.0:5432->5432/tcp
# ojaplus-pgadmin      Up                  0.0.0.0:5050->80/tcp
```

**What this does:**
- Starts PostgreSQL database in a Docker container
- Starts pgAdmin web interface for database management
- `-d` flag runs containers in background (detached mode)

**Troubleshooting:**
```bash
# View database logs
docker-compose logs -f postgres

# Stop containers
docker-compose down

# Remove all data and start fresh
docker-compose down -v
```

---

### Step 5: Seed the Database

```bash
# Run from project root
npm run db:seed

# Expected output:
# ✓ Tables created successfully
# ✓ Admin user seeded
# ✓ Site content seeded
```

**What this does:**
- Creates database tables (users, sessions, reservations, site_content)
- Inserts default admin user
- Loads initial site content (hero section, events, footer)

**Note:** The backend automatically creates tables on first run, but seeding ensures you have test data.

---

### Step 6: Start Development Servers

```bash
# From project root - starts both backend and frontend
npm run dev
```

**What this does:**
- Starts backend API server on http://localhost:4000
- Starts frontend dev server on http://localhost:5173
- Enables hot module reloading (changes reflect immediately)
- Proxies `/api` requests from frontend to backend

**Alternatively, run servers separately:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start database (if not already running)
docker-compose up -d

# 2. Start development servers
npm run dev

# 3. Open in browser
# Frontend: http://localhost:5173
# Backend health check: http://localhost:4000/api/health
```

### Making Code Changes

1. **Edit code** - Changes auto-reload in browser
2. **Check for errors** - TypeScript and ESLint catch issues
3. **Stage changes** - `git add <files>`
4. **Commit** - `git commit -m "message"`
   - Pre-commit hook automatically runs ESLint
   - Auto-fixes issues when possible
   - Blocks commit if unfixable errors exist

### Running Linters Manually

```bash
# Check all code for issues
npm run lint

# Auto-fix all issues
npm run lint:fix

# Backend only
cd backend && npm run lint

# Frontend only
cd frontend && npm run lint
```

### Building for Production

```bash
# Build both backend and frontend
npm run build

# Backend outputs to: backend/dist/
# Frontend outputs to: frontend/dist/
```

### Database Management

```bash
# Access pgAdmin web interface
# Open: http://localhost:5050
# Login: admin@ojaplus.local / admin

# Connect to database:
# Host: postgres (or localhost from host machine)
# Port: 5432
# Database: ojaplus
# Username: postgres
# Password: postgres
```

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 4000 is already in use`

**Solution:**
```bash
# Find and kill process using port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port in backend/.env
PORT=4001
```

### Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Husky Pre-commit Hook Fails

**Error:** ESLint errors block your commit

**Solution:**
```bash
# View specific errors
npm run lint

# Auto-fix issues
npm run lint:fix

# Skip hook in emergency (NOT recommended)
HUSKY=0 git commit -m "message"
```

### Module Not Found Errors

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Docker Container Won't Start

**Error:** Database container exits immediately

**Solution:**
```bash
# Remove corrupted volumes
docker-compose down -v

# Restart fresh
docker-compose up -d

# Check logs for specific error
docker-compose logs postgres
```

---

## Project Structure

```
OjaPlusVentureSystem/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── app.ts             # Express app configuration
│   │   ├── server.ts          # Server entry point
│   │   ├── config.ts          # Environment configuration
│   │   ├── db/                # Database setup and schema
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Database queries
│   │   ├── middleware/        # Authentication, validation
│   │   └── validation/        # Zod schemas
│   ├── data/                  # Seed data (JSON files)
│   ├── .env                   # Environment variables (gitignored)
│   └── package.json
│
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Main app component
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client functions
│   │   ├── auth/              # Authentication context
│   │   ├── content/           # Site content management
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   ├── .env.local             # Environment variables (gitignored)
│   └── package.json
│
├── .husky/                     # Git hooks
│   ├── pre-commit             # Runs before each commit
│   └── _/husky.sh             # Husky helper script
│
├── docker-compose.yml          # Database container configuration
├── package.json               # Root workspace scripts
├── README.md                  # Project overview
└── DEVELOPMENT.md             # This file

```

---

## Technology Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express 4.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 15
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Security:** Helmet, bcryptjs, CORS

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Animations:** Framer Motion
- **3D Graphics:** Three.js
- **Routing:** React Router 7
- **Linting:** ESLint + TypeScript ESLint

### Development Tools
- **Version Control:** Git
- **Git Hooks:** Husky + lint-staged
- **Containerization:** Docker + Docker Compose
- **Process Manager:** Concurrently
- **Database UI:** pgAdmin 4

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Start both servers
npm run db:seed          # Seed database
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues
npm run build            # Build for production

# Docker
docker-compose up -d     # Start database
docker-compose down      # Stop database
docker-compose logs -f   # View logs
docker-compose ps        # Check status

# Git
git add .                # Stage all changes
git commit -m "msg"      # Commit (runs pre-commit hook)
git push                 # Push to remote

# Database
psql -h localhost -U postgres -d ojaplus  # Connect via CLI
```

---

## Admin Access (Development)

Default admin credentials for testing:

**Email:** `owner@ojaplusclub.com`
**Password:** `Nightlife!23`

Access admin dashboard at: http://localhost:5173/admin/login

---

## Getting Help

- **Issues:** Check [Troubleshooting](#troubleshooting) section
- **Architecture:** See [architecture_roadmap.md](architecture_roadmap.md)
- **Tasks:** See [project_tasks.md](project_tasks.md)
- **Best Practices:** See [best_practices_audit.md](best_practices_audit.md)

---

**Happy Coding! 🚀**
