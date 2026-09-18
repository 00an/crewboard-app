# Security Architecture

This document describes the security controls implemented across CrewBoard's backend (Spring Boot / Spring Security) and frontend (Next.js), and the reasoning behind each design decision. It's written for fast scanning — each control is a bullet with the "why" attached.

Every major control below is presented as a **Blue team / Red team** pair: what was built to defend the system, and what was actually attempted against it to verify the defense holds (not just "it should be secure" — it was tested). A full control-to-file summary table is at the end.

## Threat Model & Scope

CrewBoard is a multi-tenant scheduling app with three roles (Admin, Organizer, Volunteer) and resource-ownership boundaries (an Organizer manages only the events they created). The controls below are built around:

- **Broken access control** — a user reaching data or actions outside their role or ownership scope (BOLA/IDOR, privilege escalation).
- **Credential and session attacks** — brute-forcing, credential stuffing, session/token theft, account-enumeration side channels.
- **Injection and untrusted input** — malformed/malicious payloads, XSS, server-side request forgery.
- **Configuration drift** — secure defaults silently weakening outside a development environment.
- **Supply chain risk** — vulnerable/outdated dependencies and insecure CI/CD practices.

## Architecture & Trust Boundaries

A simulated production deployment (the app doesn't run on a public server, but the architecture is designed as if it did):

```
Browser → [Internet] → Load Balancer / Reverse Proxy → Next.js frontend → Spring Boot API → PostgreSQL
```

- **Internet → Load Balancer** — full TLS termination at the edge. The certificate lives here only; the browser negotiates TLS with the load balancer, not with any internal service. This is the standard edge-termination model: one place to manage certificates instead of distributing them to every internal service.
- **Load Balancer → frontend → API** — plain HTTP, on the assumption that both hops stay on the same trusted private network (a Docker bridge / VPC subnet). If the architecture ever spanned multiple hosts or availability zones, mTLS would be the right upgrade for these hops.
- **API → PostgreSQL** — `sslmode=require` in production even though both services share a private network: encryption in transit and server certificate validation as defense-in-depth, not the primary control.

This is a deliberate choice for a single-trust-zone deployment; in a zero-trust network model (no internal hop implicitly trusted) end-to-end TLS with mutual authentication would replace it.

## Cryptography

- **Password storage** — BCrypt via Spring Security's `BCryptPasswordEncoder`. BCrypt generates a unique random salt per password (two users with the same password get different stored hashes) and is intentionally slow, making offline mass-cracking computationally expensive.
  - *Mitigated:* plaintext database leaks, rainbow-table attacks, brute-force cracking at scale.
  - *Not mitigated:* phishing (a user can still be tricked into handing over their real password to a fake site), and weak password choice — addressed separately by the server-side password policy below.
- **Secret / key management** — the JWT signing secret is never committed to source control. The tracked config file references it only as an environment-variable placeholder (`${JWT_SECRET}`); the real value is injected at runtime and is git-ignored everywhere else. If this secret leaked, an attacker could forge valid tokens and impersonate any user — keeping it out of the repository (and out of git history) is the control that matters most here.
- **Code-integrity via version control** — every commit is content-hashed by git, so any retroactive tampering with history is detectable, and only authenticated, permissioned contributors can push changes. Per-commit cryptographic signing (GPG) is not yet enabled — accepted as a residual gap for now, since it would add stronger per-commit author verification on top of this.

**Blue team:** rotated a hardcoded JWT secret out of `application.yaml` and out of git history entirely, replaced with an environment-variable placeholder; configured BCrypt for all password storage with no plaintext or reversible-encryption fallback path.
**Red team:** searched the repository and its full git history for the secret string (`git log`-style history search, plus a secret-scanning pass) — confirmed it was not recoverable from the tracked repository after rotation, only from history predating the fix (which is why rotation, not just deletion, was necessary).

## Authentication & Session Management

Authentication is stateless JWT, issued on login and delivered as an `httpOnly` cookie — the frontend never reads or stores the token itself, which removes the most common path an XSS payload would use to steal a session.

- **`HttpOnly`** — cookie is inaccessible to client-side script (`document.cookie` cannot read it).
- **`Secure`** — sent only over HTTPS. On by default; only the `dev` profile relaxes it, since local dev typically runs over plain HTTP.
- **`SameSite=Strict`** — never attached to a request originating from another site, including top-level navigations. This is also why there's no separate CSRF token: CSRF relies on the browser auto-attaching a session credential to a forged cross-site request, and `SameSite=Strict` removes that precondition outright (documented inline in `SecurityConfig`). CORS is the complementary control, restricting which origins can even make a credentialed request in the first place.
- **Matched expiry** — fixed `path=/` and a `maxAge` matching the JWT's own expiration (8 hours), so cookie and token expire together.
- **Clean logout** — logout sets the cookie with `Max-Age=0`, deleting it client-side immediately. Because JWTs are stateless, there is no server-side revocation list: a token is technically valid until its 8-hour expiry even after logout, if an attacker already holds a copy. This is an accepted risk of the stateless design (see Known Limitations) rather than an oversight.
- **Live re-validation** — a `JwtAuthFilter` checks the token's signature and expiry on every request, then re-resolves the user from the database rather than trusting embedded claims. This closes the "disabled account, still-valid token" gap: a token issued before an admin disables an account would otherwise keep working until it naturally expires. The filter checks `user.isEnabled()` on every authenticated request (and again at login), so a disabled account loses access immediately, not up to 8 hours later.
- **Password changes** require the current password to be re-verified against the stored hash before a new one is accepted (`POST /api/auth/change-password`), so an attacker with a hijacked but still-open session can't silently take over the account by setting a new password without knowing the old one. The new password runs through the same policy check as registration.
- **Password reset** is a two-step, token-based flow: a cryptographically random token (128 bits of entropy) is generated, tied to the target email, and expires after 60 minutes; any prior unused token for that email is invalidated when a new one is issued, so tokens can't be accumulated and replayed later.

**Blue team:** pre-computed a dummy password hash at startup so a login attempt against a *non-existent* email still pays the same BCrypt cost as a login against a real one; unified every login failure (unknown email, wrong password, disabled account) into the same generic `401 Invalid credentials` response; added the current-password check on password changes.
**Red team:** timed repeated login attempts against known-existing vs. known-nonexistent email addresses before and after the fix — before, the nonexistent-email path returned near-instantly while the wrong-password path took roughly BCrypt's full comparison time, a measurable side channel for enumerating registered emails; after the fix, both paths took approximately the same time. (Residual risk: BCrypt timing isn't perfectly constant under real-world load/GC/JIT jitter — a very large sample could still detect a small remaining delta; a minimum response-delay at the reverse-proxy layer would close that further.) Also attempted to read the session cookie via an injected script — blocked, since `HttpOnly` cookies aren't exposed to `document.cookie`.

