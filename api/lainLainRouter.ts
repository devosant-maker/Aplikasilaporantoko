import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findLainLainByHariKerja,
  createLainLain,
  updateLainLain,
  deleteLainLain,
} from "./queries/lainLain";

export const lainLainRouter = createRouter({
  byHariKerja: publicQuery
    .input(z.object({ hariKerjaId: z.number() }))
    .query(({ input }) => findLainLainByHariKerja(input.hariKerjaId)),

  create: publicQuery
    .input(
      z.object({
        hariKerjaId: z.number(),
        noUrut: z.number(),
        keterangan: z.string().min(1),
        saldoMasukCash: z.string().optional(),
        saldoKeluarCash: z.string().optional(),
        saldoMasukNonTunai: z.string().optional(),
        saldoKeluarNonTunai: z.string().optional(),
        metodePembayaran: z.string().optional(),
        catatan: z.string().optional(),
      })
    )
    .mutation(({ input }) => createLainLain(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        keterangan: z.string().optional(),
        saldoMasukCash: z.string().optional(),
        saldoKeluarCash: z.string().optional(),
        saldoMasukNonTunai: z.string().optional(),
        saldoKeluarNonTunai: z.string().optional(),
        metodePembayaran: z.string().optional(),
        catatan: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateLainLain(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteLainLain(input.id)),
});
