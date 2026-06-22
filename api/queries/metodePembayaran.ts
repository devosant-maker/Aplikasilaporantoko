import { getDb } from "./connection";
import { metodePembayaran } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findAllMetodePembayaran() {
  return getDb().select().from(metodePembayaran).orderBy(metodePembayaran.nama);
}

export async function findMetodePembayaranAktif() {
  return getDb()
    .select()
    .from(metodePembayaran)
    .where(eq(metodePembayaran.aktif, true))
    .orderBy(metodePembayaran.nama);
}

export async function createMetodePembayaran(data: {
  nama: string;
  jenis: "tunai" | "non_tunai";
}) {
  const [result] = await getDb()
    .insert(metodePembayaran)
    .values(data)
    .$returningId();
  return getDb().query.metodePembayaran.findFirst({
    where: eq(metodePembayaran.id, result.id),
  });
}

export async function deleteMetodePembayaran(id: number) {
  await getDb()
    .update(metodePembayaran)
    .set({ aktif: false })
    .where(eq(metodePembayaran.id, id));
}