## Authorization & BOLA Prevention

- **Centralized route rules** — all route-level authorization lives in one Spring Security filter chain (`SecurityConfig`), not scattered across controllers: public auth endpoints, admin-only routes, organizer/admin write access to events and shifts, volunteer-only self-service routes, and an authenticated-by-default fallback for anything not explicitly listed. `@EnableMethodSecurity` backs this with method-level role checks where needed.
- **Field-level authorization, not just endpoint-level** — a Volunteer can update only their own `phone` field via their own profile endpoint; only an Admin can change a user's `role` or `enabled` status, via a separate admin-only endpoint with its own request type. Keeping these as two distinct request types (rather than one generic "update user" endpoint with conditional field handling) means the field restriction is enforced at the type level, not by an `if` statement that could be missed.
- **Ownership checks, not just role checks** — role checks alone confirm *what* a user can do in general, not *which* resource they can do it to. Every event- and shift-mutating service method (`create`, `update`, and equivalents) calls an explicit ownership check comparing the authenticated user's identity against the resource's recorded owner, bypassed only for Admins. This is enforced in the service layer, not inferred from the URL, so it can't be silently skipped by a route that forgets to add it.

**Blue team:** added the initial ownership check to the event/shift service layer; later added the equivalent check to the volunteer-assignment flow after the gap below was found; scoped the "list available volunteers for a shift" endpoint to only the organizer who owns that shift's event.
**Red team — two rounds:**
- *Round 1 (found the gap):* authenticated as an Organizer and successfully called the assignment-creation endpoint with a shift ID belonging to a *different* organizer's event — the request was accepted with no ownership check, meaning any organizer could assign volunteers to, or view volunteer details for, any event on the platform, not just their own. This is a textbook BOLA/IDOR finding.
- *Round 2 (verified the fix):* repeated the same cross-tenant assignment attempt after the ownership check was added — the request was correctly rejected. Also attempted an admin-only endpoint using a valid but non-admin token — rejected at the filter level before it reached any business logic.

