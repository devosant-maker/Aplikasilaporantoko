import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findOperasionalByHariKerja,
  createOperasional,
  updateOperasional,
  deleteOperasional,
} from "./queries/operasional";

export const operasionalRouter = createRouter({
  byHariKerja: publicQuery
    .input(z.object({ hariKerjaId: z.number() }))
    .query(({ input }) => findOperasionalByHariKerja(input.hariKerjaId)),

  create: publicQuery
    .input(
      z.object({
        hariKerjaId: z.number(),
        noUrut: z.number(),
        keterangan: z.string().min(1),
        nominal: z.string(),
        catatan: z.string().optional(),
      })
    )
    .mutation(({ input }) => createOperasional(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        keterangan: z.string().optional(),
        nominal: z.string().optional(),
        catatan: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateOperasional(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteOperasional(input.id)),
});
