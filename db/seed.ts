import { getDb } from "../api/queries/connection";

async function seed() {
  console.log("Seed data complete.");
}

seed().catch(console.error);
