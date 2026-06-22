import { getDb } from "./connection";
import { produk } from "@db/schema";
import { eq, like } from "drizzle-orm";

export async function findAllProduk(search?: string) {
  if (search) {
    return getDb()
      .select()
      .from(produk)
      .where(like(produk.nama, `%${search}%`))
      .orderBy(produk.nama);
  }
  return getDb().select().from(produk).orderBy(produk.nama);
}

export async function findProdukAktif() {
  return getDb()
    .select()
    .from(produk)
    .where(eq(produk.aktif, true))
    .orderBy(produk.nama);
}

export async function findProdukById(id: number) {
  return getDb().query.produk.findFirst({
    where: eq(produk.id, id),
  });
}

export async function createProduk(data: { nama: string; kategori?: string; hargaDefault?: number }) {
  const [result] = await getDb().insert(produk).values(data).$returningId();
  return findProdukById(result.id);
}

export async function updateProduk(
  id: number,
  data: { nama?: string; kategori?: string; hargaDefault?: number; aktif?: boolean }
) {
  await getDb().update(produk).set(data).where(eq(produk.id, id));
  return findProdukById(id);
}

export async function deleteProduk(id: number) {
  await getDb().update(produk).set({ aktif: false }).where(eq(produk.id, id));
}
