export type EnterpriseUnit = {
  code: string;
  name: string;
  type: "Company Code" | "Purchasing Org" | "Sales Org" | "Plant" | "Storage Location";
  parent?: string;
  location?: string;
  currency?: string;
  status: "Active" | "Planned";
};

export type Plant = {
  code: string;
  name: string;
  location: string;
  role: string;
  capacity: string;
  utilization: number;
  employees: number;
  storageLocations: number;
  activeOrders: number;
  status: "Operating" | "Attention" | "Planned";
};

export type BusinessPartner = {
  id: string;
  name: string;
  category: "Supplier" | "Customer";
  role: string;
  country: string;
  city: string;
  annualValue: string;
  openItems: string;
  risk: "Low" | "Medium" | "High";
  status: "Active" | "Blocked";
};

export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  plant: string;
  costCenter: string;
  manager: string;
  hireDate: string;
  employmentStatus: "Active" | "Onboarding" | "Leave";
  payrollArea: string;
};

export const enterpriseUnits: EnterpriseUnit[] = [
  { code: "BCB1", name: "Burton Craft Beverages Ltd.", type: "Company Code", location: "Burton upon Trent, UK", currency: "GBP", status: "Active" },
  { code: "P100", name: "UK Central Purchasing", type: "Purchasing Org", parent: "BCB1", location: "Burton upon Trent, UK", status: "Active" },
  { code: "S100", name: "UK Domestic Sales", type: "Sales Org", parent: "BCB1", location: "Birmingham, UK", status: "Active" },
  { code: "S200", name: "Export Sales", type: "Sales Org", parent: "BCB1", location: "London, UK", status: "Active" },
  { code: "BR01", name: "Burton Brewery", type: "Plant", parent: "BCB1", location: "Burton upon Trent, UK", status: "Active" },
  { code: "DC01", name: "Midlands Distribution Centre", type: "Plant", parent: "BCB1", location: "Tamworth, UK", status: "Active" },
  { code: "BR02", name: "Northern Brewery", type: "Plant", parent: "BCB1", location: "Leeds, UK", status: "Planned" },
  { code: "RM01", name: "Raw Materials", type: "Storage Location", parent: "BR01", location: "Burton Brewery", status: "Active" },
  { code: "FG01", name: "Finished Goods", type: "Storage Location", parent: "BR01", location: "Burton Brewery", status: "Active" },
  { code: "QI01", name: "Quality Inspection", type: "Storage Location", parent: "BR01", location: "Burton Brewery", status: "Active" },
];

export const plants: Plant[] = [
  {
    code: "BR01",
    name: "Burton Brewery",
    location: "Burton upon Trent",
    role: "Manufacturing and packaging",
    capacity: "1.8M HL / year",
    utilization: 87,
    employees: 284,
    storageLocations: 6,
    activeOrders: 18,
    status: "Operating",
  },
  {
    code: "DC01",
    name: "Midlands Distribution Centre",
    location: "Tamworth",
    role: "Warehousing and distribution",
    capacity: "18,500 pallets",
    utilization: 74,
    employees: 96,
    storageLocations: 8,
    activeOrders: 42,
    status: "Attention",
  },
  {
    code: "BR02",
    name: "Northern Brewery",
    location: "Leeds",
    role: "Regional manufacturing",
    capacity: "0.9M HL / year",
    utilization: 0,
    employees: 0,
    storageLocations: 4,
    activeOrders: 0,
    status: "Planned",
  },
];

export const businessPartners: BusinessPartner[] = [
  { id: "1000012", name: "Highland Maltings PLC", category: "Supplier", role: "Raw material supplier", country: "United Kingdom", city: "Inverness", annualValue: "£2.84M", openItems: "£148K", risk: "Low", status: "Active" },
  { id: "1000031", name: "Crown Packaging Europe", category: "Supplier", role: "Packaging supplier", country: "United Kingdom", city: "Leicester", annualValue: "£1.92M", openItems: "£86K", risk: "Medium", status: "Active" },
  { id: "1000048", name: "Bohemia Hops Cooperative", category: "Supplier", role: "Ingredient supplier", country: "Czech Republic", city: "Žatec", annualValue: "£740K", openItems: "£54K", risk: "Medium", status: "Active" },
  { id: "2000017", name: "Northern Taverns Ltd", category: "Customer", role: "On-trade customer", country: "United Kingdom", city: "Manchester", annualValue: "£4.26M", openItems: "£312K", risk: "Medium", status: "Active" },
  { id: "2000029", name: "BritMart Retail Group", category: "Customer", role: "National retail account", country: "United Kingdom", city: "London", annualValue: "£6.18M", openItems: "£428K", risk: "Low", status: "Active" },
  { id: "2000044", name: "Continental Beverage Imports", category: "Customer", role: "Export distributor", country: "Netherlands", city: "Rotterdam", annualValue: "£1.36M", openItems: "£96K", risk: "High", status: "Blocked" },
];

export const employees: Employee[] = [
  { id: "700184", name: "Aisha Rahman", position: "Quality Technician", department: "Quality Assurance", plant: "BR01", costCenter: "BR01-QA", manager: "Martin Hughes", hireDate: "2026-06-15", employmentStatus: "Onboarding", payrollArea: "GB-M1" },
  { id: "700092", name: "Martin Hughes", position: "Quality Manager", department: "Quality Assurance", plant: "BR01", costCenter: "BR01-QA", manager: "Sarah Bennett", hireDate: "2019-03-04", employmentStatus: "Active", payrollArea: "GB-M1" },
  { id: "700137", name: "Daniel Cooper", position: "Maintenance Planner", department: "Engineering", plant: "BR01", costCenter: "BR01-MAINT", manager: "Priya Shah", hireDate: "2023-08-14", employmentStatus: "Active", payrollArea: "GB-M1" },
  { id: "700158", name: "Sophie Williams", position: "Warehouse Team Lead", department: "Distribution", plant: "DC01", costCenter: "DC01-WH", manager: "Lewis Grant", hireDate: "2024-05-20", employmentStatus: "Active", payrollArea: "GB-M1" },
];

export const enterpriseSummary = {
  companyCode: "BCB1",
  fiscalYear: "2026",
  currency: "GBP",
  plants: plants.length,
  activePartners: businessPartners.filter((partner) => partner.status === "Active").length,
  employees: plants.reduce((total, plant) => total + plant.employees, 0),
};
