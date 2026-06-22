import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllPegawai,
  findPegawaiById,
  findPegawaiByUsername,
  createPegawai,
  updatePegawai,
  deletePegawai,
} from "./queries/pegawai";

export const pegawaiRouter = createRouter({
  list: publicQuery.query(() => findAllPegawai()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findPegawaiById(input.id)),

  byUsername: publicQuery
    .input(z.object({ username: z.string() }))
    .query(({ input }) => findPegawaiByUsername(input.username)),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        username: z.string().min(3),
        password: z.string().min(4),
        noHp: z.string().optional(),
      })
    )
    .mutation(({ input }) => createPegawai(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        noHp: z.string().optional(),
        aktif: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updatePegawai(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePegawai(input.id)),
});
