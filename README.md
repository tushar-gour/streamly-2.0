# Streamly

Streamly is a full-stack video platform workspace.

```txt
streamly/
  backend/   production-grade API, jobs, database, docs, Docker runtime
  frontend/  Next.js frontend foundation and design system
```

## Projects

| Project | Description |
| --- | --- |
| [backend](backend/README.md) | TypeScript Express API, PostgreSQL, Prisma, Redis, BullMQ, Nginx, OpenAPI |
| [frontend](frontend/docs/FRONTEND_ARCHITECTURE.md) | Next.js App Router foundation, Streamly design system, auth and screen shells |

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
```

Production API:

```txt
https://streamly-api.zytheran.me
```

## Repository Structure

The root keeps repository-level metadata such as `.git`, `.github`, `.codex`,
and shared ignore rules. Product code lives inside `backend/` and `frontend/`.