## Input Validation

- Every request-body DTO uses Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Email`, `@Positive`); every controller method that accepts one applies `@Valid`.
- Validation failures return structured, per-field `400` errors via a dedicated exception handler — never a stack trace.
- A catch-all exception handler returns a generic `500` for any unexpected server error, so internal exception details never reach the client.

## Password Policy

- **Minimum 12 characters**, plus required uppercase, lowercase, digit, and special-character composition, enforced server-side via a dedicated password-policy check (not a third-party breach-database lookup, but composition + a common-password blocklist).
- Enforced identically for registration, password changes, and password resets.
- The frontend mirrors the same rules for immediate feedback, but enforcement that actually matters is server-side — client-side validation is trivially bypassed.

**Blue team:** implemented the server-side policy check and wired it into every password-setting endpoint (register, change, reset).
**Red team:** attempted registration with a set of common/weak passwords (short passwords, dictionary words with a trailing digit, keyboard-walk patterns) — all rejected by the policy check before a user record was ever created.

## Rate Limiting

- A sliding-window limiter sits in front of the auth-sensitive endpoints (login, register, forgot-password, reset-password): **max 10 requests per source IP per 60-second window**, then `429 Too many requests`.
- **`X-Forwarded-For` is only trusted when explicitly configured** (`app.security.trust-proxy-headers`); otherwise the raw connection address is used. Blindly trusting that header would let any client set an arbitrary value and rotate through fake "IPs" to bypass the limiter — it should only be honored when a trusted reverse proxy is actually the one setting it.
- A scheduled background task evicts stale tracking entries so the in-memory request log doesn't grow unbounded.

**Blue team:** implemented the sliding-window filter ahead of the JWT filter in the chain, scoped to the four auth-sensitive endpoints.
**Red team:** scripted repeated login attempts against a known account — the first 10 within the window were processed normally (and correctly rejected as wrong-password), and the 11th onward received `429` until the window rolled over, bounding a brute-force/credential-stuffing attempt to 10 guesses/minute/IP.
**Known gap:** state is in-memory and per-instance — a horizontally scaled deployment behind a load balancer needs a shared store (e.g. Redis) for the limiter to stay effective across instances, and IP rotation through residential proxies can bypass IP-based limiting outright. Both are accepted as out of scope for the current single-instance deployment.

## Injection Prevention

**SQL / JPQL injection**

- All database access goes through Spring Data JPA — derived query methods and parameterized `@Query` with named parameters. No query in the shipped codebase uses string concatenation, so JPA generates parameterized prepared statements everywhere, making injection through the normal query layer structurally unavailable.
- The database role the application connects as has only `SELECT`/`INSERT`/`UPDATE`/`DELETE` — no `DROP`/`TRUNCATE`/schema-modification rights — and all database errors are caught and returned as a generic `500` with no table/column names or driver error text exposed to the caller, so even a hypothetical injection point would leak less.

**Blue team:** during a deliberate internal exercise, one reviewer introduced a string-concatenated JPQL query to see if it would be caught in review; a second reviewer flagged it and replaced it with the parameterized equivalent before it reached the main branch.
**Red team:** tested the concatenated version with a classic `' OR '1'='1` style payload in the email field — against the unsafe query, it altered the predicate and returned every user in the table; against the parameterized version, the same input was treated as a literal string and matched nothing. This confirmed both that the pattern is genuinely exploitable when present, and that the standard JPA query style in the rest of the codebase is not.

**Cross-site scripting (XSS)**

- The frontend is React/Next.js, which HTML-escapes all dynamic `{content}` rendered through JSX by default — this is why the codebase avoids `dangerouslySetInnerHTML` everywhere it currently does (see Frontend Security below).

**Blue team:** as an internal exercise, one reviewer temporarily rendered a user-controlled field (a display name) via `dangerouslySetInnerHTML`; a second reviewer flagged it in review and reverted it to plain JSX rendering.
**Red team:** submitted a payload like `<img src=x onerror="...">` as the field value — against the unsafe render it executed and could reach `document.cookie`; against the safe JSX render the same input rendered as inert escaped text. Because the session cookie is `HttpOnly`, even a successful XSS in this scenario would not have been able to read it — a second layer behind React's default escaping. The `Content-Security-Policy` script-src restriction is a third layer, blocking inline script execution in modern browsers even if an injection point existed.

**Server-side request forgery (SSRF)**

No feature in the app fetches a user-supplied URL, so there's no live SSRF surface — but a dedicated URL-validation endpoint demonstrates the defense pattern the app would use if one were added, checking a URL without ever actually fetching it:

- **Scheme allow-list** — only `http`/`https`.
- **Port allow-list** — only 80/443.
- **Obvious-internal hostname rejection** — `localhost`, `.internal`, `.local` suffixes.
- **Resolved-IP validation (the check that actually matters)** — the hostname is resolved via DNS and rejected if any resolved address is loopback, link-local, RFC-1918 private range, or multicast/wildcard. Checking the hostname string alone isn't enough: an attacker can register a public-looking domain that resolves to an internal IP (DNS rebinding) — validating the *resolved* address closes that gap.

**Red team bypass attempts:**

| Attempt | Result |
|---|---|
| `http://127.0.0.1/...` | Rejected — loopback |
| `http://169.254.169.254/...` (cloud metadata endpoint) | Rejected — link-local |
| `http://[::1]/...` (IPv6 loopback) | Rejected — IPv6 loopback resolved and blocked |
| A public-looking hostname that resolves to `127.0.0.1` | Rejected — post-resolution IP check catches it regardless of hostname |
| A public host on a non-standard port | Rejected — port allow-list |
| A normal public HTTPS URL | Allowed |

