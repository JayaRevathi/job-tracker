
---

## 2) REQUIREMENTS.md (copy/paste)

```md
# Requirements (MVP) - Job Application Tracker

## Purpose
Help students/OPT applicants track job applications and follow-ups in one place.

## Users
- Student/User (only role in MVP)

## MVP Functional Requirements
### Authentication
- Register (name, email, password)
- Login (JWT token)
- Protected endpoints require JWT

### Applications (CRUD)
User can create, view, update, delete job applications with:
- company_name (required)
- job_title (required)
- location (optional)
- job_posting_url (optional)
- status: SAVED, APPLIED, INTERVIEW, OFFER, REJECTED (default SAVED)
- priority: P1, P2, P3, P4 (default P3)
- tags: list of strings (optional)
- applied_date (optional)
- next_followup_date (optional)
- notes (optional)

### List / Search / Filter
- Filter by status
- Search by company/job_title keyword
- View follow-ups due in next 7 days

### Dashboard
- Counts by status
- Follow-ups due in next 7 days

## Non-Functional Requirements
- Passwords stored as hashes (bcrypt)
- User can only access their own records
- Health endpoint for monitoring
- Runs locally with Docker Compose
- Ready for CI/CD + AWS deployment

## Out of Scope (MVP)
- Email/SMS notifications
- Sharing/collaboration
- Resume parsing / auto-apply
- Complex analytics

## Acceptance Criteria (Done)
- Local: Docker Compose runs backend (and later DB/frontend)
- `/health` works
- Auth + full CRUD works
- Filters/search work
- Dashboard summary works
- CI runs tests + builds images + scans
- AWS deployment works with a live URL
