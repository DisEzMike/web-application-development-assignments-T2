## 1. JS Engine vs. Runtime

My project uses JavaScript in two different runtime environments:

- Frontend runtime: Browser
- Frontend engine: Usually V8 in Chrome/Edge (or another browser engine such as SpiderMonkey in Firefox)
- Backend runtime: Node.js
- Backend engine: V8

Frontend code (React components, state updates, event handlers) is executed inside the browser runtime after Vite builds/serves the app. Backend code (Express routes, JWT verification, server logic) is executed by Node.js on the server side. So the engine can still be V8 in both places, but the runtime environment is different: browser runtime for UI code vs Node runtime for API/server code.

## 2. DOM / Virtual DOM

I use React in the frontend, so updates are handled through the Virtual DOM approach, not manual DOM tree manipulation.

How it works in my app:

- User actions (for example typing in inputs, submitting login/create form, opening edit modal) update React state via `useState`.
- React re-renders the component tree in memory (Virtual DOM).
- React compares (diffs) the new Virtual DOM with the previous one.
- Only changed parts of the real DOM are updated efficiently.

Example from my implementation:

- When note data arrives from `GET /api/notes`, the `notes` state is updated.
- React then updates only the notes list section in the DOM.
- When `selectedNote` changes, the modal appears/disappears without reloading the whole page.

This makes UI updates fast and predictable.

## 3. HTTP/HTTPS Request-Response Cycle

When I click a submit button (for example Login or Create Note), this cycle happens:

1. The browser sends an HTTP request from the frontend to backend API.
2. Backend receives the request, validates data/token, and processes logic.
3. Backend returns a JSON response with status code.
4. Frontend reads the response and updates UI state.

Typical headers used in my app:

- `Content-Type: application/json` for JSON body requests
- `Authorization: Bearer <jwt>` for protected routes (`POST/PATCH/DELETE /notes`)
- Browser-managed headers such as `Origin`, `Host`, and `Accept`

Backend also sends CORS headers (configured in server middleware), such as:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

Why HTTPS is important in production:

- Confidentiality: Encrypts traffic so tokens/data cannot be read in transit.
- Integrity: Prevents request/response tampering.
- Authentication: Confirms the client is talking to the real server (via TLS certificates).

Even if local development uses HTTP, production should use HTTPS to prevent token theft and man-in-the-middle attacks.

## 4. Environment Variables and `SECRET_TOKEN`

I stored `SECRET_TOKEN` in backend `.env` because it is a server secret used to call the upstream PocketHost API. The backend reads it from environment variables and sends it in server-to-server requests.

If `SECRET_TOKEN` is placed in frontend code:

- It becomes visible in the built JavaScript bundle.
- Anyone can inspect it from browser DevTools/source maps/network traffic.
- Attackers can reuse the token to call external APIs as if they were my app.
- This can cause unauthorized data access, abuse, and possible quota/cost issues.

So secrets must stay on the backend only, where users cannot directly read server environment values.