**Other injection classes — assessed, not applicable:**

- **Command injection:** no shell execution (`Runtime.exec`/`ProcessBuilder`) anywhere in the backend — no surface exists.
- **Template injection:** no server-side templating engine; API responses are plain JSON.
- **NoSQL injection:** the only datastore is PostgreSQL via JPA — not applicable.
- **HTTP response splitting / header injection:** all response headers are set programmatically via framework APIs, never built from raw user input.
- **Log injection:** structured JSON logging encodes every field as a typed JSON value, so control characters in user input (e.g. a crafted email with embedded newlines) can't forge additional log lines.

## Session Management, Clickjacking & CSRF

- **Session hijacking** — mitigated by the `HttpOnly` cookie (no JS read access); residual risk is any environment where `Secure` isn't enforced (must always be on outside local dev).
- **Session fixation** — not applicable to this design: fixation requires a server-side session identifier that persists across login, and a fresh JWT is issued on every successful login, so an attacker can't pre-plant a token and wait for a victim to authenticate into it.
- **CSRF** — the primary control is `SameSite=Strict` plus a CORS policy restricted to the known frontend origin(s); a dedicated CSRF token is not additionally implemented, since the cookie attribute already removes the precondition CSRF relies on for this app's request pattern. Documented as a conscious choice, not an omission.
- **Clickjacking** — `X-Frame-Options: DENY` plus the modern equivalent `Content-Security-Policy: frame-ancestors 'none'` (browsers increasingly prefer the CSP directive).

