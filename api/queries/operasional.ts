import { getDb } from "./connection";
import { operasional } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findOperasionalByHariKerja(hariKerjaId: number) {
  return getDb()
    .select()
    .from(operasional)
    .where(eq(operasional.hariKerjaId, hariKerjaId))
    .orderBy(operasional.noUrut);
}

export async function createOperasional(data: {
  hariKerjaId: number;
  noUrut: number;
  keterangan: string;
  nominal: string;
  catatan?: string;
}) {
  await getDb().insert(operasional).values(data);
}

export async function updateOperasional(
  id: number,
  data: { keterangan?: string; nominal?: string; catatan?: string }
) {
  await getDb().update(operasional).set(data).where(eq(operasional.id, id));
}

export async function deleteOperasional(id: number) {
  await getDb().delete(operasional).where(eq(operasional.id, id));
}
