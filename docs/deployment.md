# Production deployment

SAP World supports two persistence modes:

- Local development uses ignored JSON files in `.data/`.
- Hosted environments use PostgreSQL when `DATABASE_URL` is configured.

## Environment setup

`.env.example` is the authoritative list of settings supported by the
application. It contains placeholders only and is safe to keep in Git.

For local development:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` with the one-time bootstrap administrator email you will
register. Leave
`DATABASE_URL` and the `SAP_WORLD_AI_*` values empty to use local JSON storage
and the built-in grounded mentor. `.env.local` is ignored by Git and must hold
all real secrets.

For hosted environments, add the required values through the hosting
platform's environment-variable controls. Do not upload or commit a populated
`.env.local` file.

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

After provisioning the database, apply the idempotent schema explicitly:

```powershell
npm run db:migrate
```

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
- `simulation-ledgers`
- `simulation-executions`
- `tutor-capstone-submissions`
- `certification-reviews`
- `release-governance`
- `release-operations`
- `observability-events`
- `mentor-conversations`
- `ledger-analytics-read-model`

Generated ledger analytics are stored in dedicated
`sap_world_ledger_analytics_snapshots` rows keyed by learner and admin scope.
Normalized documents are written to `sap_world_ledger_documents`, while full
simulation ledgers and summaries are retained in `sap_world_simulation_ledgers`.
The read model fingerprints saved simulations,
reuses the stored snapshot while the source simulations are unchanged, and
refreshes automatically when new simulation signatures are saved. The snapshot
is exposed to learners through `GET /api/ledger/analytics` and to admins
through `GET /api/admin/operations`; it reports document volume, process-chain
coverage, journal-bearing documents, exceptions, and link-integrity checks.
Simulation Studio supports representative, growth, and enterprise volume
profiles; larger profiles generate more deterministic process chains per fiscal
year, so hosted environments should use PostgreSQL before broad learner rollout.
The generated enterprise ledger is persisted by simulation signature the first
time a learner or admin reads it, then reused by analytics while the simulation
fingerprint is unchanged.

## Health check

`GET /api/health` reports the active storage backend and AI mentor provider
mode. PostgreSQL mode performs a live query and returns HTTP `503` when the
database cannot be reached.

## Managed identity and admin access

Bootstrap the first platform owner with:

```text
SAP_WORLD_BOOTSTRAP_ADMIN_EMAILS=admin@example.com,owner@example.com
```

The first matching registration persists the `admin` role in the auth aggregate.
After bootstrap, environment changes cannot elevate accounts. Administrators
assign organisation roles, suspend/reactivate accounts, and inspect the audit
trail through:

```text
GET /api/admin/identity
PATCH /api/admin/identity
```

The legacy `SAP_WORLD_ADMIN_EMAILS` value is read once only to migrate older
installations that have no persisted administrator. Admin-only operations are
exposed at:

```text
GET /api/admin/operations
```

This endpoint is protected inside the route handler and returns HTTP `403` for
authenticated learners without the admin role. It also reports mentor-provider
configuration status and normalized ledger analytics without exposing the
endpoint URL or API key. Capstone evidence is exposed only as aggregate counts,
status totals, process averages, and latest submission date; raw learner
response text remains scoped to the learner portfolio endpoint. Certification
review is also exposed only as aggregate evidence-ready counts, scenario
certification counts, process queues, evidence coverage, and open evidence
gaps. Guided tutor evidence notes are exposed only as aggregate
learning-progress counts, reached-step coverage, open evidence gaps, and
averages.

Password recovery is available through
`POST /api/auth/password-recovery/request` and
`POST /api/auth/password-recovery/reset`. Tokens are random, stored only as a
SHA-256 digest, expire after 30 minutes, are single use, and revoke every active
session after completion. In hosted environments configure
`SAP_WORLD_PASSWORD_RESET_WEBHOOK_URL` to deliver the generated reset URL; add
`SAP_WORLD_PASSWORD_RESET_WEBHOOK_SECRET` when the receiver requires a bearer
token. Responses never reveal whether an account exists.

### Enterprise SSO adapter

SAP World keeps authorization and opaque database sessions behind a
provider-neutral identity boundary. Set `SAP_WORLD_IDENTITY_MODE` to `oidc` or
`saml` and complete the matching settings:

```text
SAP_WORLD_IDENTITY_PROVIDER=organisation-provider-name
SAP_WORLD_IDENTITY_ALLOWED_DOMAINS=example.com
SAP_WORLD_OIDC_ISSUER=
SAP_WORLD_OIDC_CLIENT_ID=
SAP_WORLD_OIDC_CLIENT_SECRET=
SAP_WORLD_SAML_METADATA_URL=
SAP_WORLD_SAML_ENTITY_ID=
SAP_WORLD_SAML_CERTIFICATE=
```

The production adapter starts at `/api/auth/sso/start` and returns to
`/api/auth/sso/callback`. It must validate signed provider assertions, map the
immutable issuer/subject pair to a durable account, accept only approved
domains and `sap_world_roles` claims, then create the existing SAP World opaque
session. Secrets and assertion payloads must stay server-side. The current
repository exposes and audits this contract but intentionally leaves the live
provider exchange for deployment-specific credentials and metadata.

Certification exports are registered as durable learner submissions. Admins
can inspect submissions and record approval, rejection, or revision requests
through:

```text
GET /api/admin/certification-decisions
POST /api/admin/certification-decisions
```

The route is admin protected. Decisions are stored against a stable certificate
and process evidence fingerprint with assessor identity, timestamp, and an
optional note. The complete history remains available after server restarts and
uses PostgreSQL automatically when `DATABASE_URL` is configured.

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

The readiness response combines deployment checks for durable storage, managed
administrators, enterprise identity provider configuration, cookie security,
content release, ledger integrity, and mentor provider configuration. A
`Blocked` status should stop deployment until failed
checks are resolved. `Ready with warnings` can be released only when the owner
has accepted the documented warnings.

Release owners can persist an approval, warning acceptance, or rejection
against the exact current readiness snapshot through:

```text
GET /api/admin/release-decisions
POST /api/admin/release-decisions
```

Each decision stores the owner, timestamp, note, readiness summary, and a
fingerprint of the gate evidence. A later configuration or readiness change
produces a new fingerprint, so an older sign-off cannot approve a changed
release state.

Promotion and rollback requests are protected through:

```text
GET /api/admin/release-operations
POST /api/admin/release-operations
```

Promotion requires a non-rejected decision for the current readiness
fingerprint. Configure `SAP_WORLD_RELEASE_AUTOMATION_URL` and
`SAP_WORLD_RELEASE_AUTOMATION_SECRET` to dispatch requests to a deployment
controller; without them, requests remain audited as manual actions.

Admins can inspect compact server-side telemetry through:

```text
GET /api/admin/observability
```

Telemetry events are capped to the latest 1,000 retained records and are stored
without learner notes, passwords, session tokens, or raw mentor prompts. Guided
tutor progress events include only process code, active step, completion state,
and evidence-note counts. Use this endpoint for release smoke checks, support
triage, and operational trend inspection.
Vercel Web Analytics and Speed Insights are mounted in the root layout, and all
server events emit structured runtime logs. An optional authenticated event
sink can be configured with `SAP_WORLD_OBSERVABILITY_WEBHOOK_URL` and
`SAP_WORLD_OBSERVABILITY_WEBHOOK_SECRET`.

Mentor conversations are handled through:

```text
GET /api/mentor
POST /api/mentor
PATCH /api/mentor
```

The route builds a compact learner evidence snapshot from saved progress,
readiness, and capstone summaries before calling the mentor service. This lets
the tutor answer questions about next practice actions, readiness, weak areas,
missing guided evidence steps, and capstone scores while keeping raw note text
and capstone response text out of the mentor prompt and telemetry.
Questions and answers are retained per learner/process with evidence sources,
provider/fallback metadata, sensitive-content redaction, grounding checks, and
helpful/needs-review feedback. A maximum of 50 exchanges is retained per
conversation.

Learner tutor readiness reviews are exposed through:

```text
GET /api/tutor/readiness
GET /api/tutor/capstone
GET /api/tutor/portfolio
GET /api/tutor/certification
```

The readiness response is generated from saved learner progress and returns
guided completion, diagnostic completion, evidence coverage, weak areas,
evidence, and recommended next actions across all eight core SAP processes.
Guided step evidence notes are stored inside `/api/learning/progress`, count for
20% of process readiness, and are counted in the learner portfolio. The
guided tutor UI pairs those notes with an impact trail for the active SAP step,
showing upstream dependency, integration impact, downstream process effect, and
expected evidence without adding another persistence aggregate. The
capstone response uses the same saved progress to expose locked, open, and
review-ready assessment challenges with required SAP evidence, guided evidence
coverage, note counts, and scoring rubrics. `POST /api/tutor/capstone` stores a
learner evidence response, scores it against the rubric, and returns the updated
portfolio trail. The portfolio
endpoint combines readiness, guided step notes, capstone outcomes, badges,
process evidence, missing guided evidence steps, and next best actions for the
authenticated learner.
The certification endpoint returns a learner-scoped evidence export with a
stable certificate id, readiness status, process evidence summary, badges, and
verification notes. It excludes raw guided notes and raw capstone response text.

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
4. Run `npm run db:migrate` against the production connection.
5. Add `SAP_WORLD_BOOTSTRAP_ADMIN_EMAILS` for the first platform owner.
6. Optionally add `SAP_WORLD_AI_ENDPOINT`, `SAP_WORLD_AI_API_KEY`, and
   `SAP_WORLD_AI_MODEL` for enhanced mentor wording.
7. Configure release automation and observability webhook values when external
   controllers or event sinks are available.
8. Deploy the `codex/mvp-foundation` branch or merge it into the production
   branch.
9. Verify `/api/health` returns `status: "ok"` and
   `storage.backend: "postgresql"`.
10. Sign in with the bootstrapped admin and verify `/api/admin/identity` returns
   the managed account registry and audit history.
11. Verify `/api/admin/operations` returns
   platform counts.
12. Verify `/api/admin/content-control` returns the content release register.
13. Verify `/api/admin/readiness` returns `Ready` or an accepted
    `Ready with warnings` status before go-live.
14. Verify `/api/admin/observability` returns retained event counts after a
    mentor question or simulation action.
15. Validate promotion from a smoke-tested preview and retain a rollback target.

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