**Blue team:** added both clickjacking headers to the shared security-header configuration; confirmed no route opts out of them.
**Red team:** attempted to embed the app in an iframe from another origin — blocked, with the browser reporting the frame refusal; attempted to read the session cookie via script injection — blocked by `HttpOnly` (see XSS above).

**Accepted risks in this area:**

| Risk | Reason accepted |
|---|---|
| No JWT revocation list on logout | Stateless architecture; a shared blocklist (e.g. Redis) is future work, not in scope now |
| Explicit CSRF token not implemented | `SameSite=Strict` + origin-restricted CORS is the primary control for this app's request pattern |

## Vulnerable & Outdated Components

- **SBOM generation** is part of the build process for both backend (Maven/CycloneDX) and frontend (npm/CycloneDX + `npm audit`), so the full dependency tree — including transitive dependencies — is enumerated in a machine-readable format rather than relying on memory of what's installed.
- Findings are cross-referenced against the NVD to catch known CVEs in the dependency tree, not just the direct, top-level packages.

**Representative findings and how they were triaged** (severity is about the *dependency*, not necessarily about exploitability in this app — the triage step is what matters):

- A transitive **devDependency-only** package with a known prototype-pollution/DoS advisory — confirmed it only loads during test runs, never ships in the production bundle or executes in a browser/server context at runtime. Triaged as no production impact; upgrade path deferred behind a larger test-tooling migration rather than urgent.
- A transitive **build-time-only** dependency with a ReDoS advisory tied to an opt-in feature the build never enables — confirmed no runtime exposure, but flagged as a supply-chain concern for CI itself (a compromised build config could still exploit it during a build). Mitigated by keeping the dependency tree updated within compatible version ranges.
- A **JWT-library-adjacent architectural finding** (not a CVE in the library itself): the signing secret was hardcoded in a committed config file, and the secret's content was weak (dictionary-word-based) rather than a true random value. This is the same finding covered under Cryptography above — flagged here too because it surfaced during dependency/config review, not just code review. Fixed by rotating to a random, sufficiently long secret sourced from an environment variable, and adding automated secret-scanning to catch any future recurrence before merge.

**Blue team:** generates SBOMs on a regular cadence, cross-references against NVD, triages each finding by actual runtime exposure rather than blanket-patching everything regardless of reachability, and added secret-scanning to catch hardcoded credentials before they reach the tracked repository.
**Red team:** ran dependency-audit tooling and a repository secret-scan independently of the blue-team findings — corroborated the hardcoded-secret finding (recoverable from git history prior to rotation) and confirmed no other actively-exploitable, runtime-reachable CVE in the current dependency tree.

## Logging & Monitoring

- **No leaked internals:** unhandled exceptions are logged server-side with full detail (stack trace, exception type) via structured logging, while the client only ever receives a generic `"An unexpected error occurred"` message — replacing an earlier pattern of printing raw stack traces and plain-text credentials-adjacent info directly to console output, which had no retention, no structure, and no separation between routine and security-relevant events.
- **Structured, separated logs:** general application events and security-relevant events (every login attempt — success, wrong password, unknown email — each tagged with a machine-readable reason) are written to two separate log streams, so security monitoring doesn't have to filter noise out of general application chatter, and security logs can carry a longer retention policy than routine app logs.
- **No enumeration via logs vs. response:** every login failure returns the identical generic HTTP response regardless of cause; the *reason* (unknown email vs. wrong password vs. disabled account) is captured only in the internal security log, never in anything the caller can observe.
- **Centralized, queryable:** logs ship to a log-aggregation stack (structured JSON ingestion, indexed by day, with application and security events routed to separate indices) so incident investigation is a query, not a grep through scattered files across instances.

