# SecureNote

A full-stack note management application built with:
- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript + Vite + Tailwind CSS

## Project Structure

- `backend/`: API server and auth middleware
- `frontend/`: client UI for login, note creation, and paginated note listing

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Variables (Backend)

Create `backend/.env` using this template:

```env
PORT=3000
POCKETHOST_URL=POCKETHOST_URL_HERE
SECRET_TOKEN=YOUR_SUPER_SECRET_TOKEN_HERE
JWT_SECRET=YOUR_JWT_SECRET_HERE
USER_ID=YOUR_USER_ID_HERE
```

Important:
- `SECRET_TOKEN` is used by backend requests sent to PocketHost.
- `JWT_SECRET` is used by backend login and auth middleware for JWT signing/verification.

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Run the Project

Open two terminals.

### Terminal A: Start backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:3000`.

### Terminal B: Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at Vite default URL (usually `http://localhost:5173`).

## Build Commands

### Backend build

```bash
cd backend
npm run build
```

### Frontend build

```bash
cd frontend
npm run build
```

## API Overview

Base URL: `http://localhost:3000/api`

### Auth

- `POST /login`
  - Body:
  ```json
  {
    "username": "your_name"
  }
  ```
  - Returns JWT token signed on backend.

### Notes

- `GET /notes?page=1`
  - Returns paginated notes (`page`, `totalPages`, `totalItems`, `items`) sorted by newest (`sort=-created`).

- `POST /notes` (requires Authorization header)
  - Header:
  - `Authorization: Bearer <token>`
  - Body:
  ```json
  {
    "title": "My title",
    "content": "My content"
  }
  ```

- `GET /notes/:id`
  - Returns one note by id.

- `PATCH /notes/:id` (requires Authorization header)
  - Body:
  ```json
  {
    "title": "Updated title",
    "content": "Updated content"
  }
  ```

- `DELETE /notes/:id` (requires Authorization header)
  - Deletes a note by id.
