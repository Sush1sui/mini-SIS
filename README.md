# Mini School — Mini SIS (Monorepo)

![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)
![Postgres](https://img.shields.io/badge/postgres-%3E%3D13-blue)
![Bun](https://img.shields.io/badge/bun-required-ffcc00)

A compact School Information System (SIS) monorepo with a Next.js admin frontend and a lightweight Node backend (Hono). Implements authentication, student/course/subject management, reservations, and a grading sheet backed by PostgreSQL.

Quick facts

- Session-based auth with a seeded admin user
- Students, Courses, Subjects: CRUD + data tables
- Subject reservations validated against student course
- Grading sheet (upsert) with uniqueness and consistency constraints
- Migrations and seeds (50 students + samples)

Requirements

- PostgreSQL (set `DATABASE_URL`)
- Bun (required for server scripts) — https://bun.com/docs/installation

Quick start

1. Client dependencies

```bash
cd client
npm install --legacy-peer-deps
```

2. Install Bun & server deps

Windows PowerShell:

```powershell
iwr https://bun.sh/install.ps1 -useb | iex
```

macOS / Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then:

```bash
cd server
bun install
```

3. Configure DB & seed

```bash
export DATABASE_URL=postgres://USER:PASS@HOST:PORT/DBNAME
cd server
bun run db:setup
```

4. Run (two terminals)

Backend:

```bash
cd server
bun run dev
```

Frontend:

```bash
cd client
npm run dev
```

Environment (minimum)

Create a `server/.env` with values similar to the example below. Do not surround the `DATABASE_URL` with quotes when setting it in your deployment provider (Render, Vercel, etc.).

```text
PORT=4000
DATABASE_URL=postgres://USER:PASS@HOST:PORT/DBNAME
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SESSION_SECRET=<your-session-secret>
```

Create a `client/.env` with values similar to the example below.

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Seeds & migrations

- `server/db/migrations/001_init.sql`
- `server/db/seed.sql`
- `server/scripts/seed_admin.ts`

Run `bun run db:setup` in `server/` to apply migrations and seeds.

API (summary)

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Students: `GET /students`, `POST /students`, `GET /students/:id`, `PATCH /students/:id`, `DELETE /students/:id`
- Courses/Subjects: CRUD under `/courses`, `/subjects`
- Reservations: `POST /students/:id/reservations`, `DELETE /students/:id/reservations/:subjectId`
- Grades: `GET /grades`, `POST /grades` (upsert), `PATCH /grades/:id`

Seeded admin

- Email: **admin@example.com**
- Password: **adminpass**

Notes & constraints

- `students.course_id` is required and references `courses.id`
- `subjects` unique by `(course_id, code)` and `(course_id, title)`
- `subject_reservations` unique `(student_id, subject_id)`
- `grades` unique `(student_id, subject_id, course_id)`; trigger enforces `grades.course_id` matches student's `course_id`

Where to look

- Server: `server/src`
- Frontend: `client/app`

---
