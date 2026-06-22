import { getDb } from "./api/queries/connection";
async function main() {
  const db = getDb();
  await db.execute("DROP TABLE IF EXISTS lain_lain");
  await db.execute("DROP TABLE IF EXISTS barang_masuk");
  await db.execute("DROP TABLE IF EXISTS operasional");
  await db.execute("DROP TABLE IF EXISTS barang_keluar");
  await db.execute("DROP TABLE IF EXISTS hari_kerja");
  await db.execute("DROP TABLE IF EXISTS metode_pembayaran");
  await db.execute("DROP TABLE IF EXISTS member");
  await db.execute("DROP TABLE IF EXISTS produk");
  await db.execute("DROP TABLE IF EXISTS pegawai");
  console.log("All tables dropped");
}
main();