**Blue team:** replaced ad-hoc `printStackTrace`/console-print logging with structured logging throughout, split security-relevant events into their own log stream with longer retention, and stood up log aggregation with separate indices per log type.
**Red team:** generated a mix of failed logins (nonexistent email, wrong password on a real account) and confirmed in the aggregated logs that each was recorded with the correct internal reason code — while confirming, separately, that the HTTP responses returned to the client never varied by reason, so the extra logging detail creates no new enumeration channel for an external attacker.

## Secure CI/CD

Assessed against the OWASP CI/CD Top 10. Two findings were rated most critical:

- **Credential hygiene** — the JWT signing secret was in source control (see Cryptography above); any developer, CI runner, or repository-reader could forge tokens and impersonate any user. Fixed by moving it to environment-injected secrets and adding automated secret-scanning to the workflow so this class of finding can't silently reappear.
- **Flow control** — without required reviews or passing-status-check gates on the main branch, a single compromised contributor account could push directly to production-bound code with no second set of eyes and no automated check in the way. Documented as a required follow-up (branch protection: mandatory review + passing checks before merge).

Other gaps assessed and tracked as follow-ups rather than immediate fixes: dependency-chain pinning/lockfile enforcement in CI, artifact/image signing and checksum verification, and CI/CD-specific audit logging separate from the application's own logs (today's structured logging covers the running app, not the pipeline that built it).

**Blue team:** rotated the leaked secret out of source control and added secret-scanning to catch recurrence; documented the required branch-protection configuration.
**Red team:** confirmed via a repository history scan that the old secret was recoverable from history prior to rotation — demonstrating this was a real, immediately exploitable finding rather than a theoretical one — and confirmed no pipeline configuration currently exists that could itself be abused to inject malicious build steps (a risk that would need addressing if/when a CI pipeline is added).

## Security Misconfiguration & Insecure Design

**Misconfiguration fixes applied:**

- Removed raw stack-trace output from API error responses (see Logging & Monitoring).
- Added the clickjacking/frame headers that a disabled or default-permissive frame policy would otherwise leave off.

**Misconfiguration tracked as follow-up:** development-convenience endpoints (an embedded database console, actuator/metrics endpoints, interactive API-docs UI) are gated behind the `dev` profile as described under Secrets & Configuration Management below — the remaining follow-up is periodically re-verifying that gate stays intact as the app evolves, since a profile check that's correct today can regress silently in a future change if it isn't covered by a test.

**Insecure-design fixes applied:**

- Server-side password strength enforcement was added rather than left to the frontend alone (see Password Policy) — the original design allowed arbitrarily weak credentials to reach storage.
- The password-reset flow was designed from the start to be enumeration-resistant (identical response regardless of whether the email exists) rather than patched after the fact.

**Insecure-design gaps tracked as follow-up:** the BOLA gap found in Authorization above was fundamentally a data-modeling omission — resource ownership wasn't modeled as a first-class, always-checked relationship from day one, which is why it had to be retrofitted rather than being structurally impossible. The broader lesson carried forward: model ownership/tenancy into the data layer before writing the first endpoint that touches a shared resource, not after.

## Secrets & Configuration Management

The application is designed to fail closed rather than silently run insecurely.

- **No default JWT secret outside `dev`** — if the signing secret isn't set as an environment variable, the app refuses to start rather than falling back to a known/guessable key.
- **Dev conveniences are opt-in, not opt-out** — seed/demo data, relaxed cookie security (`Secure` off), and diagnostic endpoints (embedded DB console, actuator, interactive API docs) are all gated behind the same `dev` profile. A deployment that simply omits enabling that profile gets the strict configuration automatically, without anyone needing to remember to disable each convenience individually.
- **Reset tokens never hit a real log** — the `dev`-only email sender logs the token for local testing; every other profile uses a no-op sender that logs a warning instead of the token itself, so a reset token never ends up in a log stream that could be shipped to a log aggregator in production.
- **Single-source CORS config** — allowed origins/methods/headers are defined once per environment, not hardcoded or duplicated across files.

## Security Headers & Content Security Policy

Both backend and frontend responses carry a hardened header set:

