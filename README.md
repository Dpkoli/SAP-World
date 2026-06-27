# SAP World

SAP World is an enterprise simulation and tutoring platform for learning SAP
S/4HANA through realistic, connected business operations.

## Configuration

The repository includes `.env.example` as a safe list of supported settings.
For local development, copy it to `.env.local`, replace the admin email with
the account you will use, and keep optional database and model settings empty
until they are needed:

```powershell
Copy-Item .env.example .env.local
```

Real `.env` files remain excluded from Git, so passwords, API keys, and database
connection strings are not published. The app uses local JSON storage and its
grounded built-in mentor when the optional hosted settings are empty. See
`docs/deployment.md` for production setup.

## Current MVP

The first release demonstrates a brewery enterprise with:

- An operational dashboard and enterprise KPIs
- A ten-industry enterprise catalogue with saved learner roadmap preference
- Detailed implementation blueprints for all ten industries covering value
  chains, lifecycles, organization, master data, KPIs, compliance, reporting,
  dependencies, operational failures, and seasonality
- A deterministic Simulation Studio that converts industry, fiscal-year,
  curated event, and volume-profile templates into account-backed SAP scenario
  packages
- Stable scenario signatures, three-year chronology, organizational and
  master-data dependencies, six-document flows, tutor steps, controls, and
  operational, inventory, and financial impacts
- A deterministic three-year enterprise ledger for every generated simulation,
  scaling from 144 to 720 chronological SAP documents across connected process
  chains based on the selected volume profile
- A normalized ledger analytics projection across saved generated simulations,
  including year, process, module, industry, journal, exception, and link
  integrity summaries
- A persisted ledger analytics read model keyed by learner and admin scope,
  refreshed when saved simulation fingerprints change
- Persisted generated ledger records keyed by simulation signature, so scaled
  operational histories are reused by ledger APIs and analytics
- Complete P2P, O2C, Plan-to-Produce, Record-to-Report,
  Warehouse-to-Dispatch, Quality, Maintenance, and Hire-to-Retire coverage
- Upstream/downstream document references, quantities, statuses, inventory
  effects, journal evidence, resolved exceptions, and relational integrity checks
- Event-sourced scenario execution with ordered commands, optimistic version
  checks, immutable learner evidence, derived process state, and replayable audit logs
- A connected Procure-to-Pay document flow
- Inventory, accounting, and operational impact explanations
- A guided SAP goods-receipt lesson using realistic business data
- A guided SAP customer-sales-order lesson spanning SD, EWM, PP, and FI
- A guided SAP MRP and production-order lesson spanning PP, MM, EWM, CO, and FI
- A guided month-end close lesson spanning FI-GL, AP, AR, CO, PP, and reporting
- A guided incoming-inspection lesson spanning QM, MM, supplier quality, and stock disposition
- A guided emergency-maintenance lesson spanning PM, MM, CO, safety, and reliability feedback
- A guided employee-onboarding lesson spanning HCM, SuccessFactors, payroll, FI, and CO
- A guided warehouse-dispatch lesson spanning EWM, TM, SD, MM, and FI
- Interactive troubleshooting labs for P2P, O2C, production, close, quality,
  maintenance, payroll, and warehouse-dispatch failures
- Implementation blueprints covering organizational structure, master data,
  configuration, integration, testing, and go-live controls
- Account-backed diagnostic attempts, exception completion, XP, and dynamic
  process-readiness scoring
- Step-by-step explanations of why each action is performed
- Structured transaction playbooks for every guided process, covering
  prerequisites, SAP entry points, key fields, validation checks, document
  chains, completion evidence, and common processing mistakes
- A guided transaction impact trail that teaches each step's upstream
  dependency, SAP integration impact, downstream process effect, and expected
  evidence
- A step-level SAP processing guide that shows the prerequisite, SAP app or
  transaction, validation check, and proof to keep for the active tutor step
- An evidence quality coach for guided tutor notes, checking document proof,
  key field proof, integration impact, and audit-level detail while learners
  practice
- An authenticated SAP mentor grounded in process, exception, enterprise, and
  historical simulation evidence
- A role-based learning centre across MM, SD, PP, FI, QM, PM, HCM, EWM, and TM
- Learner registration and sign-in with hashed passwords and secure sessions
- Role-based authorization with learner and admin roles, admin-only operations
  APIs, and environment-seeded platform administrators
- Admin-only controlled content register covering release readiness, owners,
  versions, evidence gates, blockers, and content-domain status
- Filterable Admin Control Plane content inspector with domain ownership,
  versions, gate evidence, record coverage, and release notes
