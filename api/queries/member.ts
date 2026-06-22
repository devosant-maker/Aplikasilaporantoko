import { getDb } from "./connection";
import { member } from "@db/schema";
import { eq, like } from "drizzle-orm";

export async function findAllMember(search?: string) {
  if (search) {
    return getDb()
      .select()
      .from(member)
      .where(like(member.nama, `%${search}%`))
      .orderBy(member.nama);
  }
  return getDb().select().from(member).orderBy(member.nama);
}

export async function findMemberAktif() {
  return getDb()
    .select()
    .from(member)
    .where(eq(member.aktif, true))
    .orderBy(member.nama);
}

export async function findMemberById(id: number) {
  return getDb().query.member.findFirst({
    where: eq(member.id, id),
  });
}

export async function createMember(data: {
  nama: string;
  noHp?: string;
  diskonPersen?: number;
  diskonRupiah?: number;
  keterangan?: string;
}) {
  const [result] = await getDb().insert(member).values(data).$returningId();
  return findMemberById(result.id);
}

export async function updateMember(
  id: number,
  data: {
    nama?: string;
    noHp?: string;
    diskonPersen?: number;
    diskonRupiah?: number;
    keterangan?: string;
    aktif?: boolean;
  }
) {
  await getDb().update(member).set(data).where(eq(member.id, id));
  return findMemberById(id);
}

export async function deleteMember(id: number) {
  await getDb().update(member).set({ aktif: false }).where(eq(member.id, id));
}
