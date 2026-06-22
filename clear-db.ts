import { getDb } from "./api/queries/connection";
import { metodePembayaran, produk, pegawai } from "./db/schema";
async function main() {
  await getDb().delete(metodePembayaran);
  await getDb().delete(produk);
  await getDb().delete(pegawai);
  console.log("cleared");
}
main();