| Header | Effect |
|---|---|
| `Content-Security-Policy` | Restricts script/style/connect/frame sources; frontend policy locks scripts to same-origin with no inline or `eval`'d code in production |
| `X-Frame-Options: DENY` / `frame-ancestors 'none'` | Prevents framing (clickjacking) |
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limits info leaked via `Referer` |
| `Permissions-Policy` | Denies camera, microphone, geolocation by default |
| `Strict-Transport-Security` | Enforced in the frontend's production build |

The frontend's CSP is environment-aware: `script-src` drops `'unsafe-eval'` entirely in production builds (the dev server needs it for Next.js's own HMR runtime), and `connect-src` is scoped to the app's own origin plus the configured API origin rather than left open.

## Frontend Security

- **No client-readable session token** — no `localStorage`, `sessionStorage`, or JS-readable cookie holds session state, so a successful XSS injection has no credential to steal. All authenticated requests go through a shared `fetchWithAuth` helper that sends the `httpOnly` cookie via `credentials: "include"`.
- **Two-layer route access:**
  - A client-side guard (`RequireRoles`) wraps every admin/organizer/volunteer page, redirecting an unauthenticated user to login and a wrong-role user back to their own dashboard before the page renders — a UX-layer control that prevents an unauthorized user from ever *seeing* a screen they shouldn't, but is not the security boundary, since client-side checks can be bypassed by anyone controlling their own browser.
  - The actual boundary is the backend's route authorization (above) — every admin/organizer-only API call is checked independently of what the frontend UI shows. Every admin-management page (`events`, event detail, shift management) is wrapped in `RequireRoles` scoped to `ORGANIZER`/`ADMIN`, not the more permissive "any authenticated user," closing a gap where an authenticated Volunteer could otherwise navigate directly to admin URLs.
- **No raw-HTML injection** — the codebase avoids `dangerouslySetInnerHTML` and similar patterns; all user-supplied content renders through React's default escaping.

## Known Limitations

- **Password-reset delivery** is a pluggable interface with a development-only console/log implementation; wiring a real transactional email provider is a drop-in extension, not a redesign.
- **Rate limiting is in-memory and per-instance** — a horizontally scaled deployment behind a load balancer would need a shared store (e.g. Redis) for the limiter to be effective across instances.
- **No JWT revocation list** — logout deletes the client-side cookie, but a stateless JWT remains cryptographically valid until its 8-hour expiry even if an attacker retained a copy before logout. A shared revocation store would close this; not implemented, given the added infrastructure for a relatively short exposure window.
- **No dedicated CSRF token** — `SameSite=Strict` plus origin-restricted CORS is the primary control instead; see Session Management above for the reasoning.
- **The demo/seed dataset** (`dev` profile only) uses published, non-secret credentials by design, and must never be enabled in a reachable deployment.

## Summary

| Layer | Control |
|---|---|
| Crypto | BCrypt password hashing with per-password salt; JWT secret sourced from environment, never committed; TLS terminated at the network edge |
| Session | `httpOnly` + `Secure` + `SameSite=Strict` JWT cookie; stateless re-validation including live disabled-account checks |
| AuthN | Timing-safe login, generic error messages, current-password check on password changes |
| AuthZ | Centralized route rules + method security + explicit per-resource ownership checks (BOLA prevention), verified by a red-team cross-tenant test |
| Input | Bean Validation on every request DTO, structured 400s, no leaked stack traces |
| Passwords | Length, complexity, and common-password checks enforced server-side |
| Abuse | Sliding-window rate limiting on auth endpoints (10 req / 60s / IP) |
| Injection | Parameterized queries only, React's default escaping, SSRF resolved-IP validation — each verified against a live attack attempt |
| Supply chain | SBOM generation, CVE triage by runtime reachability, automated secret-scanning in the pipeline |
| Logging | Structured, security-events-separated logging shipped to a queryable aggregation stack |
| Config | Fail-closed secrets, profile-gated dev conveniences, single-source CORS config |
| Transport | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Frontend | No client-readable session token, layered route guards, no raw-HTML injection |
