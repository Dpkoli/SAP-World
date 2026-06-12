# SAP World

SAP World is an enterprise simulation and tutoring platform for learning SAP
S/4HANA through realistic, connected business operations.

## Current MVP

The first release demonstrates a brewery enterprise with:

- An operational dashboard and enterprise KPIs
- A connected Procure-to-Pay document flow
- Inventory, accounting, and operational impact explanations
- A guided SAP goods-receipt lesson using realistic business data
- A guided SAP customer-sales-order lesson spanning SD, EWM, PP, and FI
- A guided SAP MRP and production-order lesson spanning PP, MM, EWM, CO, and FI
- A guided month-end close lesson spanning FI-GL, AP, AR, CO, PP, and reporting
- A guided incoming-inspection lesson spanning QM, MM, supplier quality, and stock disposition
- A guided emergency-maintenance lesson spanning PM, MM, CO, safety, and reliability feedback
- A guided employee-onboarding lesson spanning HCM, SuccessFactors, payroll, FI, and CO
- Interactive troubleshooting labs for P2P, O2C, production, close, quality,
  maintenance, and payroll failures
- Step-by-step explanations of why each action is performed
- A context-aware SAP mentor prototype
- A role-based learning centre across MM, SD, PP, FI, QM, and EWM
- Learner registration and sign-in with hashed passwords and secure sessions
- Server-backed lesson progress with an automatic browser fallback
- An assessed knowledge check with corrective feedback
- Searchable company structure, plants, storage locations, suppliers, and customers
- Searchable employee and organizational-assignment records
- Operational plant capacity, utilization, staffing, and order context
- Business-partner exposure, risk, blocking status, and category filters
- A normalized read-only enterprise API at `/api/enterprise`
- Three fiscal years of connected growth, procurement, production, quality,
  maintenance, finance, sales, and compliance events
- Historical SAP document chains with operational, inventory, and financial impact
- A filterable simulation-history API at `/api/simulation/events`
- Reusable P2P and O2C process definitions at `/api/simulation/processes`
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

Historical events can be queried by fiscal year, severity, and category:

`/api/simulation/events?year=2025–2026&severity=Critical&category=Quality`

Process flows and tutor content can be queried by process (`p2p`, `o2c`,
`ptp`, `r2r`, `qm`, `pm`, or `h2r`):

`/api/simulation/processes?id=o2c`

Authenticated learner progress can be loaded or updated through:

`/api/learning/progress`

During local development, accounts and sessions are stored in the ignored
`.data/accounts.json` file, while server progress is stored in
`.data/learning-progress.json`. Passwords use salted `scrypt` hashes and
browser sessions use opaque, HTTP-only cookies. The browser keeps a
learner-specific progress backup so lessons remain usable if the progress
service is unavailable.

The local repository adapters are intentionally isolated. Production
deployment will replace them with a managed identity provider and PostgreSQL
because serverless filesystems are not durable.

Production cookies are secure by default. For HTTP-only local production
testing, set `SAP_WORLD_INSECURE_COOKIES=true`; never use this override on a
hosted environment.

## Quality checks

```bash
npm run lint
npm run build
```

## Product direction

Planned phases include:

1. Persistent PostgreSQL enterprise, document, and learning models
2. Managed identity integration and role-based authorization
3. Additional Procure-to-Pay lessons and exception scenarios
4. Order-to-Cash, Plan-to-Produce, and Record-to-Report
5. Configurable industry templates and multi-year simulation data
6. AI mentor integration with grounded enterprise context
7. Deployment, observability, and controlled content administration

The source product vision is retained in `Prompt_v2.txt`.
