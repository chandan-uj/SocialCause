# SocialCause

SocialCause is a community action platform for discovering local campaigns, volunteering, and sharing awareness stories. It is a MERN academic mini project with a React/Vite client and a separate Express/Mongoose API.

## Features

- Responsive campaign discovery with search, cause, status, location, sort, and pagination filters
- Campaign detail pages, related causes, organizer information, goals, volunteer capacity, and shareable links
- Cookie-based registration, sign-in, sign-out, current-user sessions, profile editing, and password changes
- Campaign creation and management with organizer ownership and administrator controls
- Capacity-limited volunteer registration, duplicate prevention, cancellation, and organizer registration lists
- Community awareness posts, likes, comments, reporting, and administrator moderation
- User dashboard and database-backed administrator metrics and management
- Validated contact form that stores a message for review; it does not claim to send email
- Safe development seeding and an environment-configured administrator bootstrap command

## Architecture

```text
SocialCause/
  client/                 React, Vite, Tailwind CSS, React Router
    src/components/       Shared layout and campaign card
    src/context/          Authentication session
    src/services/         Axios API client
    src/pages.jsx         Public pages, account pages, dashboards
  server/                 Express API and MongoDB persistence
    src/config/           Environment and database connection
    src/controllers/      Reserved for future controller extraction
    src/middleware/       Authentication, authorization, validation, errors
    src/models/           Mongoose schemas and indexes
    src/routes/           Versioned REST resource routes
    src/utils/            Shared error, async, and campaign lifecycle helpers
    tests/                Node test runner and Supertest API tests
```

The frontend calls `/api/v1` and Vite proxies API requests to `http://localhost:5000` during development. Production deployments should set `VITE_API_URL` to the API base URL and configure `CLIENT_URL` to the deployed client origin.

## Technology

- Client: React 18, Vite, React Router, Tailwind CSS, Axios, Lucide, React Hot Toast
- Server: Node.js ES modules, Express 4, Mongoose 8, MongoDB
- Security: bcrypt password hashing, expiring JWTs in HttpOnly cookies, Helmet, CORS, auth rate limiting, express-validator
- Tests: Vitest, React Testing Library, Node.js test runner, Supertest

## Prerequisites

- Node.js 20 or newer and npm
- MongoDB 6 or newer, locally or through MongoDB Atlas

## Installation and environment

Install dependencies in both applications:

```powershell
cd server
npm install
cd ..\client
npm install
```

Create `server/.env` from `server/.env.example`. Example values below are placeholders; replace the JWT secret with a cryptographically random value and keep `.env` private:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialcause
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_BOOTSTRAP_EMAIL=
ADMIN_BOOTSTRAP_PASSWORD=
```

`MONGODB_URI`, `JWT_SECRET` (at least 32 characters), and `CLIENT_URL` are required at server startup. Do not commit `.env` files. If using Atlas, use the connection string from your own cluster, configure database network access, and percent-encode reserved characters in the database password.

## Run the application

Open two terminals from the project root:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

Or run `npm run dev` from `server` and `npm run dev` from `client`. The client is available at `http://localhost:5173`; the API health endpoint is `http://localhost:5000/api/v1/health`.

For a production client build, run `npm run build` from the root or `npm run build` inside `client`. In production, serve the built client from an HTTPS origin, set `NODE_ENV=production`, set `CLIENT_URL` to that exact origin, use a strong secret, and restrict the MongoDB account to the required database and permissions. Production cookies are `HttpOnly`, `Secure`, and `SameSite=None` for a separately hosted client; the API only allows the configured CORS origin.

## Development sample data

Seeding is development-only, additive, and does not delete or overwrite existing records. Set `SEED_PASSWORD` to a private password of at least 12 characters before running:

```powershell
cd server
$env:SEED_PASSWORD = "choose-a-private-development-password"
npm run seed
```

The script creates fictional community members and sample campaigns/posts only when their records are not already present. Sample accounts are `maya@socialcause.local`, `arjun@socialcause.local`, and `leela@socialcause.local`; their password is the value supplied as `SEED_PASSWORD`. These are ordinary user accounts, not administrators. Do not use sample credentials in production.

## Create the first administrator

Set `ADMIN_BOOTSTRAP_EMAIL` and a unique `ADMIN_BOOTSTRAP_PASSWORD` (at least 12 characters) in the private `server/.env`, then run:

```powershell
cd server
npm run bootstrap-admin
```

The command creates a new administrator account and refuses to overwrite an existing account. Remove the bootstrap password from `.env` after use. Administrators can manage user roles through the protected admin dashboard; public registration never accepts a role.

