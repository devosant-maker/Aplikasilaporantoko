import { getDb } from "./api/queries/connection";
async function main() {
  const db = getDb();
  await db.execute("DROP TABLE IF EXISTS users");
  console.log("All dropped");
}
main();
