export type IndustryId =
  | "brewery"
  | "pharmaceutical"
  | "paint"
  | "fmcg"
  | "automotive"
  | "retail"
  | "logistics"
  | "services"
  | "hospital"
  | "oil-gas";

export type IndustryEnterprise = {
  id: IndustryId;
  industry: string;
  enterprise: string;
  description: string;
  operatingModel: string;
  modules: string[];
  status: "live" | "planned";
  release: string;
  companyCode?: string;
  locations?: string;
};

export const industryEnterprises: IndustryEnterprise[] = [
  {
    id: "brewery",
    industry: "Brewery Manufacturing",
    enterprise: "Burton Craft Beverages Ltd.",
    description:
      "Batch-managed ingredients, recipe production, quality release, packaging, warehousing, and customer distribution.",
    operatingModel: "Make-to-stock process manufacturing",
    modules: ["MM", "PP", "QM", "EWM", "SD", "FI", "CO", "PM", "HCM"],
    status: "live",
    release: "Available now",
    companyCode: "BCB1",
    locations: "2 operating sites + 1 planned",
  },
  {
    id: "pharmaceutical",
    industry: "Pharmaceutical Manufacturing",
    enterprise: "Asterion Life Sciences",
    description:
      "GxP-controlled formulation, batch genealogy, validation, quality release, serialization, and regulated distribution.",
    operatingModel: "Regulated batch manufacturing",
    modules: ["PP-PI", "QM", "EWM", "ATTP", "FI", "CO", "PM"],
    status: "live",
    release: "Available now",
    companyCode: "ALS1",
    locations: "1 manufacturing site + 2 regulated distribution centres",
  },
  {
    id: "paint",
    industry: "Paint Manufacturing",
    enterprise: "Chromatek Coatings Group",
    description:
      "Formula-based production, hazardous materials, shade matching, batch quality, and dealer fulfilment.",
    operatingModel: "Process manufacturing and distribution",
    modules: ["MM", "PP-PI", "QM", "EHS", "SD", "EWM", "FI"],
    status: "live",
    release: "Available now",
    companyCode: "CCG1",
    locations: "2 coating plants + 1 distribution centre",
  },
  {
    id: "fmcg",
    industry: "Biscuit and FMCG",
    enterprise: "Harbour Foods Consumer Products",
    description:
      "High-volume production, shelf-life planning, promotional demand, food safety, and retail replenishment.",
    operatingModel: "High-volume make-to-stock",
    modules: ["IBP", "PP", "QM", "EWM", "TM", "SD", "FI"],
    status: "live",
    release: "Available now",
    companyCode: "HFC1",
    locations: "2 factories + 3 regional distribution centres",
  },
  {
    id: "automotive",
    industry: "Automotive Dealership",
    enterprise: "Northstar Automotive Retail",
    description:
      "Vehicle procurement, inventory, workshop service, parts, warranty, finance, and customer lifecycle.",
    operatingModel: "Retail, service, and asset lifecycle",
    modules: ["SD", "MM", "CS", "PM", "FI", "CO", "CRM"],
    status: "live",
    release: "Available now",
    companyCode: "NAR1",
    locations: "4 dealerships + 1 central parts warehouse",
  },
  {
    id: "retail",
    industry: "Retail Chain",
    enterprise: "BritMart Stores Group",
    description:
      "Merchandise buying, allocation, store replenishment, promotions, point of sale, returns, and margin control.",
    operatingModel: "Omnichannel retail network",
    modules: ["Retail", "CAR", "MM", "EWM", "TM", "FI", "Analytics"],
    status: "live",
    release: "Available now",
    companyCode: "BMS1",
    locations: "12 stores + 1 distribution centre + online channel",
  },
  {
    id: "logistics",
    industry: "Logistics Company",
    enterprise: "Vector Freight and Logistics",
    description:
      "Freight orders, fleet and carrier planning, warehouse operations, shipment costing, and customer billing.",
    operatingModel: "Third-party logistics services",
    modules: ["TM", "EWM", "SD", "PM", "FI", "CO"],
    status: "live",
    release: "Available now",
    companyCode: "VFL1",
    locations: "3 warehouses + 2 transport hubs",
  },
  {
    id: "services",
    industry: "Service Organization",
    enterprise: "Cedar Professional Services",
    description:
      "Projects, staffing, time recording, expenses, resource utilization, billing, and profitability.",
    operatingModel: "Project and resource-based services",
    modules: ["PS", "HCM", "CATS", "SD", "FI", "CO"],
    status: "live",
    release: "Available now",
    companyCode: "CPS1",
    locations: "3 consulting offices + remote delivery centre",
  },
  {
    id: "hospital",
    industry: "Hospital",
    enterprise: "St. Anne Integrated Care",
    description:
      "Patient services, clinical materials, pharmacy, assets, workforce, procurement, and cost-of-care reporting.",
    operatingModel: "Integrated healthcare delivery",
    modules: ["IS-H", "MM", "EWM", "PM", "HCM", "FI", "CO"],
    status: "live",
    release: "Available now",
    companyCode: "SAH1",
    locations: "1 acute hospital + 4 community care sites",
  },
  {
    id: "oil-gas",
    industry: "Oil and Gas Enterprise",
    enterprise: "Meridian Energy Resources",
    description:
      "Asset-intensive operations, maintenance, projects, materials, production accounting, logistics, and compliance.",
    operatingModel: "Asset-intensive upstream and downstream",
    modules: ["PM", "PS", "MM", "JVA", "FI", "CO", "EHS", "TM"],
    status: "live",
    release: "Available now",
    companyCode: "MER1",
    locations: "2 producing fields + 1 processing terminal",
  },
];

export const defaultIndustryId: IndustryId = "brewery";

export function isIndustryId(value: unknown): value is IndustryId {
  return industryEnterprises.some((enterprise) => enterprise.id === value);
}

export function industryById(id: IndustryId) {
  return industryEnterprises.find((enterprise) => enterprise.id === id)!;
}
