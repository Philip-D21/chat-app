## Chat Application (Node.js + Express + Socket.IO + MySQL)

This is a TypeScript-based real‑time chat backend. Users can sign up, create public/private rooms, join via room id or invite link, and exchange messages over Socket.IO. Data is stored in MySQL using Sequelize, and tables are created automatically on startup.

## Features

- Authentication with JWT
- Create and join rooms (public/private, invite links)
- Real‑time messaging with Socket.IO
- Basic presence (online/offline) and typing indicators
- Sequelize models with auto sync on boot
- Centralized error handling

## Tech Stack

- Node.js, Express, TypeScript
- Socket.IO
- MySQL 8, Sequelize ORM
- Helmet, CORS, Morgan

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm 9+
- MySQL 8 (local instance or Docker)
- Docker and Docker Compose (optional, for containerized setup)

## Getting Started (Local)

1) Clone and install

```bash
git clone <your-repo-url>
cd chat
npm install
```

2) Configure environment variables

Create a `.env` in the project root (you can copy from `.env.example`).

Required variables:

```
PORT=2025
NODE_ENV=development

# JWT
JWT_SECRET=replace-with-a-strong-random-string

# Database (what the code expects)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chat_database
DB_USERNAME=root
DB_PASSWORD=yourpassword

# CORS
CORS_ORIGIN=*
```

3) Start MySQL

- If you have MySQL locally, ensure it’s running and the DB exists (Sequelize will create tables).
- Or start the DB via Docker Compose (see “Docker” section).

4) Run the server in development

```bash
npm run dev
```

Server listens on `http://localhost:2025` and will auto‑sync the schema.

## Build and Run (Production‑like)

```bash
npm run build
npm start
```

## Docker

There is a `docker-compose.yml` and `DockerFile` for containerized runs.

### Option A: Run only MySQL via Docker, app locally

1) In one terminal:

```bash
docker compose up -d db
```

This starts MySQL with credentials defined in `docker-compose.yml`:
- Database: `chat_database`
- User: `chat_user`
- Password: `chat_pass`
- Host (from app’s perspective): `localhost` if you run app on host; or `db` if you run the app in the same Compose network.

2) In your `.env`, set:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chat_database
DB_USERNAME=chat_user
DB_PASSWORD=chat_pass
```

3) Start the app locally with `npm run dev`.

### Option B: Run app and DB both via Docker Compose

1) Update the `app` service environment in `docker-compose.yml` so the variable names match what the code expects:

- Use `DB_USERNAME` and `DB_PASSWORD` (the code reads these), not `DB_USER` and `DB_PASS`.
- Use `DB_HOST=db` so the app connects to the DB service over the Compose network.

Example snippet to adapt inside `services.app.environment`:

```
PORT=2025
DB_HOST=db
DB_PORT=3306
DB_NAME=chat_database
DB_USERNAME=chat_user
DB_PASSWORD=chat_pass
JWT_SECRET=replace-with-strong-secret
CORS_ORIGIN=*
```

2) Bring everything up:

```bash
docker compose up -d --build
```

The API will be available at `http://localhost:2025`.

## API Overview

Base URL: `http://localhost:2025/api/v1`

### Auth

- POST `/auth/signup` — Create account
  - body: `{ firstname, lastname, username, email, password }`
- POST `/auth/login` — Sign in
  - body: `{ email, password }`
  - response: `{ token, userId, firstname, username, email }`

### Chat (JWT required)

- POST `/chat/rooms` — Create a room
  - headers: `Authorization: Bearer <token>`
  - body: `{ name, isPrivate }`
  - response: `{ status, roomId, inviteLink }`
- POST `/chat/rooms/:roomId/join` — Join a public room by ID
  - headers: `Authorization: Bearer <token>`
  - response: `{ status, message, newMember }`
  - Note: Private rooms cannot be joined by ID; use invite link.
- POST `/chat/invite/:inviteCode/join` — Join via invite (works for private rooms)
  - headers: `Authorization: Bearer <token>`
  - response: `{ status, message, room, newMember }`
- GET `/chat/rooms/:roomId/messages?limit=50&offset=0` — Get messages (paginated, newest first)
  - headers: `Authorization: Bearer <token>`
- GET `/chat/rooms` — List user rooms
  - headers: `Authorization: Bearer <token>`

## Socket.IO

Connect with a JWT via `auth.token` or `Authorization: Bearer <token>` header.

Events (send `auth.token` with JWT when connecting):

- `join_room` — `{ roomId }`
- `send_message` — `{ roomId, content }`
- `receive_message` — broadcasted message payload
- `typing` — `{ roomId, isTyping }`
- `user_status` — `{ userId, status, lastSeen? }`
- `message_delivered` — `{ messageId, roomId }` (emitted by server after update)
- `message_read` — `{ messageId, roomId, userId }` (emitted by server after update)
- `error` — `{ message }`

Additional:
- Rate limiting: 5 messages per 10 seconds per user/room.
- Presence: last seen is persisted on disconnect.

## Project Scripts

- `npm run dev` — Start in dev (ts-node + nodemon)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled server (`node dist/main.js`)

## Environment Variables

The server reads these keys:

- `PORT` (default 2025)
- `NODE_ENV` (`development` | `production`)
- `JWT_SECRET` (required)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `CORS_ORIGIN` (default `*`)

If you use Docker Compose, ensure the variable names in the `app` service match the above (especially `DB_USERNAME`/`DB_PASSWORD`).

## Troubleshooting

- Cannot connect to DB: verify host, port, credentials; with Compose use `DB_HOST=db` inside the network.
- MySQL auth errors: the Compose file enforces `mysql_native_password` for compatibility.
- Tables missing: Sequelize sync runs on boot; check logs for `Table synced successfully`.
- JWT errors on sockets: ensure you pass a valid token in `auth.token` or `Authorization` header.

## License

ISC © Daudu Philip