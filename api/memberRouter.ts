import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findAllMember,
  findMemberById,
  createMember,
  updateMember,
  deleteMember,
} from "./queries/member";

export const memberRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllMember(input)),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findMemberById(input.id)),

  create: authedQuery
    .input(
      z.object({
        nama: z.string().min(1),
        noHp: z.string().min(10),
        email: z.string().email().optional(),
        diskonRupiah: z.number().min(0).optional(),
      })
    )
    .mutation(({ input }) => createMember(input)),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        noHp: z.string().optional(),
        email: z.string().email().optional(),
        diskonRupiah: z.number().min(0).optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateMember(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteMember(input.id)),
});
