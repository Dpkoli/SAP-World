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

## Health check

`GET /api/health` reports the active storage backend. PostgreSQL mode performs a
live query and returns HTTP `503` when the database cannot be reached.

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
authenticated learners without the admin role.

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

Secure cookies are enabled automatically in production. Do not configure
`SAP_WORLD_INSECURE_COOKIES` on a hosted deployment.
