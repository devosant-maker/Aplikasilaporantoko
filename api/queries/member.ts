import { getDb } from "./connection";
import { member } from "@db/schema";
import { eq, like, or, desc } from "drizzle-orm";

export async function findAllMember(filters?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const offset = (page - 1) * limit;
  const search = filters?.search;

  let query = getDb().select().from(member);

  if (search) {
    query = query.where(
      or(
        like(member.nama, `%${search}%`),
        like(member.noHp, `%${search}%`),
        like(member.email ?? "", `%${search}%`)
      )
    );
  }

  return query
    .orderBy(desc(member.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findMemberById(id: number) {
  return getDb().query.member.findFirst({
    where: eq(member.id, id),
  });
}

export async function createMember(data: {
  nama: string;
  noHp: string;
  email?: string;
  diskonRupiah?: number;
}) {
  const [result] = await getDb().insert(member).values(data).$returningId();
  return findMemberById(result.id);
}

export async function updateMember(
  id: number,
  data: { nama?: string; noHp?: string; email?: string; diskonRupiah?: number }
) {
  await getDb().update(member).set(data).where(eq(member.id, id));
  return findMemberById(id);
}

export async function deleteMember(id: number) {
  await getDb().update(member).set({ aktif: false }).where(eq(member.id, id));
}
