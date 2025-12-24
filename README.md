# Job Application Tracker (OPT-Friendly)

A web application to help students/OPT applicants track job applications, statuses, follow-ups, and notes in one place.

## Features (MVP)
- User registration & login (JWT)
- Add / edit / delete job applications
- Track status: Saved → Applied → Interview → Offer → Rejected
- Priority (P1–P4) and Tags (e.g., referral, remote, opt)
- Search and filter by status/company/title
- Dashboard summary (counts + follow-ups due soon)

## Tech Stack
- Frontend: React (planned)
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Local: Docker + Docker Compose
- CI/CD: GitHub Actions (planned)
- AWS: S3 + CloudFront (frontend), ECS Fargate + ALB (backend), RDS Postgres, CloudWatch

## Architecture
### Local (Development)
Browser → React → FastAPI → PostgreSQL

### Production (AWS)
Browser → CloudFront → S3 (React)
Browser → ALB → ECS Fargate (FastAPI) → RDS (Postgres)
ECS/ALB → CloudWatch (logs/metrics)

## Local Setup (Day 1)
### Prerequisites
- Docker Desktop
- Git

### Run backend
```bash
docker compose up --build -d
