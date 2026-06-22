import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllMember,
  findMemberAktif,
  createMember,
  updateMember,
  deleteMember,
} from "./queries/member";

export const memberRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(({ input }) => findAllMember(input?.search)),

  aktif: publicQuery.query(() => findMemberAktif()),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        noHp: z.string().optional(),
        diskonPersen: z.number().min(0).max(100).optional(),
        diskonRupiah: z.number().min(0).optional(),
        keterangan: z.string().optional(),
      })
    )
    .mutation(({ input }) => createMember(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        noHp: z.string().optional(),
        diskonPersen: z.number().min(0).max(100).optional(),
        diskonRupiah: z.number().min(0).optional(),
        keterangan: z.string().optional(),
        aktif: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateMember(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteMember(input.id)),
});