## API

All endpoints are prefixed with `/api/v1`. Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`.

| Resource | Method and path | Access | Purpose |
|---|---|---|---|
| Health | `GET /health` | Public | API liveness |
| Auth | `POST /auth/register` | Public | Create a user (`name`, `email`, `password`) |
| Auth | `POST /auth/login` | Public, rate limited | Sign in (`email`, `password`) |
| Auth | `POST /auth/logout`, `GET /auth/me` | Public / signed in | Clear cookie / current user |
| Auth | `PATCH /auth/profile`, `PATCH /auth/password` | Signed in | Edit profile / change password |
| Users | `GET /users/me` | Signed in | Current user and account summary |
| Campaigns | `GET /campaigns` | Public | Search and filter; accepts `search`, `category`, `status`, `location`, `sort`, `page`, `limit` |
| Campaigns | `GET /campaigns/impact` | Public | Database-backed community totals |
| Campaigns | `GET /campaigns/:id` | Public (drafts private) | Campaign and related campaigns |
| Campaigns | `POST /campaigns`, `PATCH /campaigns/:id`, `DELETE /campaigns/:id` | Signed in / owner or admin | Create, edit, or cancel campaigns |
| Campaigns | `GET /campaigns/mine`, `GET /campaigns/:id/volunteers` | Signed in / owner or admin | Organizer dashboard and registrations |
| Volunteers | `POST /volunteers/:campaignId` | Signed in | Join an active campaign |
| Volunteers | `GET /volunteers/mine`, `DELETE /volunteers/:registrationId` | Signed in | View or cancel own registrations |
| Posts | `GET /posts`, `GET /posts/:id` | Public (unapproved posts private) | Paginated awareness feed and comments |
| Posts | `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id` | Signed in / owner or admin | Create and manage awareness posts |
| Posts | `POST` / `DELETE /posts/:id/like` | Signed in | Like or unlike without client-maintained counts |
| Comments | `POST /posts/:postId/comments`, `DELETE /comments/:id` | Signed in / comment owner or admin | Add or remove comments |
| Moderation | `POST /posts/:id/report` | Signed in | Report a post for administrator review |
| Admin | `GET /admin/stats`, `/admin/users`, `/admin/campaigns`, `/admin/posts/pending` | Admin | Actual database metrics and management queues |
| Admin | `PATCH /admin/users/:id/role`, `/admin/campaigns/:id/status`, `/admin/posts/:id/moderation` | Admin | Manage roles, campaign lifecycle, and moderation |
| Contact | `POST /contact` | Public | Validate and store a contact message for review |

Example registration request:

```json
{
  "name": "Maya Chen",
  "email": "maya@example.com",
  "password": "a-private-password"
}
```

Example campaign creation request:

```json
{
  "title": "Restore the neighborhood wetland",
  "shortDescription": "Join neighbors to care for a local wetland.",
  "description": "We will remove litter, restore native plants, and learn how to care for this shared habitat.",
  "category": "Environmental protection",
  "location": "Pune",
  "startDate": "2027-03-01",
  "endDate": "2027-03-31",
  "volunteerCapacity": 30,
  "goals": ["Restore native plants", "Bring neighbors together"]
}
```

Authentication uses an expiring signed JWT in an HttpOnly cookie. The server supports a bearer token for non-browser API clients. Password hashes are excluded from API responses; sensitive user fields are not exposed on public campaign or post views.

## Tests and verification

From the root:

```powershell
npm test
npm run build
```

Or run `npm test` separately in `server` and `client`. Backend API validation and authorization tests do not require a running MongoDB instance. Full persistence, concurrent registration, and end-to-end session flows require a configured MongoDB server and are not simulated by those unit/API tests.

## Troubleshooting

- **Server exits for missing configuration:** copy `server/.env.example` to `server/.env` and set required values.
- **MongoDB connection refused:** start local MongoDB or verify the Atlas URI, network access rules, and database credentials.
- **Browser cannot call the API:** verify `CLIENT_URL` exactly matches the browser origin, and run both client and server.
- **Cookies are not retained in production:** use HTTPS, the correct client origin, and credentialed requests; cross-site deployments require secure cookies.
- **Cannot bootstrap admin:** ensure both bootstrap variables are set and that no account already uses that email.
- **Campaign images do not load:** image URLs are optional; cards use a remote fallback image. Provide a valid public HTTPS URL for custom images.

## Future enhancements

Possible extensions include organization verification, event calendars, notification/email providers, accessibility audits with automated browser testing, and a dedicated file-storage service for uploaded media.