- Admin-only production readiness gate combining storage, security, content,
  ledger integrity, mentor provider, and deployment configuration checks
- Actionable admin readiness checklist showing the evidence and corrective
  action for every production gate
- Persistent owner release decisions tied to the exact readiness snapshot,
  including warning acceptance, rejection, sign-off notes, and approval history
- Admin development roadmap with weighted milestones, completion evidence,
  current focus, and next priorities kept separate from deployment approval
- Admin-only observability stream for compact server-side events across mentor,
  simulations, guided tutor progress, workflow, governance, advanced
  transactions, and admin checks
- Admin certification review metrics covering evidence-ready exports, scenario
  certifications, evidence coverage, open evidence gaps, and process queues
- Durable PostgreSQL persistence for accounts, sessions, progress, workflow
  decisions, governance, transaction evidence, generated simulations, and events
- Automatic local JSON-to-PostgreSQL aggregate migration with transaction
  locks and revisions that prevent lost concurrent serverless writes
- A live storage health endpoint at `/api/health`
- Server-backed lesson progress with an automatic browser fallback
- An assessed knowledge check with corrective feedback
- Searchable company structure, plants, storage locations, suppliers, and customers
- Relational material master data with valuation, MRP, sourcing, batch, quality,
  BOM, routing, production-version, and work-centre dependencies
- An account-backed master-data governance workbench for material, supplier,
  customer, BOM, pricing, and employee change requests
- Field-level record versions, validation gates, dependency impact analysis,
  sequential stewardship approvals, and change audit trails
- Searchable employee and organizational-assignment records
- Operational plant capacity, utilization, staffing, and order context
- Business-partner exposure, risk, blocking status, and category filters
- A normalized read-only enterprise API at `/api/enterprise`
- A filterable master-data API at `/api/master-data`
- Three fiscal years of connected growth, procurement, production, quality,
  maintenance, finance, sales, and compliance events
- Historical SAP document chains with operational, inventory, and financial impact
- A three-year enterprise performance cockpit with quarterly revenue, margin,
  service, inventory, downtime, waste, working-capital, and profitability drivers
- Explainable KPI movements connected to SAP documents, modules, historical
  events, and recommended management actions
- A normalized document-flow explorer with upstream/downstream links, workflow,
  approvals, inventory movements, and journal-entry evidence
- An account-backed approval inbox with multi-step routing, evidence review,
  simulated approve/reject/request-information decisions, and audit trails
- Account-backed advanced transaction labs for stock transfers, customer
  returns, asset acquisition and depreciation, VAT adjustments, and year-end close
- Step-level SAP app and transaction guidance with inventory, accounting,
  document, control-check, and learner-evidence explanations
- A filterable simulation-history API at `/api/simulation/events`
- A filterable cross-module document API at `/api/simulation/documents`
- Reusable definitions for all eight processes at `/api/simulation/processes`
- Authenticated SAP transaction playbooks at `/api/tutor/playbooks`
- Authenticated tutor readiness reviews at `/api/tutor/readiness`
- Authenticated capstone assessment plans and evidence submissions at
  `/api/tutor/capstone`
- Authenticated learner evidence portfolios at `/api/tutor/portfolio`
- Authenticated learner certification evidence exports at
  `/api/tutor/certification`
- Authenticated generated-ledger analytics at `/api/ledger/analytics`
- Responsive desktop and mobile layouts

The simulation follows a real business chain:

