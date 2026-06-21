# Production deployment

SAP World supports two persistence modes:

- Local development uses ignored JSON files in `.data/`.
- Hosted environments use PostgreSQL when `DATABASE_URL` is configured.

## PostgreSQL

Provision a Neon PostgreSQL database through the Vercel Marketplace or provide
another PostgreSQL-compatible connection string:

```text
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

The application uses the standard PostgreSQL driver, so Neon and other managed
PostgreSQL services are supported. It lazily creates the schema in
`database/schema.sql`. It does not open a database connection during
`next build`, so initial deployments remain build-safe before environment
provisioning is complete.

When PostgreSQL is enabled and a state aggregate does not yet exist, SAP World
checks for its matching local `.data` file and imports that content once. Later
writes use transaction-scoped advisory locks, row locks, and revision increments
to prevent lost updates across concurrent serverless instances.

The persisted aggregates are:

- `auth`
- `learning-progress`
- `workflow-decisions`
- `governance-decisions`
- `advanced-transaction-progress`
- `generated-simulations`
- `simulation-executions`
- `tutor-capstone-submissions`
- `observability-events`

Generated ledger analytics are currently projected from these saved simulation
aggregates at request time. The projection is exposed to learners through
`GET /api/ledger/analytics` and to admins through `GET /api/admin/operations`;
it reports document volume, process-chain coverage, journal-bearing documents,
exceptions, and link-integrity checks without storing a second mutable copy.

## Health check

`GET /api/health` reports the active storage backend and AI mentor provider
mode. PostgreSQL mode performs a live query and returns HTTP `503` when the
database cannot be reached.

## Admin access

Admin access is granted by email allow-list. Configure:

```text
SAP_WORLD_ADMIN_EMAILS=admin@example.com,owner@example.com
```

Any matching registered account receives the `admin` role at session read time,
so adding an email to the environment can elevate an existing account without a
database migration. Admin-only operations are exposed at:

```text
GET /api/admin/operations
```

This endpoint is protected inside the route handler and returns HTTP `403` for
authenticated learners without the admin role. It also reports mentor-provider
configuration status and normalized ledger analytics without exposing the
endpoint URL or API key. Capstone evidence is exposed only as aggregate counts,
status totals, process averages, and latest submission date; raw learner
response text remains scoped to the learner portfolio endpoint.

Admins can inspect the full content release register through:

```text
GET /api/admin/content-control
```

The register scores each SAP World content domain against controlled release
gates such as owner, version, coverage, validation evidence, go-live controls,
common mistakes, and blockers.

Admins can also run the production readiness gate:

```text
GET /api/admin/readiness
```

The readiness response combines deployment checks for durable storage, admin
allow-list, cookie security, content release, ledger integrity, and mentor
provider configuration. A `Blocked` status should stop deployment until failed
checks are resolved. `Ready with warnings` can be released only when the owner
has accepted the documented warnings.

Admins can inspect compact server-side telemetry through:

```text
GET /api/admin/observability
```

Telemetry events are capped to the latest 1,000 retained records and are stored
without learner notes, passwords, session tokens, or raw mentor prompts. Use
this endpoint for release smoke checks, support triage, and operational trend
inspection.

Learner tutor readiness reviews are exposed through:

```text
GET /api/tutor/readiness
GET /api/tutor/capstone
GET /api/tutor/portfolio
```

The readiness response is generated from saved learner progress and returns
guided completion, diagnostic completion, weak areas, evidence, and recommended
next actions across all eight core SAP processes. The capstone response uses
the same saved progress to expose locked, open, and review-ready assessment
challenges with required SAP evidence and scoring rubrics. `POST
/api/tutor/capstone` stores a learner evidence response, scores it against the
rubric, and returns the updated portfolio trail. The portfolio endpoint combines
readiness, capstone outcomes, badges, process evidence, and next best actions
for the authenticated learner.

## Optional AI mentor provider

The SAP Mentor works without an external model by using deterministic local
retrieval. Hosted environments can optionally configure an external
chat-completion provider:

```text
SAP_WORLD_AI_ENDPOINT=https://api.example.com/v1/chat/completions
SAP_WORLD_AI_API_KEY=...
SAP_WORLD_AI_MODEL=mentor-model-name
SAP_WORLD_AI_TIMEOUT_MS=8000
```

The application first builds a grounded local answer from SAP World simulation
evidence, then sends only that answer and the source list to the configured
provider for clearer learner-facing wording. If the provider is missing,
returns an error, times out, or sends an empty answer, the route returns the
local grounded answer instead.

## Vercel

1. Import the GitHub repository into Vercel.
2. Add a Neon integration from the Vercel Marketplace.
3. Confirm that `DATABASE_URL` is available to Production and Preview.
4. Add `SAP_WORLD_ADMIN_EMAILS` for the platform owner accounts.
5. Optionally add `SAP_WORLD_AI_ENDPOINT`, `SAP_WORLD_AI_API_KEY`, and
   `SAP_WORLD_AI_MODEL` for enhanced mentor wording.
6. Deploy the `codex/mvp-foundation` branch or merge it into the production
   branch.
7. Verify `/api/health` returns `status: "ok"` and
   `storage.backend: "postgresql"`.
8. Sign in with an admin email and verify `/api/admin/operations` returns
   platform counts.
9. Verify `/api/admin/content-control` returns the content release register.
10. Verify `/api/admin/readiness` returns `Ready` or an accepted
    `Ready with warnings` status before go-live.
11. Verify `/api/admin/observability` returns retained event counts after a
    mentor question or simulation action.

Secure cookies are enabled automatically in production. Do not configure
`SAP_WORLD_INSECURE_COOKIES` on a hosted deployment.

## GitHub verification

The repository includes a GitHub Actions workflow at
`.github/workflows/ci.yml`. It runs on pushes and pull requests for `main`,
`master`, and `codex/mvp-foundation`.

The workflow installs dependencies with `npm ci`, runs `npm run lint`, builds
the Next.js app with `npm run build`, and blocks high-severity production
dependency vulnerabilities through `npm audit --omit=dev --audit-level=high`.
Treat a failed workflow as a release blocker before merging or deploying.
