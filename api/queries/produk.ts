import { getDb } from "./connection";
import { produk } from "@db/schema";
import { eq, like, or, desc } from "drizzle-orm";

export async function findAllProduk(filters?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const offset = (page - 1) * limit;
  const search = filters?.search;

  let query = getDb().select().from(produk);

  if (search) {
    query = query.where(
      or(
        like(produk.nama, `%${search}%`),
        like(produk.kategori ?? "", `%${search}%`)
      )
    );
  }

  return query
    .orderBy(desc(produk.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findProdukById(id: number) {
  return getDb().query.produk.findFirst({
    where: eq(produk.id, id),
  });
}

export async function createProduk(data: {
  nama: string;
  hargaDefault: number;
  stok: number;
  kategori?: string;
}) {
  const [result] = await getDb().insert(produk).values(data).$returningId();
  return findProdukById(result.id);
}

export async function updateProduk(
  id: number,
  data: { nama?: string; hargaDefault?: number; stok?: number; kategori?: string }
) {
  await getDb().update(produk).set(data).where(eq(produk.id, id));
  return findProdukById(id);
}

export async function deleteProduk(id: number) {
  await getDb().update(produk).set({ aktif: false }).where(eq(produk.id, id));
}
