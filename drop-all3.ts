import { getDb } from "./api/queries/connection";
async function main() {
  const db = getDb();
  await db.execute("SET FOREIGN_KEY_CHECKS = 0");
  const [tables] = await db.execute("SHOW TABLES") as any[];
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    console.log("Dropping:", tableName);
    await db.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
  }
  await db.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Done");
}
main();
