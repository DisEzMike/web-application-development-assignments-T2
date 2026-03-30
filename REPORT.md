# REPORT.md

## 1. JS Engine vs. Runtime

In this project, JavaScript executes in two different environments:

- Frontend:
	- Engine: V8 (inside Chromium-based browsers such as Chrome/Edge)
	- Runtime: Browser runtime (Web APIs like DOM, Fetch API, localStorage, event loop in browser)
	- Example in this project: React code in the frontend runs in the browser and updates UI state.

- Backend:
	- Engine: V8
	- Runtime: Node.js runtime
	- Example in this project: Express routes, JWT signing, environment variable reading, and server-side fetch requests run in Node.js.

So both sides can use V8, but the runtime environment is different: Browser vs Node.js, with different available APIs and responsibilities.

## 2. DOM

This project uses React, so the screen is updated through the Virtual DOM approach.

- The UI is described as React components in JSX.
- When state changes (for example: notes loaded, login status changed, create error shown), React re-renders component output in memory (Virtual DOM).
- React compares the new Virtual DOM tree with the previous one (diffing/reconciliation).
- Only the minimal required real DOM nodes are updated.

In this implementation:
- `notes` state updates after `fetchNotes`, so the note list UI updates.
- `isLoggedIn` controls conditional rendering of the Auth section.
- `isFetchingNotes`, `isLoggingIn`, `isCreating`, `isUpdating`, and `isDeleting` toggle loading text/buttons.
- `createError` and `detailError` conditionally render validation feedback.
- `selectedNote` state controls the visibility and content of the edit modal dialog.
- `editTitle` and `editContent` state manage form input in the modal.

The edit modal demonstrates Virtual DOM efficiency:
- Clicking "View" on a note sets `selectedNote` state.
- React renders a fixed-position modal with backdrop blur effect.
- Form input changes update `editTitle` and `editContent` without re-fetching from server.
- On update/delete, the modal closes and the notes list refreshes.
- The modal is responsive, adapting layout and text sizing based on screen size using Tailwind's `sm:` breakpoints.

This is more efficient and maintainable than manually manipulating DOM nodes.

## 3. HTTP/HTTPS Request-Response Cycle

When the user clicks submit in the Create Note form:

1. Frontend intercepts form submit (`preventDefault`).
2. Frontend validates title/content and login token.
3. Frontend sends HTTP request:
	 - Method: `POST`
	 - URL: `/api/notes`
	 - Headers include:
		 - `Content-Type: application/json`
		 - `Authorization: Bearer <token>`
	 - Body: JSON note payload (`title`, `content`)
4. Backend receives request in Express route.
5. Auth middleware verifies JWT token using `JWT_SECRET` from backend environment variables.
6. Backend forwards request to PocketHost API (server-to-server HTTP call) with authorization and JSON payload.
7. PocketHost responds with success or error.
8. Backend returns final response to frontend.
9. Frontend updates UI (clear form, refresh notes, or show error message).

Why HTTPS is important in production:

- Confidentiality: encrypts token and note content in transit.
- Integrity: prevents tampering of requests/responses.
- Authenticity: helps ensure client talks to the real server.
- Security requirements: modern browsers and deployment platforms expect HTTPS for secure features.

If only HTTP is used in production, attackers on the network can read or steal credentials/tokens and manipulate traffic.

## 4. Environment Variables

In the current backend code, secrets are stored in backend `.env` and not in frontend code:

- `SECRET_TOKEN`: used by backend when calling PocketHost.
- `JWT_SECRET`: used by backend login route to sign JWT and by auth middleware to verify JWT.

Why it must not be in frontend code:

- Frontend code is public to users after build (inspectable via browser devtools/source maps/network).
- Any secret embedded in frontend can be extracted by anyone.
- If attackers get these secrets, they can forge valid tokens, impersonate users, or call protected upstream APIs.
- This breaks authentication and can allow unauthorized create/update/delete operations.

In this project, keeping secrets in backend environment variables ensures only the server can perform trusted token operations.
