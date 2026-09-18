# CrewBoard

A full-stack web application for managing events and volunteer shift scheduling, built with a strong focus on application security.

## Getting Started

**Prerequisites:** Java 21, Maven, Node.js 20+

1. Clone the repo and open two terminals — one for the backend, one for the frontend.

2. **Backend** (from `backend/`), with demo data seeded:

   ```bash
   SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
   ```

   On Windows PowerShell:

   ```powershell
   $env:SPRING_PROFILES_ACTIVE="dev"; mvn spring-boot:run
   ```

   Runs on `http://localhost:3001`. Uses an embedded H2 in-memory database — no database setup needed. Never enable the `dev` profile in a deployed environment.

3. **Frontend** (from `frontend/`):

   ```bash
   npm install
   npm run dev
   ```

   Runs on `http://localhost:3000`.

4. Log in with one of the seeded demo accounts (local dev only):

   | Role      | Email               | Password         |
   | --------- | -------------------- | ---------------- |
   | Admin     | admin@email.com      | Admin@12345!     |
   | Organizer | organizer@email.com  | Organizer@12345! |
   | Volunteer | volunteer@email.com  | Volunteer@12345! |

   These exist only in the seeded local/demo database and are not real credentials.

5. (Optional) Run the frontend unit tests:

   ```bash
   npm test
   ```

## About

CrewBoard supports three roles — Admins, Organizers, and Volunteers — each with a role-specific dashboard:

- **Admins**: full control over events, users, and platform settings
- **Organizers**: create and manage events, create shifts, assign volunteers, monitor schedules
- **Volunteers**: view assigned shifts, browse open shifts, see events needing help

See [SECURITY.md](./SECURITY.md) for a breakdown of the security controls implemented.

## Tech Stack

**Frontend:** React, Next.js, TypeScript, Tailwind CSS
**Backend:** Java, Spring Boot, Maven, PostgreSQL (H2 for local/dev)

## Production mode

Outside the `dev` profile, the app runs "production-strict": no demo data, no relaxed conveniences, and it refuses to start unless you supply your own `JWT_SECRET`.

## License

See [LICENSE](./LICENSE).