`Purchase requisition -> Purchase order -> Goods receipt -> Quality inspection -> Invoice verification -> Vendor payment`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The current enterprise snapshot is available at
[http://localhost:3000/api/enterprise](http://localhost:3000/api/enterprise).

The multi-industry catalogue and rollout status are available at:

`/api/industries`

Industry blueprints can be filtered by industry or SAP capability:

`/api/industries?id=pharmaceutical`

`/api/industries?module=TM`

Authenticated learners can generate and retrieve deterministic scenario
packages through:

`GET /api/simulation-studio`

`POST /api/simulation-studio`

The same industry, fiscal year, curated event, and volume profile always
produce the same scenario signature and business content. Repeated generation
returns the learner's existing saved package rather than creating a duplicate.
Representative packages create one connected run per process and year, growth
packages create three, and enterprise-scale packages create five.

Each generated scenario exposes an authenticated execution endpoint:

`GET /api/simulation-studio/{simulationId}/execution`

`POST /api/simulation-studio/{simulationId}/execution`

Execution commands must match the current step and aggregate version. Accepted
commands append immutable events; operational, inventory, financial, document,
and completion status are rebuilt by replaying that event stream.

Every generated scenario also exposes its deterministic enterprise history:

`GET /api/simulation-studio/{simulationId}/ledger`

The ledger can be filtered by fiscal year and end-to-end process:

`GET /api/simulation-studio/{simulationId}/ledger?year=2024-2025&process=Plan-to-Produce`

Each ledger contains three fiscal years, eight process chains per year, and six
documents per chain at representative scale, with additional deterministic runs
for growth and enterprise-scale profiles. The response reports broken links and
orphan records so relational integrity is visible rather than assumed. Ledger
history is derived from the immutable scenario signature, persisted on first
read, and reused by analytics while the simulation fingerprint is unchanged.

Authenticated learners can query a normalized analytics projection across their
saved generated ledgers:

`GET /api/ledger/analytics`

`GET /api/ledger/analytics?process=Order-to-Cash`

The projection summarizes ledger documents by fiscal year, process, SAP module,
and industry, and reports broken document links, orphan chains, journal-bearing
documents, and exception counts.

Implementation-consultant blueprints can be queried by process:

`/api/implementation?id=p2p`

Historical events can be queried by fiscal year, severity, and category:

`/api/simulation/events?year=2025–2026&severity=Critical&category=Quality`

Process flows and tutor content can be queried by process (`p2p`, `o2c`,
`ptp`, `r2r`, `qm`, `pm`, `h2r`, or `w2d`):

`/api/simulation/processes?id=o2c`

Authenticated transaction playbooks can be queried for all guided scenarios or
for a single process. These responses are designed for the tutor layer and
include the SAP app or transaction code, prerequisites, step-level validations,
document chain, completion evidence, and common mistakes:

`/api/tutor/playbooks`

`/api/tutor/playbooks?scenarioId=p2p`

Learners can retrieve a progress-grounded SAP tutor readiness review:

`/api/tutor/readiness`

The review combines guided transaction completion, troubleshooting diagnostics,
weak areas, completion evidence, and recommended next practice actions for all
eight core processes.

Guided tutor steps also let learners capture short SAP evidence notes. These
notes are saved with `/api/learning/progress`, counted in the learner
portfolio, and included in mentor portfolio context without exposing raw
capstone response text. The guided tutor also shows a transaction impact trail
for the active step, connecting upstream prerequisites, SAP module impact,
downstream process dependency, and the evidence the learner should capture.
Meaningful guided progress saves emit compact observability events with process,
step, completion, and note counts only. The tutor also scores the active note
against practical evidence-quality checks so learners learn how to document SAP
work in a review-ready way before capstone submission. Admin operations report
aggregate guided evidence-note counts, reached-step coverage, and open evidence
gaps without exposing the note text.

Learners can also retrieve and submit capstone assessment evidence:

`/api/tutor/capstone`

The capstone response uses saved progress to lock, open, or mark process
challenges as ready for review. Each challenge includes the business prompt,
required SAP evidence, guided evidence coverage, assessment tasks, scoring
rubric, and remediation steps.
Learner submissions are scored against the rubric, retained in a portfolio
trail, and returned with feedback for improvement.

Learners can retrieve a consolidated evidence transcript:

`/api/tutor/portfolio`

Learners can also generate a certification-style evidence export:

`/api/tutor/certification`

The portfolio combines readiness, guided lessons, guided step notes,
diagnostics, capstone submissions, badges, process evidence, and next best
actions into one learner-scoped view. The certification export adds a stable
certificate id, evidence status, process evidence summary, badges, and
verification notes while excluding raw learner notes and capstone response
text. It also identifies missing guided evidence steps so learners can jump
back to the exact SAP step that needs proof.
The dashboard mission uses the same gaps to prioritize evidence capture before
capstone submission.

Connected SAP documents can be queried by process, document number, or module:

`/api/simulation/documents?process=p2p`

`/api/simulation/documents?document=5000042917`

`/api/simulation/documents?module=FI`

Material master data can be queried by material, plant, or SAP material type:

`/api/master-data?material=FG-AMBER-KEG-50`

`/api/master-data?plant=BR01&type=ROH`

Enterprise performance can be queried across all periods or by fiscal year:

`/api/analytics`

`/api/analytics?year=2025%E2%80%932026`

Authenticated approval cases can be read and filtered through `/api/workflows`.
Learner decisions are submitted to the same endpoint and advance multi-step
routes one approver at a time.

Authenticated master-data change requests can be reviewed and filtered through
`/api/governance`. Learners can submit drafts, approve valid stages, reject
changes, or return them for correction.

Authenticated advanced transaction labs can be read and progressed through:

`/api/advanced-transactions`

`/api/advanced-transactions?type=Stock%20Transfer`

Each completed step requires a learner evidence note and is enforced in
sequence.

Authenticated mentor questions are handled through `POST /api/mentor`. Answers
include the simulation records used as evidence, and the service does not
invent facts when the local data cannot support a precise response. The mentor
also reads the authenticated learner's compact evidence portfolio, so questions
about readiness, next practice actions, weak areas, scores, or capstones are
grounded in saved progress and missing guided evidence steps without exposing
raw note or capstone response text. By
default, the mentor uses deterministic local retrieval. When
`SAP_WORLD_AI_ENDPOINT`, `SAP_WORLD_AI_API_KEY`, and `SAP_WORLD_AI_MODEL` are
configured, the route sends the grounded local answer and evidence list to an
external chat-completion provider for learner-friendly explanation. The external
model is never treated as the source of truth; failures fall back to the local
answer.

Admin operations are available only to users whose normalized email appears in
`SAP_WORLD_ADMIN_EMAILS`:

`GET /api/admin/operations`

The endpoint returns safe platform counts, storage status, role distribution,
content coverage, generated-ledger analytics, capstone submission aggregates,
certification review metrics, mentor provider status, and recent account
metadata. It never returns password hashes, salts, session tokens, raw learner
notes, or raw capstone response text.
The admin Control Plane also shows AI mentor model readiness, including whether
the external endpoint, API key, and model name are configured, while keeping
secret values out of the response.

The full controlled content register is available to admins at:

`GET /api/admin/content-control`

It scores SAP World content domains against release gates such as owner,
version, coverage, evidence, validation tests, common mistakes, and go-live
controls.

Production readiness can be checked through:

`GET /api/admin/readiness`

The readiness gate reports pass, warning, and fail checks across durable
storage, admin allow-list, cookie security, controlled content release, ledger
integrity, and mentor-provider configuration.

Operational telemetry is available to admins at:

`GET /api/admin/observability`

It returns retained event counts, recent 24-hour activity, event status totals,
event type totals, and the latest compact events. The stream avoids learner
notes, passwords, session tokens, and raw mentor prompts.

Authenticated learner progress can be loaded or updated through:

`/api/learning/progress`

During local development, accounts and sessions are stored in the ignored
`.data/accounts.json` file, while server progress is stored in
`.data/learning-progress.json` and workflow decisions are stored in
`.data/workflow-decisions.json`. Governance decisions are stored in
`.data/governance-decisions.json`, and advanced transaction evidence is stored
in `.data/advanced-transaction-progress.json`. Generated industry simulations
are stored in `.data/generated-simulations.json`. Simulation execution events
are stored separately in
`.data/simulation-executions.json`, preserving generated templates as immutable
inputs. Tutor capstone submissions are stored in
`.data/tutor-capstone-submissions.json`, and operational telemetry is stored in
`.data/observability-events.json`. Administrator release decisions are stored
in `.data/release-governance.json`.
Passwords use salted `scrypt`
hashes and browser sessions use opaque, HTTP-only cookies. The browser keeps a
learner-specific progress backup so lessons remain usable if the progress
service is unavailable.

When `DATABASE_URL` is configured, all mutable repositories use PostgreSQL
instead of the local files. The schema is created lazily, existing local
aggregates are imported into an empty database once, and transactional updates
protect concurrent serverless writes. See `docs/deployment.md`.

Production cookies are secure by default. For HTTP-only local production
testing, set `SAP_WORLD_INSECURE_COOKIES=true`; never use this override on a
hosted environment.

To seed platform administrators, configure a comma-separated list:

`SAP_WORLD_ADMIN_EMAILS=admin@example.com,owner@example.com`

For local development, create or sign in with an account whose email appears in
that list. The left navigation then shows the Admin Control Plane, where owners
can review storage mode, build readiness, learner activity, generated
simulations, content release coverage, capstone aggregates, and observability.

Learner readiness is calculated from demonstrated performance rather than a
static catalogue value: guided transaction progress contributes 50%,
successfully diagnosed troubleshooting contributes 30%, and guided evidence
coverage contributes 20%.

## Quality checks

```bash
npm run lint
npm run build
```

GitHub Actions runs the same lint and build checks on pushes and pull requests,
plus a high-severity production dependency audit.

## Product direction

Planned phases include:

1. Promote persisted ledger analytics snapshots into dedicated PostgreSQL
   read-model tables for high-volume analytical workloads
2. Managed identity integration and role-based authorization
3. Promote persisted generated ledgers from durable aggregates to dedicated
   high-volume operational tables
4. External observability integrations and managed release promotion

The source product vision is retained in `Prompt_v2.txt`.
