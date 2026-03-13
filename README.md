# Job Application Tracker

A simple end-to-end web application to help students track their job applications.

This repository currently contains the **backend** for the app:

- ✅ User registration and login with JWT auth
- ✅ Secure password hashing
- ✅ PostgreSQL database (users + applications)
- ✅ Protected CRUD APIs for job applications
- ✅ Dockerised backend + database
- ✅ Auto-generated API docs with Swagger (FastAPI)

Frontend (React) and AWS deployment will be added next.

---

## Tech Stack

**Backend**

- Python 3.11
- FastAPI
- SQLAlchemy
- PostgreSQL 15
- Passlib (PBKDF2-SHA256 password hashing)
- PyJWT (JWT tokens)
- Docker & Docker Compose

---

## Architecture (current stage)

**Local**

- `backend` (FastAPI) runs on `http://localhost:8000`
- `db` (PostgreSQL) runs on `localhost:5432`
- Backend and DB are started together using `docker-compose.yml`

**Database tables**

- `users`
  - `id`
  - `name`
  - `email` (unique)
  - `password_hash`
  - `created_at`

- `applications`
  - `id`
  - `position`
  - `company`
  - `status` (Applied / Interview / Offer / Rejected, etc.)
  - `applied_date`
  - `user_id` (FK → users.id)

Each user can have many applications.

---

## Running the backend locally

### Prerequisites

- Docker Desktop installed & running
- Git installed

### Steps

```bash
# clone the repo
git clone https://github.com/JayaRevathi/job-tracker.git
cd job-tracker

# start backend + database
docker compose up --build -d

# check containers
docker ps
