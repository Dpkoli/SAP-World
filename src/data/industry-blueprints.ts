import type { IndustryId } from "@/data/industries";

export type IndustryValueChainStage = {
  stage: string;
  activities: string;
  sap: string[];
};

export type IndustryKpi = {
  name: string;
  target: string;
  purpose: string;
};

export type IndustryDependency = {
  from: string;
  to: string;
  logic: string;
};

export type IndustryProblem = {
  issue: string;
  signal: string;
  sapResponse: string;
};

export type IndustrySeasonality = {
  period: string;
  behavior: string;
  planningResponse: string;
};

export type IndustryBlueprint = {
  id: IndustryId;
  customerPromise: string;
  supplyChain: string;
  procurementLifecycle: string[];
  productionLifecycle: string[];
  inventoryLifecycle: string[];
  financialStructure: string[];
  organizationalTemplate: string[];
  masterData: string[];
  valueChain: IndustryValueChainStage[];
  kpis: IndustryKpi[];
  compliance: string[];
  reporting: string[];
  dependencies: IndustryDependency[];
  commonProblems: IndustryProblem[];
  seasonality: IndustrySeasonality[];
};

export const industryBlueprints: IndustryBlueprint[] = [
  {
    id: "brewery",
    customerPromise:
      "Deliver consistent, traceable beer in the required pack format and freshness window.",
    supplyChain:
      "Agricultural ingredients and packaging flow into batch brewing, maturation, packaging, quality release, regional warehousing, and customer delivery.",
    procurementLifecycle: [
      "Forecast malt, hops, yeast, packaging, utilities, and maintenance demand.",
      "Source approved suppliers using contracts, quality scores, and lead times.",
      "Receive batches into quality inspection and release or block by usage decision.",
      "Match supplier invoices to purchase order, receipt, and accepted quantity.",
    ],
    productionLifecycle: [
      "Translate demand into planned orders through MRP and capacity review.",
      "Convert supply into process orders with recipe, batch, and work-centre controls.",
      "Issue ingredients, confirm brewing and packaging, receive finished batches.",
      "Settle actual material, labour, machine, and overhead cost to finished goods.",
    ],
    inventoryLifecycle: [
      "Manage raw ingredients by batch, shelf life, and quality status.",
      "Track work in process through brewing, fermentation, and packaging.",
      "Release finished stock only after laboratory approval.",
      "Transfer stock to distribution centres and reconcile kegs and returns.",
    ],
    financialStructure: [
      "Product standard cost with material, conversion, packaging, and overhead components.",
      "Profit centres by brewery and distribution operation.",
      "Customer and product contribution reporting after freight, returns, and promotions.",
      "Excise, VAT, accrual, inventory provision, and production variance accounting.",
    ],
    organizationalTemplate: [
      "Company code BCB1",
      "Brewery plant BR01",
      "Distribution plant DC01",
      "Purchasing organization P100",
      "Sales organization S100",
      "Profit centres by brewing, packaging, and distribution",
    ],
    masterData: [
      "Batch-managed ingredient, packaging, and finished-good materials",
      "Recipes, BOMs, production versions, and routings",
      "Quality specifications and inspection plans",
      "Supplier sources, customer pricing, batches, and returnable packaging",
      "Production equipment, maintenance plans, and employee assignments",
    ],
    valueChain: [
      { stage: "Plan", activities: "Demand, supply, material, and capacity planning", sap: ["IBP", "PP", "MM"] },
      { stage: "Source", activities: "Contract ingredients, packaging, and services", sap: ["MM", "Ariba", "QM"] },
      { stage: "Make", activities: "Brew, mature, package, inspect, and settle batches", sap: ["PP-PI", "QM", "EWM", "CO"] },
      { stage: "Deliver", activities: "Allocate, pick, transport, bill, and manage returns", sap: ["SD", "EWM", "TM", "FI"] },
    ],
    kpis: [
      { name: "Overall equipment effectiveness", target: "> 78%", purpose: "Balances availability, rate, and quality performance." },
      { name: "Right-first-time batch", target: "> 97%", purpose: "Protects yield, release time, and customer consistency." },
      { name: "Customer service level", target: "> 96%", purpose: "Measures delivery against confirmed customer demand." },
      { name: "Inventory days", target: "24-30 days", purpose: "Balances freshness and working capital." },
      { name: "Contribution margin", target: "> 29%", purpose: "Connects price, mix, cost, freight, and returns." },
    ],
    compliance: [
      "Food safety and HACCP controls",
      "Batch genealogy and product recall readiness",
      "Alcohol duty, VAT, and controlled warehouse reporting",
      "Environmental discharge and packaging obligations",
    ],
    reporting: [
      "Batch yield and production variance",
      "Product and customer profitability",
      "Shelf-life and blocked-stock exposure",
      "Excise, VAT, and environmental performance",
    ],
    dependencies: [
      { from: "Demand plan", to: "MRP and process orders", logic: "Forecast and sales demand create dated supply requirements." },
      { from: "Quality usage decision", to: "Available inventory", logic: "Only accepted batches can satisfy unrestricted demand." },
      { from: "Production confirmation", to: "Product cost", logic: "Actual quantities and activities create manufacturing variance." },
      { from: "Customer return", to: "Margin reporting", logic: "Credit, VAT, quality loss, and recovered stock change contribution." },
    ],
    commonProblems: [
      { issue: "Ingredient shortage", signal: "MRP exception and delayed planned order", sapResponse: "Review source, expedite, substitute under governance, and replan." },
      { issue: "Batch quality failure", signal: "Rejected inspection characteristic", sapResponse: "Block stock, create notification, decide rework or scrap, and update supplier evidence." },
      { issue: "Packaging-line breakdown", signal: "Capacity loss and overdue process orders", sapResponse: "Create maintenance order, reserve spares, reschedule, and recalculate service risk." },
    ],
    seasonality: [
      { period: "May-August", behavior: "Warm weather and events increase packaged-beer demand.", planningResponse: "Build released finished stock, secure packaging, and reserve transport capacity." },
      { period: "November-December", behavior: "Hospitality and retail promotions change mix and pack demand.", planningResponse: "Use promotion forecasts and constrained allocation by customer priority." },
    ],
  },
  {
    id: "pharmaceutical",
    customerPromise:
      "Supply safe, effective, serialized medicine with complete genealogy and validated evidence.",
    supplyChain:
      "Qualified active ingredients and excipients move through controlled formulation, packaging, release, serialization, cold-chain or ambient distribution, and pharmacovigilance.",
    procurementLifecycle: [
      "Qualify suppliers and material specifications before commercial sourcing.",
      "Purchase against approved sources, quality agreements, and controlled changes.",
      "Receive into quarantine with sampling, testing, and certificate review.",
      "Release invoice payment only after quantity, quality, and compliance evidence.",
    ],
    productionLifecycle: [
      "Plan campaigns by demand, validated equipment, cleaning, and material status.",
      "Execute electronic batch records with recipe, weigh-and-dispense, and in-process controls.",
      "Review deviations and laboratory results before quality release.",
      "Serialize saleable packs and preserve genealogy from ingredient to patient market.",
    ],
    inventoryLifecycle: [
      "Separate quarantine, released, rejected, and restricted stock.",
      "Manage potency, retest date, shelf life, temperature, and batch status.",
      "Allocate released batches by market authorization and expiry.",
      "Support recall by ingredient, process batch, packaging order, serial, and customer.",
    ],
    financialStructure: [
      "Standard and actual batch cost with high quality and validation overhead.",
      "R&D, clinical, commercial, and regulatory cost centres.",
      "Inventory provisions for expiry, market restriction, and quality hold.",
      "Profitability by product, market, channel, and license arrangement.",
    ],
    organizationalTemplate: [
      "Legal entities by manufacturing and market authorization holder",
      "Validated manufacturing and packaging plants",
      "Quality control and quarantine storage locations",
      "Sales organizations by regulated market",
      "Profit centres by therapy area or product franchise",
    ],
    masterData: [
      "API, excipient, bulk, semi-finished, and serialized finished materials",
      "Master recipes, production versions, resources, and cleaning matrices",
      "Specifications, inspection plans, stability studies, and certificates",
      "Regulatory market status, serial-number ranges, and cold-chain attributes",
      "Equipment, calibration plans, training qualifications, and approved suppliers",
    ],
    valueChain: [
      { stage: "Develop and approve", activities: "Formulation, validation, registration, and controlled transfer", sap: ["PLM", "QM", "EHS"] },
      { stage: "Source", activities: "Supplier qualification and compliant material procurement", sap: ["Ariba", "MM", "QM"] },
      { stage: "Manufacture", activities: "Validated processing, testing, release, and serialization", sap: ["PP-PI", "QM", "ATTP", "EWM"] },
      { stage: "Distribute", activities: "Market allocation, cold chain, traceability, and recall", sap: ["SD", "EWM", "TM", "ATTP"] },
    ],
    kpis: [
      { name: "Right-first-time batch", target: "> 99%", purpose: "Limits deviation, release delay, and patient supply risk." },
      { name: "Batch release cycle time", target: "< 10 days", purpose: "Measures manufacturing and quality throughput." },
      { name: "Cold-chain excursion rate", target: "< 0.1%", purpose: "Protects product efficacy during storage and transport." },
      { name: "Schedule adherence", target: "> 95%", purpose: "Protects constrained market supply." },
      { name: "Recall trace completion", target: "< 2 hours", purpose: "Demonstrates complete genealogy and response readiness." },
    ],
    compliance: [
      "GMP and GxP data integrity",
      "Electronic records and signatures",
      "Serialization and anti-counterfeit reporting",
      "Validated systems, change control, deviation, and CAPA",
      "Temperature and controlled-substance requirements",
    ],
    reporting: [
      "Batch genealogy and release status",
      "Deviation, CAPA, and right-first-time trend",
      "Expiry and market-restricted inventory",
      "Product cost and therapy-area profitability",
    ],
    dependencies: [
      { from: "Approved specification", to: "Procurement and inspection", logic: "Only current controlled requirements can be purchased and tested." },
      { from: "Training qualification", to: "Batch execution", logic: "Operators must be qualified for assigned controlled operations." },
      { from: "Quality release", to: "Sales allocation", logic: "Quarantine stock cannot satisfy market demand." },
      { from: "Serialization", to: "Delivery", logic: "Commissioned serials and market reports are prerequisites for dispatch." },
    ],
    commonProblems: [
      { issue: "Out-of-specification result", signal: "Failed inspection and blocked batch", sapResponse: "Open deviation, preserve evidence, investigate, and control disposition." },
      { issue: "Cold-chain excursion", signal: "Temperature event against handling unit", sapResponse: "Block affected stock, assess stability evidence, and release or destroy." },
      { issue: "Component change without approval", signal: "Recipe or source validity conflict", sapResponse: "Stop use, initiate change control, revalidate, and update effective master data." },
    ],
    seasonality: [
      { period: "Respiratory season", behavior: "Demand spikes for vaccines and respiratory therapies.", planningResponse: "Use long-horizon constrained supply planning and market allocation." },
      { period: "Regulatory tender cycles", behavior: "Large country awards create step changes in demand.", planningResponse: "Model scenarios before committing campaigns and packaging capacity." },
    ],
  },
  {
    id: "paint",
    customerPromise:
      "Deliver the specified colour, finish, durability, and safety documentation consistently.",
    supplyChain:
      "Pigments, resins, solvents, additives, and packaging feed formula-controlled batches, shade correction, hazardous storage, dealer distribution, and project delivery.",
    procurementLifecycle: [
      "Plan volatile raw materials by formula demand and hazard class.",
      "Source approved pigments, resins, solvents, cans, and transport services.",
      "Inspect identity, viscosity, colour strength, and compliance documentation.",
      "Settle landed cost, duties, freight, and supplier price variance.",
    ],
    productionLifecycle: [
      "Plan campaigns by product family, colour sequence, vessel, and cleaning requirement.",
      "Dispense and mix formula components with batch and actual-consumption capture.",
      "Test shade, viscosity, drying, and coverage; correct formula under control.",
      "Fill, label, palletize, release, and settle batch variance.",
    ],
    inventoryLifecycle: [
      "Segregate flammable, hazardous, and temperature-sensitive materials.",
      "Track bulk, semi-finished base, tint, and packaged finished batches.",
      "Manage shelf life, slow-moving colours, rework, and obsolete packaging.",
      "Allocate dealer and project orders by colour, pack size, and batch consistency.",
    ],
    financialStructure: [
      "Formula cost driven by commodity prices, yield, shade correction, and packaging.",
      "Profit centres by plant, product segment, and channel.",
      "Rebates and project pricing separated from standard dealer pricing.",
      "Environmental, waste, freight, and hazardous handling costs reported explicitly.",
    ],
    organizationalTemplate: [
      "Manufacturing company code",
      "Process plants with hazardous storage locations",
      "Regional dealer distribution centres",
      "Sales organizations for decorative, industrial, and project channels",
      "Profit centres by coating segment",
    ],
    masterData: [
      "Hazard-classified raw, semi-finished, and finished materials",
      "Formulas, recipes, vessel resources, and cleaning sequences",
      "Shade standards, inspection methods, and safety data sheets",
      "Dealer and project pricing conditions",
      "Batches, handling units, dangerous-goods attributes, and approved sources",
    ],
    valueChain: [
      { stage: "Plan", activities: "Forecast colour families, projects, commodities, and capacity", sap: ["IBP", "PP-PI", "CO"] },
      { stage: "Source", activities: "Procure hazardous and commodity materials", sap: ["MM", "Ariba", "QM", "EHS"] },
      { stage: "Make", activities: "Mix, test, adjust shade, fill, and release", sap: ["PP-PI", "QM", "EWM"] },
      { stage: "Sell and deliver", activities: "Configure colour, price projects, and ship compliantly", sap: ["SD", "EWM", "TM", "EHS"] },
    ],
    kpis: [
      { name: "First-pass shade acceptance", target: "> 94%", purpose: "Reduces correction time, cost, and late delivery." },
      { name: "Batch yield", target: "> 98.5%", purpose: "Controls formula loss and waste." },
      { name: "Schedule adherence", target: "> 93%", purpose: "Measures campaign and vessel execution." },
      { name: "Slow-moving finished stock", target: "< 7%", purpose: "Controls colour and pack obsolescence." },
      { name: "Contribution margin by channel", target: "> 27%", purpose: "Shows commodity, rebate, freight, and mix effects." },
    ],
    compliance: [
      "Chemical classification, labels, and safety data sheets",
      "Hazardous storage and dangerous-goods transport",
      "VOC and environmental emissions reporting",
      "Batch traceability and occupational safety",
    ],
    reporting: [
      "Formula and batch variance",
      "Shade correction and quality trend",
      "Commodity exposure and purchase-price variance",
      "Dealer, project, and product-family profitability",
    ],
    dependencies: [
      { from: "Formula and hazard classification", to: "Production and transport", logic: "Composition controls process instructions, labels, storage, and freight rules." },
      { from: "Shade result", to: "Batch release", logic: "Customer-specific colour tolerance determines usability." },
      { from: "Commodity price", to: "Product margin", logic: "Resin and pigment changes flow into standard cost and pricing decisions." },
    ],
    commonProblems: [
      { issue: "Shade mismatch", signal: "Laboratory result outside tolerance", sapResponse: "Block batch, post controlled correction, retest, and preserve recipe history." },
      { issue: "Resin shortage", signal: "Missing component and campaign delay", sapResponse: "Evaluate approved substitute, re-cost formula, and reschedule campaigns." },
      { issue: "Dangerous-goods block", signal: "Delivery fails compliance check", sapResponse: "Correct classification, packaging, carrier, or documentation before release." },
    ],
    seasonality: [
      { period: "Spring and summer", behavior: "Decorative and construction demand rises.", planningResponse: "Build core colours and secure cans, pigments, and dealer capacity." },
      { period: "Project award dates", behavior: "Industrial demand arrives in large colour-specific waves.", planningResponse: "Use project forecasts and reserve vessel and transport capacity." },
    ],
  },
  {
    id: "fmcg",
    customerPromise:
      "Keep safe, fresh products available at the right store, pack, and promotional price.",
    supplyChain:
      "Food ingredients and packaging move through high-volume lines, food-safety release, distribution centres, retail replenishment, promotion execution, and returns.",
    procurementLifecycle: [
      "Forecast ingredients and packaging from baseline and promotional demand.",
      "Source food-safe materials with allergen, origin, and supplier controls.",
      "Receive by batch, shelf life, inspection, and certificate.",
      "Match invoice to accepted receipt and contract or commodity price.",
    ],
    productionLifecycle: [
      "Create line schedules by product family, allergen sequence, and campaign efficiency.",
      "Issue ingredients and packaging, confirm yield, labour, and line performance.",
      "Inspect weight, seal, microbiology, allergen clean-down, and pack coding.",
      "Receive released finished goods and settle high-volume production variances.",
    ],
    inventoryLifecycle: [
      "Manage FEFO by batch and remaining shelf life.",
      "Allocate stock between baseline, promotion, and customer commitments.",
      "Track cases, pallets, handling units, and temperature where required.",
      "Control expiry, damages, retailer returns, and recall exposure.",
    ],
    financialStructure: [
      "Product cost by ingredient, packaging, conversion, waste, and overhead.",
      "Trade promotion accruals, rebates, deductions, and customer profitability.",
      "Profit centres by factory and category.",
      "Margin reporting by SKU, customer, channel, and promotion.",
    ],
    organizationalTemplate: [
      "Manufacturing and sales company codes",
      "Factories by category and high-volume production line",
      "National and regional distribution centres",
      "Retail and wholesale sales organizations",
      "Category profit centres and customer teams",
    ],
    masterData: [
      "Ingredient, packaging, semi-finished, and finished SKU materials",
      "Recipes, BOMs, routings, allergen groups, and production versions",
      "Shelf-life, quality, pallet, and case configurations",
      "Customer assortment, listing, promotion, rebate, and pricing conditions",
      "Supplier origin, certification, and approved source data",
    ],
    valueChain: [
      { stage: "Sense demand", activities: "Baseline, promotion, weather, and retailer forecasting", sap: ["IBP", "Analytics"] },
      { stage: "Source", activities: "Contract ingredients and packaging", sap: ["Ariba", "MM", "QM"] },
      { stage: "Make", activities: "Schedule lines, produce, inspect, and release", sap: ["PP", "QM", "EWM", "CO"] },
      { stage: "Replenish", activities: "Allocate, transport, invoice, and settle deductions", sap: ["SD", "EWM", "TM", "FI"] },
    ],
    kpis: [
      { name: "On-shelf availability", target: "> 97%", purpose: "Measures consumer-facing service." },
      { name: "Forecast accuracy", target: "> 75%", purpose: "Reduces shortage and expiry risk." },
      { name: "Line OEE", target: "> 82%", purpose: "Controls high-volume manufacturing output." },
      { name: "Waste and giveaway", target: "< 2%", purpose: "Protects yield and margin." },
      { name: "Promotion profitability", target: "Positive incremental contribution", purpose: "Separates volume growth from value destruction." },
    ],
    compliance: [
      "Food safety, HACCP, and allergen control",
      "Batch genealogy and rapid recall",
      "Weight, label, nutrition, and origin requirements",
      "Supplier certification and packaging obligations",
    ],
    reporting: [
      "Demand and forecast bias",
      "Promotion uplift and profitability",
      "Shelf-life and expiry exposure",
      "Line efficiency, waste, and product cost",
    ],
    dependencies: [
      { from: "Promotion calendar", to: "Demand and supply plan", logic: "Customer events create uplift by SKU, location, and date." },
      { from: "Allergen sequence", to: "Line schedule", logic: "Cleaning rules constrain campaign order and capacity." },
      { from: "Remaining shelf life", to: "Allocation", logic: "Customer rules determine which batches can ship." },
      { from: "Customer deduction", to: "Profitability", logic: "Claims and rebates reduce true net revenue." },
    ],
    commonProblems: [
      { issue: "Promotion demand spike", signal: "ATP shortage and retailer service risk", sapResponse: "Reforecast, allocate constrained stock, add shifts, and expedite packaging." },
      { issue: "Allergen-clean failure", signal: "Inspection rejection after changeover", sapResponse: "Block output, clean and retest, investigate affected genealogy." },
      { issue: "Expiry exposure", signal: "FEFO stock exceeds forecast consumption", sapResponse: "Reallocate, mark down, donate, or provision under approval." },
    ],
    seasonality: [
      { period: "Holiday and festival periods", behavior: "Pack mix and promotional volume rise sharply.", planningResponse: "Freeze promotions early, reserve line time, and pre-build suitable shelf-life stock." },
      { period: "Weather events", behavior: "Short-notice category demand changes.", planningResponse: "Use demand sensing and rapid DC reallocation." },
    ],
  },
  {
    id: "automotive",
    customerPromise:
      "Provide the right vehicle, transparent finance, reliable servicing, and genuine parts throughout ownership.",
    supplyChain:
      "Vehicles and parts arrive from manufacturers and distributors, enter dealership inventory, support retail sales and workshop jobs, and generate warranty and lifecycle services.",
    procurementLifecycle: [
      "Order vehicles by allocation, model, trim, options, and local demand.",
      "Replenish fast-moving service parts and procure special-order components.",
      "Receive vehicles with VIN inspection and parts by quantity and condition.",
      "Reconcile manufacturer invoice, bonuses, freight, warranty, and parts credits.",
    ],
    productionLifecycle: [
      "No repetitive manufacturing; workshop service orders are the execution object.",
      "Plan technician, bay, tools, parts, and promised completion time.",
      "Confirm labour and parts, record diagnosis, and request warranty approval.",
      "Technically complete the job and bill customer, insurer, or manufacturer.",
    ],
    inventoryLifecycle: [
      "Track each vehicle by VIN, status, age, location, and demonstrator usage.",
      "Manage service parts by bin, supersession, returnability, and criticality.",
      "Reserve vehicles and parts to customer and workshop demand.",
      "Control aged vehicles, obsolete parts, core returns, and warranty returns.",
    ],
    financialStructure: [
      "Vehicle margin includes invoice, freight, incentives, finance commission, and preparation.",
      "Workshop profitability separates labour, parts, subcontract, and warranty recovery.",
      "Profit centres by dealership and business line.",
      "Floor-plan interest and aged-stock provisions are visible.",
    ],
    organizationalTemplate: [
      "Dealer company codes or profit centres",
      "Retail locations with vehicle compounds and parts stores",
      "Sales organizations by brand",
      "Workshop plants with service bays as work centres",
      "Cost centres for sales, service, parts, and administration",
    ],
    masterData: [
      "Vehicle models, option packages, VIN equipment, and valuation data",
      "Customers, prospects, finance partners, and insurers",
      "Parts, supersession chains, service kits, and return cores",
      "Workshop labour operations, maintenance plans, and technician skills",
      "Pricing, warranty, bonus, and service-contract conditions",
    ],
    valueChain: [
      { stage: "Acquire", activities: "Vehicle allocation, purchase, transport, and receipt", sap: ["MM", "TM", "VMS"] },
      { stage: "Sell", activities: "Configure, reserve, finance, deliver, and invoice vehicle", sap: ["SD", "CRM", "FI"] },
      { stage: "Service", activities: "Book, diagnose, repair, warranty, and bill", sap: ["CS", "PM", "MM", "SD"] },
      { stage: "Retain", activities: "Service plans, campaigns, trade-in, and replacement", sap: ["CRM", "Analytics", "FI"] },
    ],
    kpis: [
      { name: "Vehicle days in stock", target: "< 55 days", purpose: "Controls capital and floor-plan cost." },
      { name: "Gross profit per vehicle", target: "By brand and segment plan", purpose: "Combines front and back-end income." },
      { name: "Workshop utilization", target: "> 85%", purpose: "Measures productive technician capacity." },
      { name: "First-time fix rate", target: "> 92%", purpose: "Protects customer satisfaction and repeat cost." },
      { name: "Parts fill rate", target: "> 95%", purpose: "Prevents workshop delay." },
    ],
    compliance: [
      "Consumer credit and transparent selling",
      "Vehicle safety, recall, and service campaign traceability",
      "Warranty evidence and manufacturer standards",
      "Data privacy and anti-money-laundering controls",
    ],
    reporting: [
      "Vehicle aging and margin",
      "Workshop labour and bay productivity",
      "Parts availability and obsolescence",
      "Warranty recovery and customer retention",
    ],
    dependencies: [
      { from: "VIN configuration", to: "Pricing and delivery", logic: "Actual equipment determines value, tax, and customer contract." },
      { from: "Workshop diagnosis", to: "Parts and labour plan", logic: "Approved operations create reservations and promised time." },
      { from: "Warranty authorization", to: "Billing party", logic: "Evidence determines manufacturer versus customer liability." },
    ],
    commonProblems: [
      { issue: "Vehicle aging", signal: "VIN exceeds stocking threshold", sapResponse: "Reprice, transfer, campaign, or provision with margin approval." },
      { issue: "Critical part unavailable", signal: "Service order cannot confirm date", sapResponse: "Search supersession and network stock, expedite, or reschedule transparently." },
      { issue: "Warranty rejection", signal: "Claim fails policy or evidence", sapResponse: "Correct coding and documentation or reassign cost under approval." },
    ],
    seasonality: [
      { period: "Registration plate changes", behavior: "New-vehicle deliveries peak.", planningResponse: "Align allocation, preparation, finance, and handover capacity." },
      { period: "Winter and holiday travel", behavior: "Tyres, batteries, and servicing demand shifts.", planningResponse: "Pre-stock seasonal parts and schedule workshop campaigns." },
    ],
  },
  {
    id: "retail",
    customerPromise:
      "Make the right product available at a competitive price across store and digital channels.",
    supplyChain:
      "Merchandise is bought centrally, imported or domestically supplied, allocated through distribution centres, replenished to stores and e-commerce, sold at point of sale, and returned through reverse logistics.",
    procurementLifecycle: [
      "Build assortment and open-to-buy plans by category, season, and channel.",
      "Create contracts, purchase orders, import milestones, and supplier confirmations.",
      "Receive into DC or store with carton, article, and discrepancy control.",
      "Settle merchandise invoice, freight, duty, rebates, and claims.",
    ],
    productionLifecycle: [
      "No internal production for most merchandise; merchandise planning replaces manufacturing.",
      "Create assortments, allocations, replenishment parameters, and promotion execution.",
      "Prepare value-added services such as ticketing, kitting, and e-commerce fulfilment.",
      "Close sales, inventory, shrink, and margin by store and channel.",
    ],
    inventoryLifecycle: [
      "Track article, variant, site, batch where relevant, and channel availability.",
      "Allocate scarce launch and seasonal stock across stores and online.",
      "Replenish from POS demand, safety stock, presentation stock, and lead time.",
      "Process customer returns, markdowns, damages, shrink, and end-of-season clearance.",
    ],
    financialStructure: [
      "Retail margin by article, category, store, channel, and promotion.",
      "Purchase price, duty, freight, rebate, markdown, and shrink components.",
      "Profit centres by store and digital channel.",
      "Lease, payroll, payment fee, and fulfilment cost visibility.",
    ],
    organizationalTemplate: [
      "Retail company code",
      "Sites for stores, distribution centres, and fulfilment centres",
      "Purchasing organizations and category teams",
      "Sales channels for store, web, marketplace, and click-and-collect",
      "Profit centres by store and channel",
    ],
    masterData: [
      "Articles, variants, seasons, merchandise categories, and assortments",
      "Sites, layout modules, replenishment, and listing conditions",
      "Suppliers, purchasing conditions, import and freight attributes",
      "Retail prices, promotions, markdowns, and loyalty offers",
      "Customers, returns reasons, and point-of-sale mappings",
    ],
    valueChain: [
      { stage: "Plan and buy", activities: "Assortment, open-to-buy, sourcing, and order", sap: ["Retail", "Ariba", "IBP"] },
      { stage: "Move and allocate", activities: "Import, receive, allocate, and replenish", sap: ["MM", "EWM", "TM"] },
      { stage: "Sell", activities: "Price, promote, transact, and fulfil omnichannel demand", sap: ["CAR", "SD", "Commerce"] },
      { stage: "Optimize", activities: "Return, markdown, shrink, and margin management", sap: ["Retail", "FI", "Analytics"] },
    ],
    kpis: [
      { name: "On-shelf availability", target: "> 96%", purpose: "Measures whether demand can convert to sales." },
      { name: "Sell-through", target: "By category and lifecycle plan", purpose: "Controls seasonal inventory risk." },
      { name: "Gross margin return on inventory", target: "Category-specific", purpose: "Balances margin and stock investment." },
      { name: "Shrink", target: "< 1.5% of sales", purpose: "Measures physical and process loss." },
      { name: "Omnichannel fulfilment accuracy", target: "> 99%", purpose: "Protects digital customer promise." },
    ],
    compliance: [
      "Consumer pricing and promotion accuracy",
      "Product safety, traceability, and recall",
      "Payment-card and customer-data controls",
      "Modern slavery, origin, customs, and packaging obligations",
    ],
    reporting: [
      "Sales, stock, and margin by article/site/channel",
      "Promotion and markdown effectiveness",
      "Availability, lost sales, and replenishment exceptions",
      "Shrink, return, and supplier performance",
    ],
    dependencies: [
      { from: "Assortment listing", to: "Ordering and sale", logic: "An article must be valid for the site and date." },
      { from: "POS demand", to: "Replenishment", logic: "Sales and stock corrections update future requirements." },
      { from: "Promotion", to: "Price and forecast", logic: "Offer conditions and uplift must share dates and sites." },
      { from: "Return disposition", to: "Inventory and margin", logic: "Resale, repair, vendor return, or write-off changes value." },
    ],
    commonProblems: [
      { issue: "Shelf stockout despite DC stock", signal: "POS lost sales and replenishment exception", sapResponse: "Correct parameters, inventory accuracy, allocation, or store execution." },
      { issue: "Promotion price mismatch", signal: "POS price differs from advertised offer", sapResponse: "Stop or correct condition distribution and assess customer remediation." },
      { issue: "Seasonal overstock", signal: "Low sell-through near lifecycle end", sapResponse: "Reallocate, markdown, return to vendor, or provision." },
    ],
    seasonality: [
      { period: "Holiday and gifting", behavior: "Volume, assortment, and fulfilment peak.", planningResponse: "Lock range, reserve import and DC capacity, and stage store allocation." },
      { period: "Season launches and clearance", behavior: "New ranges replace old stock rapidly.", planningResponse: "Control intake, sell-through, markdown cadence, and transfers." },
    ],
  },
  {
    id: "logistics",
    customerPromise:
      "Move and store customer goods safely, visibly, on time, and at the agreed cost.",
    supplyChain:
      "Customer orders become freight units, routes, carrier or fleet assignments, warehouse services, execution events, proof of delivery, settlement, and customer billing.",
    procurementLifecycle: [
      "Tender lanes and services to qualified carriers and subcontractors.",
      "Create freight agreements, rates, accessorial rules, and capacity commitments.",
      "Confirm performed services through events and proof documents.",
      "Settle carrier invoices against calculated freight cost and exceptions.",
    ],
    productionLifecycle: [
      "Service production consists of transport and warehouse execution.",
      "Consolidate demand into freight orders, routes, waves, and labour plans.",
      "Execute pickup, cross-dock, storage, value-added service, and delivery.",
      "Capture events, exceptions, actual cost, and billable service.",
    ],
    inventoryLifecycle: [
      "Preserve customer ownership and stock status by warehouse and contract.",
      "Track handling units, serials, batches, temperature, and customs status.",
      "Control cross-dock, damaged, blocked, and unclaimed goods.",
      "Reconcile physical stock to customer and warehouse-management records.",
    ],
    financialStructure: [
      "Revenue by shipment, lane, warehouse activity, and contract.",
      "Direct carrier, fuel, toll, labour, equipment, and facility cost.",
      "Profit centres by branch, warehouse, and service line.",
      "Shipment contribution after accessorials, claims, and empty miles.",
    ],
    organizationalTemplate: [
      "Logistics company code",
      "Branches, transport planning points, and warehouses",
      "Shipping and receiving locations",
      "Fleet and maintenance plants",
      "Profit centres by region and service",
    ],
    masterData: [
      "Customers, shippers, consignees, carriers, drivers, and partners",
      "Locations, lanes, zones, calendars, and route profiles",
      "Vehicles, trailers, equipment, and maintenance plans",
      "Freight agreements, rate tables, accessorials, and service products",
      "Warehouse products, handling units, and dangerous-goods attributes",
    ],
    valueChain: [
      { stage: "Sell capacity", activities: "Quote lanes, storage, and service levels", sap: ["SD", "TM", "CRM"] },
      { stage: "Plan", activities: "Consolidate, route, tender, and schedule labour", sap: ["TM", "EWM"] },
      { stage: "Execute", activities: "Pickup, warehouse, transport, event, and delivery", sap: ["TM", "EWM", "Mobile"] },
      { stage: "Settle", activities: "Carrier settlement, customer billing, and profitability", sap: ["TM", "SD", "FI", "CO"] },
    ],
    kpis: [
      { name: "On-time in-full", target: "> 97%", purpose: "Measures customer service execution." },
      { name: "Empty distance", target: "< 12%", purpose: "Controls network waste and emissions." },
      { name: "Cost per shipment", target: "Within lane plan", purpose: "Connects execution choices to margin." },
      { name: "Warehouse order cycle time", target: "Contract-specific", purpose: "Measures fulfilment productivity." },
      { name: "Claims ratio", target: "< 0.3% of revenue", purpose: "Measures damage and liability exposure." },
    ],
    compliance: [
      "Driver hours, vehicle safety, and transport licensing",
      "Customs, dangerous goods, and chain of custody",
      "Customer inventory segregation and evidence",
      "Carbon and fuel reporting",
    ],
    reporting: [
      "Lane, customer, and shipment profitability",
      "Fleet utilization and empty distance",
      "Warehouse productivity and inventory accuracy",
      "Carrier performance, claims, and emissions",
    ],
    dependencies: [
      { from: "Customer order", to: "Freight unit", logic: "Dates, locations, dimensions, and service create transport demand." },
      { from: "Freight plan", to: "Warehouse wave", logic: "Departure time controls staging and loading priority." },
      { from: "Execution event", to: "Settlement and billing", logic: "Performed service and exceptions determine cost and revenue." },
      { from: "Vehicle maintenance", to: "Capacity", logic: "Unavailable equipment reduces feasible transport supply." },
    ],
    commonProblems: [
      { issue: "Carrier rejection", signal: "Tender expires without acceptance", sapResponse: "Retender by ranking, use spot rate, or replan consolidation." },
      { issue: "Warehouse departure miss", signal: "Freight order waits for unconfirmed loading", sapResponse: "Prioritize tasks, split shipment, update ETA, and assess service penalty." },
      { issue: "Damage claim", signal: "Exception and proof-of-delivery discrepancy", sapResponse: "Block settlement portion, investigate custody, and process claim." },
    ],
    seasonality: [
      { period: "Retail peaks", behavior: "Parcel, full-load, and warehouse volume surge.", planningResponse: "Reserve carriers, temporary labour, staging, and cut-off rules." },
      { period: "Weather disruption", behavior: "Network capacity and transit time become uncertain.", planningResponse: "Use event visibility, alternate routes, and customer prioritization." },
    ],
  },
  {
    id: "services",
    customerPromise:
      "Deliver qualified expertise, agreed outcomes, transparent effort, and predictable commercial value.",
    supplyChain:
      "Sales opportunities become contracts and projects, skills are staffed, time and expenses are captured, milestones are accepted, and services are billed and analysed.",
    procurementLifecycle: [
      "Plan subcontractor and external-service demand from project staffing gaps.",
      "Source specialists under rate cards, statements of work, and compliance checks.",
      "Approve service entry from delivered milestones or accepted time.",
      "Match supplier invoice to contract, service entry, and project budget.",
    ],
    productionLifecycle: [
      "Projects and service orders are the production objects.",
      "Plan work breakdown, deliverables, skills, effort, dates, and budget.",
      "Assign employees and contractors, record time, expense, and progress.",
      "Recognize revenue, settle cost, invoice milestones or time, and close engagement.",
    ],
    inventoryLifecycle: [
      "Little physical inventory; capacity, knowledge, and unbilled work are key assets.",
      "Track laptops or specialist equipment where issued to projects.",
      "Control work in progress, deferred revenue, and unbilled receivables.",
      "Release resources from projects and update availability and skills.",
    ],
    financialStructure: [
      "Project revenue by time and material, fixed price, milestone, or subscription.",
      "Direct labour, subcontractor, travel, and overhead cost.",
      "Profit centres by practice, geography, and market.",
      "Utilization, realization, WIP, backlog, and project margin reporting.",
    ],
    organizationalTemplate: [
      "Service company codes",
      "Practices, departments, and delivery locations",
      "Project and sales organizations",
      "Cost centres by team and profit centres by practice",
      "Resource pools and skill communities",
    ],
    masterData: [
      "Employees, contractors, skills, grades, calendars, and cost rates",
      "Customers, contacts, contracts, projects, WBS elements, and milestones",
      "Service products, rate cards, billing rules, and revenue methods",
      "Expense policies, approval routes, and equipment assignments",
      "Subcontractor sources and statements of work",
    ],
    valueChain: [
      { stage: "Sell", activities: "Qualify, estimate, propose, contract, and create backlog", sap: ["CRM", "SD", "PS"] },
      { stage: "Staff", activities: "Match skills, capacity, location, and rate", sap: ["SuccessFactors", "HCM", "PS"] },
      { stage: "Deliver", activities: "Execute milestones, time, expense, and change", sap: ["PS", "CATS", "Concur"] },
      { stage: "Recognize and bill", activities: "Revenue recognition, invoicing, collection, and margin", sap: ["SD", "FI", "CO"] },
    ],
    kpis: [
      { name: "Billable utilization", target: "72-82% by role", purpose: "Balances delivery productivity and capability investment." },
      { name: "Project gross margin", target: "> 32%", purpose: "Measures commercial and delivery performance." },
      { name: "Realization", target: "> 95%", purpose: "Compares billed value with standard or contracted value." },
      { name: "Backlog coverage", target: "3-6 months", purpose: "Shows forward revenue and staffing demand." },
      { name: "Days sales outstanding", target: "< 45 days", purpose: "Controls cash conversion." },
    ],
    compliance: [
      "Contract, confidentiality, independence, and conflict controls",
      "Worker classification and right-to-work",
      "Time, expense, data privacy, and customer access policies",
      "Revenue recognition and approval evidence",
    ],
    reporting: [
      "Project margin and estimate at completion",
      "Utilization, capacity, and skill demand",
      "Backlog, pipeline, revenue, and realization",
      "WIP, unbilled receivable, and collection",
    ],
    dependencies: [
      { from: "Contract", to: "Project and billing", logic: "Scope, rates, milestones, and terms establish execution and revenue rules." },
      { from: "Resource assignment", to: "Capacity and cost", logic: "Skill, calendar, and grade determine feasibility and economics." },
      { from: "Approved time or milestone", to: "Revenue and invoice", logic: "Accepted delivery evidence triggers accounting." },
    ],
    commonProblems: [
      { issue: "Project margin erosion", signal: "Estimate-at-completion falls below plan", sapResponse: "Reforecast effort, control scope, re-staff, and raise change request." },
      { issue: "Skill shortage", signal: "Open demand has no qualified resource", sapResponse: "Reschedule, train, subcontract, or negotiate delivery scope." },
      { issue: "Billing delay", signal: "Completed work lacks approval or milestone evidence", sapResponse: "Resolve acceptance, correct time, and release billing block." },
    ],
    seasonality: [
      { period: "Client budget year-end", behavior: "Project starts and spend deadlines cluster.", planningResponse: "Protect onboarding and delivery capacity while validating achievable scope." },
      { period: "Holiday periods", behavior: "Availability drops and milestones shift.", planningResponse: "Model calendars, handovers, and customer dependencies in the plan." },
    ],
  },
  {
    id: "hospital",
    customerPromise:
      "Provide safe, timely, clinically effective care with the right people, medicine, equipment, and evidence.",
    supplyChain:
      "Clinical demand drives medicines, consumables, implants, services, workforce, beds, theatres, and equipment maintenance from supplier through patient episode and cost-of-care reporting.",
    procurementLifecycle: [
      "Plan formulary, theatre, ward, laboratory, facilities, and capital demand.",
      "Source approved medicines, devices, consumables, services, and contracts.",
      "Receive with batch, serial, cold-chain, expiry, and clinical quality controls.",
      "Match invoice to order, receipt, implant use, service evidence, or contract.",
    ],
    productionLifecycle: [
      "Patient episodes and clinical pathways are the service-production objects.",
      "Plan appointments, beds, theatres, clinicians, diagnostics, and materials.",
      "Record treatment, medicine administration, device consumption, and outcomes.",
      "Allocate cost, bill payer where applicable, and analyse care pathway efficiency.",
    ],
    inventoryLifecycle: [
      "Manage ward, pharmacy, theatre, laboratory, and central-store stock.",
      "Control narcotics, cold chain, batch, serial, implant, expiry, and consignment.",
      "Replenish point-of-care locations from actual consumption and critical levels.",
      "Support recall from supplier batch or device serial to patient episode.",
    ],
    financialStructure: [
      "Cost centres by ward, theatre, department, and support service.",
      "Cost per patient, procedure, diagnostic group, and clinical pathway.",
      "Capital asset, grant, charity, insurer, and public funding accounting.",
      "Medicine, agency labour, implant, and equipment cost visibility.",
    ],
    organizationalTemplate: [
      "Hospital legal entity and operating company codes",
      "Hospitals, clinics, pharmacies, laboratories, and central stores",
      "Clinical departments, wards, theatres, and cost centres",
      "Purchasing organization and category teams",
      "Profit or responsibility centres by service line",
    ],
    masterData: [
      "Patients, clinicians, employees, payers, and suppliers",
      "Medicines, consumables, implants, devices, and formulary status",
      "Clinical services, procedures, pathways, and charge rules",
      "Equipment assets, maintenance, calibration, and location",
      "Batches, serials, expiry, cold-chain, and controlled-drug attributes",
    ],
    valueChain: [
      { stage: "Access and schedule", activities: "Referral, appointment, triage, and capacity", sap: ["IS-H", "HCM"] },
      { stage: "Prepare", activities: "Staff, bed, theatre, medicine, device, and equipment readiness", sap: ["MM", "EWM", "PM", "HCM"] },
      { stage: "Deliver care", activities: "Treat, consume, document, transfer, and discharge", sap: ["IS-H", "MM", "EWM"] },
      { stage: "Cost and learn", activities: "Bill, allocate cost, analyse outcomes, and improve", sap: ["FI", "CO", "Analytics"] },
    ],
    kpis: [
      { name: "Critical stock availability", target: "> 99.5%", purpose: "Protects patient safety and scheduled care." },
      { name: "Theatre utilization", target: "> 80%", purpose: "Balances throughput and resilience." },
      { name: "Cancelled procedure rate", target: "< 2%", purpose: "Exposes capacity, material, and patient-readiness failures." },
      { name: "Medicine expiry loss", target: "< 0.5%", purpose: "Controls clinical waste and working capital." },
      { name: "Cost per case", target: "Within pathway benchmark", purpose: "Links resources and outcomes." },
    ],
    compliance: [
      "Patient safety, clinical governance, and privacy",
      "Medicine, controlled-drug, device, and implant traceability",
      "Cold chain, infection control, and equipment calibration",
      "Procurement probity, workforce qualification, and financial stewardship",
    ],
    reporting: [
      "Cost of care by pathway and patient group",
      "Medicine, device, and critical-stock availability",
      "Theatre, bed, workforce, and equipment utilization",
      "Recall, expiry, maintenance, and safety compliance",
    ],
    dependencies: [
      { from: "Clinical schedule", to: "Material and workforce demand", logic: "Planned procedures create dated resource requirements." },
      { from: "Medicine or device status", to: "Patient use", logic: "Only valid, released, non-expired stock can be administered." },
      { from: "Equipment maintenance", to: "Clinical capacity", logic: "Unavailable or overdue equipment blocks safe service." },
      { from: "Patient consumption", to: "Cost of care", logic: "Actual medicine, device, time, and service usage create episode cost." },
    ],
    commonProblems: [
      { issue: "Critical medicine shortage", signal: "Ward requirement exceeds available released stock", sapResponse: "Allocate clinically, source alternative, transfer, and escalate formulary approval." },
      { issue: "Theatre cancellation", signal: "Missing staff, implant, equipment, or bed", sapResponse: "Identify constraint, reschedule safely, and correct planning master data." },
      { issue: "Device recall", signal: "Supplier serial or batch notification", sapResponse: "Block inventory, trace patient use, notify owners, and document action." },
    ],
    seasonality: [
      { period: "Winter pressure", behavior: "Emergency, respiratory, bed, and workforce demand rise.", planningResponse: "Increase critical stock, staffing scenarios, and elective capacity controls." },
      { period: "Public holidays", behavior: "Supplier and specialist availability reduces.", planningResponse: "Pre-position medicine, consumables, and on-call capacity." },
    ],
  },
  {
    id: "oil-gas",
    customerPromise:
      "Produce and deliver energy safely, reliably, compliantly, and at controlled lifecycle cost.",
    supplyChain:
      "Projects, wells, facilities, maintenance, specialist materials, production operations, terminals, transport, joint ventures, and commodity sales form an asset-intensive network.",
    procurementLifecycle: [
      "Plan long-lead equipment, critical spares, chemicals, vessels, and specialist services.",
      "Source through contracts, framework agreements, technical qualification, and tender.",
      "Receive to base, warehouse, project, offshore location, or direct service entry.",
      "Settle material and service invoices with project, maintenance, and joint-venture allocation.",
    ],
    productionLifecycle: [
      "Production is extraction, processing, transportation, and terminal operation.",
      "Plan rates, shutdowns, maintenance, wells, constraints, and nominations.",
      "Record volumes, losses, quality, equipment status, and operational events.",
      "Allocate production, value inventory, settle partners, and recognize sales.",
    ],
    inventoryLifecycle: [
      "Manage critical spares, repairables, chemicals, tubulars, and project materials.",
      "Track offshore and remote stock, serial equipment, preservation, and certification.",
      "Control pipeline, tank, terminal, and in-transit hydrocarbon inventory.",
      "Provision obsolete project stock and return repairable equipment.",
    ],
    financialStructure: [
      "Assets and projects by field, facility, well, terminal, and network.",
      "Joint-venture ownership, cash calls, partner billing, and cost allocation.",
      "Lifting cost, maintenance cost, depletion, depreciation, and impairment.",
      "Commodity revenue, hedging, royalties, tax, and environmental obligations.",
    ],
    organizationalTemplate: [
      "Legal entities and joint-venture company codes",
      "Fields, platforms, plants, terminals, and maintenance locations",
      "Projects, WBS structures, networks, and investment programs",
      "Purchasing and logistics organizations by operating region",
      "Profit centres by asset or field",
    ],
    masterData: [
      "Functional locations, equipment, serials, bills of material, and maintenance strategies",
      "Materials, criticality, repairable loops, certificates, and preservation rules",
      "Projects, WBS, networks, budgets, and asset-under-construction data",
      "Wells, fields, measurement points, tanks, pipelines, and production networks",
      "Vendors, contracts, services, partners, ownership interests, and tax rules",
    ],
    valueChain: [
      { stage: "Develop assets", activities: "Appraise, engineer, procure, construct, and capitalize", sap: ["PS", "MM", "FI-AA", "EHS"] },
      { stage: "Operate", activities: "Produce, measure, allocate, and manage constraints", sap: ["PP", "PM", "JVA", "Analytics"] },
      { stage: "Maintain", activities: "Inspect, plan, execute, turn around, and improve reliability", sap: ["PM", "MM", "PS"] },
      { stage: "Move and sell", activities: "Store, nominate, transport, invoice, and settle partners", sap: ["TM", "SD", "FI", "JVA"] },
    ],
    kpis: [
      { name: "Production availability", target: "> 94%", purpose: "Measures asset reliability and deferred production." },
      { name: "Lifting cost per barrel", target: "Within asset plan", purpose: "Connects operating cost to produced volume." },
      { name: "Maintenance schedule compliance", target: "> 90%", purpose: "Controls reliability and integrity risk." },
      { name: "Critical material service level", target: "> 98%", purpose: "Protects remote and shutdown work." },
      { name: "Process safety events", target: "Zero major events", purpose: "Measures catastrophic-risk control." },
    ],
    compliance: [
      "Process safety, permit to work, and asset integrity",
      "Environmental emissions, spill, waste, and decommissioning obligations",
      "Joint-venture accounting and partner audit",
      "Royalty, production tax, customs, and export controls",
      "Equipment certification and contractor competence",
    ],
    reporting: [
      "Production, deferment, loss, and allocation",
      "Asset reliability and maintenance backlog",
      "Project cost, commitment, forecast, and capitalization",
      "Lifting cost, joint-venture, tax, and asset profitability",
    ],
    dependencies: [
      { from: "Asset hierarchy", to: "Maintenance and cost", logic: "Technical structure identifies risk, work history, materials, and ownership." },
      { from: "Shutdown schedule", to: "Project, maintenance, and supply", logic: "A fixed outage window drives integrated labour and material readiness." },
      { from: "Metered production", to: "Allocation and revenue", logic: "Validated volumes determine partner share, inventory, and sale." },
      { from: "Ownership interest", to: "Partner accounting", logic: "Joint-venture rules allocate cost, cash, and production." },
    ],
    commonProblems: [
      { issue: "Unplanned equipment trip", signal: "Production rate loss and critical alarm", sapResponse: "Create emergency work, secure permits and spares, record deferment, and investigate failure." },
      { issue: "Shutdown material missing", signal: "Readiness review shows unconfirmed critical spare", sapResponse: "Expedite, repair, borrow, redesign scope, or formally accept risk." },
      { issue: "Production allocation imbalance", signal: "Meter totals do not reconcile to partner allocation", sapResponse: "Validate measurement, loss assumptions, and allocation rules before close." },
    ],
    seasonality: [
      { period: "Planned turnaround window", behavior: "Production stops while maintenance and project work peak.", planningResponse: "Integrate scope, materials, contractors, permits, logistics, and cost months ahead." },
      { period: "Severe weather season", behavior: "Offshore logistics and field access become constrained.", planningResponse: "Pre-position critical stock and model production and maintenance contingencies." },
    ],
  },
];

export function industryBlueprintById(id: IndustryId) {
  return industryBlueprints.find((blueprint) => blueprint.id === id)!;
}
