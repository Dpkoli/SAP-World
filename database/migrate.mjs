import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import pg from "pg";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run database migrations.");
}

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
const schema = await readFile(schemaPath, "utf8");
const pool = new pg.Pool({
  connectionString,
  max: 1,
  application_name: "sap-world-migration",
});

try {
  await pool.query(schema);
  console.log("SAP World database schema is current.");
} finally {
  await pool.end();
}
