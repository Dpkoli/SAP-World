# SAP World

SAP World is an enterprise simulation and tutoring platform for learning SAP
S/4HANA through realistic, connected business operations.

## Current MVP

The first release demonstrates a brewery enterprise with:

- An operational dashboard and enterprise KPIs
- A ten-industry enterprise catalogue with saved learner roadmap preference
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
- An authenticated SAP mentor grounded in process, exception, enterprise, and
  historical simulation evidence
- A role-based learning centre across MM, SD, PP, FI, QM, PM, HCM, EWM, and TM
- Learner registration and sign-in with hashed passwords and secure sessions
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

Implementation-consultant blueprints can be queried by process:

`/api/implementation?id=p2p`

Historical events can be queried by fiscal year, severity, and category:

`/api/simulation/events?year=2025–2026&severity=Critical&category=Quality`

Process flows and tutor content can be queried by process (`p2p`, `o2c`,
`ptp`, `r2r`, `qm`, `pm`, `h2r`, or `w2d`):

`/api/simulation/processes?id=o2c`

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
invent facts when the local data cannot support a precise response.
The current implementation uses deterministic local retrieval, so it requires
no external AI key; a production model can later consume the same grounded
response contract.

Authenticated learner progress can be loaded or updated through:

`/api/learning/progress`

During local development, accounts and sessions are stored in the ignored
`.data/accounts.json` file, while server progress is stored in
`.data/learning-progress.json` and workflow decisions are stored in
`.data/workflow-decisions.json`. Governance decisions are stored in
`.data/governance-decisions.json`, and advanced transaction evidence is stored
in `.data/advanced-transaction-progress.json`. Passwords use salted `scrypt`
hashes and browser sessions use opaque, HTTP-only cookies. The browser keeps a
learner-specific progress backup so lessons remain usable if the progress
service is unavailable.

The local repository adapters are intentionally isolated. Production
deployment will replace them with a managed identity provider and PostgreSQL
because serverless filesystems are not durable.

Production cookies are secure by default. For HTTP-only local production
testing, set `SAP_WORLD_INSECURE_COOKIES=true`; never use this override on a
hosted environment.

Learner readiness is calculated from demonstrated performance rather than a
static catalogue value: guided transaction progress contributes 60%, and a
successfully diagnosed troubleshooting case contributes the remaining 40%.

## Quality checks

```bash
npm run lint
npm run build
```

## Product direction

Planned phases include:

1. Persistent PostgreSQL enterprise, document, and learning models
2. Managed identity integration and role-based authorization
3. Configurable industry templates with generated enterprise data
4. External AI model integration using the grounded mentor contract
5. Deployment, observability, and controlled content administration

The source product vision is retained in `Prompt_v2.txt`.
