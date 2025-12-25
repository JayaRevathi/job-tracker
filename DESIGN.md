# Design - Job Application Tracker

## Architecture
### Local
Browser → React → FastAPI → PostgreSQL

### AWS (Production)
- Frontend: S3 + CloudFront
- Backend: ECS Fargate behind ALB
- Database: RDS PostgreSQL
- Observability: CloudWatch logs/metrics

## Data Model
### users
- id
- name
- email (unique)
- password_hash
- created_at

### applications
- id
- user_id (FK)
- company_name
- job_title
- location
- job_posting_url
- status (SAVED/APPLIED/INTERVIEW/OFFER/REJECTED)
- priority (P1/P2/P3/P4)
- tags (array or comma-separated)
- applied_date
- next_followup_date
- notes
- created_at
- updated_at

## API Endpoints (planned)
### Health
- GET /health → { "status": "ok" }

### Auth
- POST /auth/register
- POST /auth/login

### Applications
- POST /applications
- GET /applications?status=&q=&followup_due=true
- GET /applications/{id}
- PUT /applications/{id}
- DELETE /applications/{id}

### Dashboard
- GET /dashboard/summary

## UI Screens (planned)
- /login
- /register
- /dashboard
- /applications (list + filter + search)
- /applications/new
- /applications/:id
