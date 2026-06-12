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
- Step-by-step explanations of why each action is performed
- A context-aware SAP mentor prototype
- A role-based learning centre across MM, SD, PP, FI, QM, and EWM
- Locally persisted lesson progress and completion status
- An assessed knowledge check with corrective feedback
- Searchable company structure, plants, storage locations, suppliers, and customers
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
`ptp`, `r2r`, or `qm`):

`/api/simulation/processes?id=o2c`

## Quality checks

```bash
npm run lint
npm run build
```

## Product direction

Planned phases include:

1. Persistent PostgreSQL enterprise and document models
2. User accounts and server-backed learning records
3. Additional Procure-to-Pay lessons and exception scenarios
4. Order-to-Cash, Plan-to-Produce, and Record-to-Report
5. Configurable industry templates and multi-year simulation data
6. AI mentor integration with grounded enterprise context
7. Deployment, observability, and controlled content administration

The source product vision is retained in `Prompt_v2.txt`.
