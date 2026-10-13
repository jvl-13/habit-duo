# habit-duo
# Habit Duo — Build Better Habits Together

Habit Duo is a habit-tracking application designed for two people to build and maintain healthy habits together. Users can manage their habits, check in daily, upload photo proof, track consecutive-day streaks, and remind their accountability partner to stay on track.

The project uses **Next.js, TypeScript, NestJS, Prisma, PostgreSQL, and Socket.IO**.

> **Project status:** This README summarizes the architecture and features discussed during development. Some features and setup details still need to be verified against the actual repository before the project is considered production-ready.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Core Workflows](#core-workflows)
- [Streak Calculation](#streak-calculation)
- [Real-Time Presence](#real-time-presence)
- [Testing](#testing)
- [Known Limitations and Improvements](#known-limitations-and-improvements)
- [Future Enhancements](#future-enhancements)

## Features

### 1. Dashboard

- Protected dashboard accessible to authenticated users.
- Habit progress overview.
- Accountability partner information through `DuoCard`.
- Filtering for active habits that have reached their start date.
- Paginated habit list, with a target of six habits per page.
- Daily status and deadline information for each habit.

### 2. Habit Check-ins

- Daily check-ins for individual habits.
- Three habit statuses:
  - `Completed`
  - `Missed`
  - `Due today`
- Deadline-based check-in restrictions.
- Photo proof uploads after completing a check-in.
- Support for JPEG, PNG, and WebP images.
- A frontend upload size limit of 5 MB.
- Preview and replacement of uploaded photos.

> File type and size validation must also be implemented on the backend. Frontend validation alone is not sufficient for security.

### 3. Streak Tracking

Habit Duo tracks consecutive days on which a user completes a habit.

The current frontend approach follows these rules:

- Only check-ins belonging to the current user count toward their streak.
- Multiple check-ins on the same day count as one day.
- If the user has checked in today, the streak starts from today.
- If the user has not checked in today but completed the habit yesterday, the existing streak is retained.
- If the user missed yesterday and has not checked in today, the current streak is zero.

Accurate streak calculation depends on the API returning enough historical check-in records. For reliable statistics across multiple screens and devices, streak calculation should eventually be handled by the backend.

### 4. Accountability Partner

- Displays partner information through `DuoCard`.
- Supports partner reminders through the `Poke partner` action.
- Includes partner invitation and acceptance/rejection flows where implemented.
- Displays online/offline presence using Socket.IO.

### 5. Real-Time Presence

- Socket.IO client connection from the frontend.
- JWT-based socket authentication in the backend gateway.
- Tracking of active sockets by user.
- Presence events such as `presence:status` and `presence:update`.
- Updates to `lastSeenAt` when a user goes offline.

## Technology Stack

| Component                 | Technology               |
| ------------------------- | ------------------------ |
| Frontend framework        | Next.js 16               |
| UI library                | React                    |
| Programming language      | TypeScript               |
| Styling                   | Tailwind CSS 4           |
| Data fetching and caching | TanStack React Query     |
| Icons                     | Lucide React             |
| Backend framework         | NestJS                   |
| ORM                       | Prisma 7                 |
| Database                  | PostgreSQL 16            |
| Real-time communication   | Socket.IO                |
| Authentication            | JWT-based authentication |

## Architecture

```text
                        Browser
                           |
             +-------------+-------------+
             |                           |
          HTTP API                  Socket.IO
             |                           |
             v                           v
      Next.js Frontend             NestJS Backend
          :3000                       :4000
                                         |
                                         v
                                      Prisma
                                         |
                                         v
                                    PostgreSQL
                                       :5432
```

### Frontend

The frontend is responsible for:

- Rendering the user interface.
- Managing authentication state.
- Displaying habits and partner information.
- Sending check-in, photo upload, and reminder requests.
- Managing API cache and loading states with React Query.
- Receiving real-time presence updates.

### Backend

The backend is responsible for:

- Exposing REST API endpoints.
- Authenticating and authorizing users.
- Processing habit and check-in operations.
- Handling photo upload requests.
- Managing accountability partner operations.
- Tracking socket connections and user presence.
- Reading and writing database records through Prisma.

### Database

PostgreSQL stores application data according to the Prisma schema. The exact entities, relationships, and constraints should be verified in the repository's Prisma schema.

## Project Structure

The following is a simplified overview based on the files and modules discussed during development. The actual repository may contain additional directories or different file names.

```text
habit-duo/
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   │   └── dashboard/
│   │       ├── habit-card.tsx
│   │       ├── duo-card.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── auth/
│   │   │   └── auth-context.tsx
│   │   ├── queries/
│   │   │   ├── check-in-queries.ts
│   │   │   └── poke-queries.ts
│   │   └── ...
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── presence/
│   │   │   └── presence.gateway.ts
│   │   ├── app.module.ts
│   │   └── ...
│   ├── .env
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js compatible with the dependencies specified in the project.
- npm.
- Docker Desktop or Docker Engine.
- PostgreSQL 16, either running locally or in Docker.
- Git, if cloning the repository.

Verify your installation:

```bash
node --version
npm --version
docker --version
```

## Getting Started

### 1. Start PostgreSQL

If the `habit-duo-db` container already exists, start it:

```bash
docker start habit-duo-db
```

Check whether it is running:

```bash
docker ps
```

If you do not already have a database container, you can create one for local development:

```bash
docker run --name habit-duo-db \
  -e POSTGRES_USER=habitduo \
  -e POSTGRES_PASSWORD=change-me-local \
  -e POSTGRES_DB=habit_duo \
  -p 5432:5432 \
  -d postgres:16
```

Replace these example credentials with values that match your local configuration. Do not use example credentials in production.

### 2. Configure and Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file with the required database and authentication settings.

For example:

```env
DATABASE_URL="postgresql://habitduo:change-me-local@localhost:5432/habit_duo"
```

The exact environment variables depend on the backend configuration.

Run database migrations and generate the Prisma Client using the scripts supported by the repository. Common Prisma commands include:

```bash
npx prisma migrate dev
npx prisma generate
```

**Note:** Prisma 7 projects may require additional datasource, adapter, or environment-loading configuration. Follow the existing Prisma configuration and scripts in `backend/package.json`.

Start the development server:

```bash
npm run start:dev
```

The backend is expected to run at:

`http://localhost:4000`

### 3. Configure and Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create or update `frontend/.env.local`:

```env
NEXT_API_URL=http://localhost:4000
```

If Socket.IO uses a separate environment variable, configure it according to the variable name expected by the frontend's `SocketProvider`.

Start the development server:

```bash
npm run dev
```

Open the application at:

[http://localhost:3000](http://localhost:3000)

### 4. Run the Application

For local development, keep these services running:

1. PostgreSQL.
2. NestJS backend.
3. Next.js frontend.

If the application does not work as expected, check the terminal output for each service before debugging the frontend.

## Environment Variables

### Frontend — `frontend/.env.local`

| Variable              | Purpose         | Example                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_API_URL` | Backend API URL | `http://localhost:4000` |

Only expose values through `NEXT_*` when they are safe for the browser to access.

Never put database credentials, JWT secrets, or private keys in public frontend variables.

### Backend — `backend/.env`

| Variable                         | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                   | PostgreSQL connection string             |
| JWT/authentication variables     | Authentication configuration and secrets |
| Storage variables, if applicable | Photo storage configuration              |

Check the actual backend code and configuration to determine the complete list of required variables.

Do not commit `.env` files, passwords, access tokens, or other secrets to version control.

## Core Workflows

### Habit Check-in

1. The user signs in and opens the dashboard.
2. The frontend fetches habits and check-in history through React Query.
3. `HabitCard` identifies the current user's check-in for today's `dayKey`.
4. The user clicks the check-in button.
5. `useCreateCheckIn()` submits the request to the backend.
6. React Query refreshes the relevant data so the UI can display the updated status and streak.

### Photo Proof

1. The user completes a habit check-in.
2. The photo upload control becomes available for that day's check-in.
3. The frontend validates the image format and file size.
4. `useUploadCheckInPhoto()` uploads the image associated with the check-in.
5. The frontend displays the returned photo URL.

The backend must independently validate uploaded files and verify that the current user is authorized to modify the associated check-in.

### Partner Reminders

1. The user clicks `Poke partner`.
2. `usePokePartner()` sends a request to the backend.
3. The backend validates the request and determines the intended recipient.
4. The UI displays the result or any error returned by the API.

### Presence Updates

1. `SocketProvider` connects the frontend to the backend.
2. `PresenceGateway` authenticates the socket connection.
3. The backend tracks active socket connections for each user.
4. Presence events update the partner's online/offline state.
5. When a user goes offline, the backend can update `lastSeenAt`.

The socket provider should normally be mounted once in the root layout rather than independently on each page.

## Streak Calculation

The streak calculation depends on a consistent definition of a day.

- `dayKey` should use the `YYYY-MM-DD` format.
- The frontend and backend should follow the same timezone rules.
- The current streak should count consecutive completed days, not the total number of check-in records.
- Duplicate records for the same day must not increase the streak.
- Historical check-in data must be sufficient to calculate the complete streak.

The current `HabitCard` approach calculates streaks on the frontend. If the API limits the number of returned check-ins, the streak may be lower than the actual value.

**Recommended improvement:** Calculate streaks in the backend and return the result through the API. This allows the dashboard, statistics, and other clients to share one consistent calculation.

## Real-Time Presence

The backend includes a presence gateway at:

`backend/src/presence/presence.gateway.ts`

The presence module is registered in `AppModule`.

The gateway tracks connected users and emits presence-related events, including:

- `presence:status`
- `presence:update`

### Areas to Verify

- Socket authentication uses the correct JWT token.
- The frontend connects to the correct backend URL.
- Event listeners are registered and cleaned up correctly.
- Presence is synchronized when a duo becomes active after the socket has already connected.
- Multiple tabs or socket connections do not incorrectly mark a user offline when only one connection disconnects.

## Testing

Use the following manual testing checklist during development:

- [ ] Sign in and open the dashboard.
- [ ] Display active habits and paginate the habit list.
- [ ] Confirm that habits before their start date are excluded.
- [ ] Complete a habit check-in.
- [ ] Confirm that the status changes to `Completed`.
- [ ] Verify deadline behavior before and after the deadline.
- [ ] Upload a valid JPEG, PNG, or WebP image.
- [ ] Reject unsupported formats and images larger than 5 MB.
- [ ] Display and replace photo proof.
- [ ] Verify that partner reminders work correctly.
- [ ] Test online/offline status using two accounts or browsers.
- [ ] Verify streaks for consecutive days and missed days.
- [ ] Refresh the page and confirm that saved data remains correct.
- [ ] Verify backend authorization for check-ins, photos, and partner operations.

Run linting, type checking, and production builds using the scripts defined in each `package.json`.

## Known Limitations and Improvements

The following items should be verified or improved before production deployment:

- Ensure the check-in API returns enough history for streak calculation.
- Ensure React Query invalidates the correct queries after check-in and photo upload.
- Use a consistent timezone policy for `dayKey` and deadlines.
- Synchronize presence when a duo relationship becomes active.
- Handle multiple socket connections for the same user.
- Validate image content, type, and size on the backend.
- Verify ownership and authorization for every relevant endpoint.
- Add unit tests for streak and deadline logic.
- Confirm all required environment variables and startup scripts.
- Add appropriate logging, error handling, and production configuration.

## Future Enhancements

Potential improvements include:

- Weekly and monthly habit statistics.
- Check-in history and streak charts.
- Real-time notifications when a partner completes a habit.
- Backend-based streak calculation.
- Unit and integration tests.
- Production deployment and monitoring.

---

**Habit Duo** aims to make habit building more consistent and motivating through daily check-ins, visible progress, and mutual accountability.
