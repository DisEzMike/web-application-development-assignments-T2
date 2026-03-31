# SecureNote Web Application

This repository contains a full-stack notes application with authentication, note CRUD operations, pagination, and a minimal frontend.

## Project Structure

- backend: Express API server and middleware
- frontend: React client application

## Features

- Simple username login with JWT token generation
- Protected create, update, and delete note operations
- Public note listing with pagination
- Note detail viewing and editing modal
- Responsive minimal UI with icon-based visual hierarchy

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Setup

Create `backend/.env` using the same keys as `backend/.env.example`:

- `POCKETHOST_URL`: Notes collection endpoint URL
- `SECRET_TOKEN`: PocketHost auth token used by backend
- `JWT_SECRET`: Secret used to sign/verify login tokens
- `USER_ID`: User ID used when creating/updating notes
- `PORT`: Optional backend port (default: `3000`)

## Install Dependencies

From the repository root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run the Application (Development)

1. Start backend:

```bash
cd backend
npm run dev
```

2. Start frontend in a second terminal:

```bash
cd frontend
npm run dev
```

3. Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## Build for Production

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

Base URL: `http://localhost:3000/api`

- `POST /login`
  - Request body: `{ "username": "string" }`
  - Response: `{ "token": "jwt" }`

- `GET /notes?page=1`
  - Public endpoint
  - Returns paginated notes

- `POST /notes`
  - Protected endpoint
  - Header: `Authorization: Bearer <jwt>`
  - Request body: `{ "title": "string", "content": "string" }`

- `GET /notes/:id`
  - Public endpoint
  - Returns note detail by ID

- `PATCH /notes/:id`
  - Protected endpoint
  - Header: `Authorization: Bearer <jwt>`
  - Request body: `{ "title": "string", "content": "string" }`

- `DELETE /notes/:id`
  - Protected endpoint
  - Header: `Authorization: Bearer <jwt>`

## Notes

- The frontend reads API base URL from `VITE_API_BASE_URL` and falls back to `http://localhost:3000/api`.
- The backend currently allows CORS from any origin for development.
- Login accepts any non-empty username and returns a signed JWT.
