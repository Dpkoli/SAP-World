# SAP World

SAP World is an enterprise simulation and tutoring platform for learning SAP
S/4HANA through realistic, connected business operations.

## Current MVP

The first release demonstrates a brewery enterprise with:

- An operational dashboard and enterprise KPIs
- A connected Procure-to-Pay document flow
- Inventory, accounting, and operational impact explanations
- A guided SAP goods-receipt lesson using realistic business data
- Step-by-step explanations of why each action is performed
- A context-aware SAP mentor prototype
- A role-based learning centre across MM, SD, PP, FI, QM, and EWM
- Locally persisted lesson progress and completion status
- An assessed knowledge check with corrective feedback
- Responsive desktop and mobile layouts

The simulation follows a real business chain:

`Purchase requisition -> Purchase order -> Goods receipt -> Quality inspection -> Invoice verification -> Vendor payment`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
